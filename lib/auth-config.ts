import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import { hashPassword, verifyPassword } from './auth'

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
    avatar?: string
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
      avatar?: string
      email?: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('邮箱和密码不能为空')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            passwordHash: true
          }
        })

        if (!user) {
          throw new Error('邮箱不存在')
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('密码错误')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 1000 // 30 天
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.username = user.name as string
        token.avatar = user.image as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username
        session.user.avatar = token.avatar
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  }
})
