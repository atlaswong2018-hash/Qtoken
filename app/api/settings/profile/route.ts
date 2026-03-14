// app/api/settings/profile/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

// PATCH - 更新用户个人资料
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, email } = body

    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '用户名不能为空' } },
        { status: 400 }
      )
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '邮箱不能为空' } },
        { status: 400 }
      )
    }

    // 检查用户名是否已被其他用户使用
    if (username !== session.user.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: { message: '用户名已被使用' } },
          { status: 409 }
        )
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: { message: '邮箱已被使用' } },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        email
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('更新个人资料错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
