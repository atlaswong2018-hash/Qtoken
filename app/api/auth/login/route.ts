import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'
import { verifyPassword } from '@/lib/auth'
import { signIn } from '@/lib/auth-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        passwordHash: true,
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
            permissions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: { message: '邮箱或密码错误' } },
        { status: 401 }
      )
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: { message: '邮箱或密码错误' } },
        { status: 401 }
      )
    }

    // 使用 NextAuth 进行登录
    const result = await signIn('credentials', {
      email: user.email,
      password: validatedData.password,
      redirect: false
    })

    if (result?.error) {
      return NextResponse.json(
        { error: { message: '登录失败' } },
        { status: 500 }
      )
    }

    // 返回用户信息（不包含密码）
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: '登录成功',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('登录错误:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { message: '输入数据格式错误' } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
