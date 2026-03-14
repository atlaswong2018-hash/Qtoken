// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { signIn } from '@/lib/auth-config'
import { loginSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证输入
    const validatedData = loginSchema.parse(body)

    // 使用 NextAuth 登录
    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false
    })

    if (result?.error) {
      return NextResponse.json(
        { error: { message: result.error } },
        { status: 401 }
      )
    }

    // 获取用户信息
    // 这里需要从 session 获取用户信息，简化处理
    return NextResponse.json({
      success: true,
      message: '登录成功'
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { message: '输入验证失败' } },
        { status: 400 }
      )
    }

    console.error('登录错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
