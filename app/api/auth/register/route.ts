import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: { message: '该邮箱已被注册' } },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: { message: '该用户名已被使用' } },
        { status: 400 }
      )
    }

    // 密码哈希
    const hashedPassword = await hashPassword(validatedData.password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        tierId: '1' // 默认为新用户等级
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      {
        message: '注册成功',
        user
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册错误:', error)

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
