import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// PUT - 标记所有通知为已读
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: { message: '没有权限操作此用户的通知' } },
        { status: 403 }
      )
    }

    // 标记所有未读通知为已读
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({
      success: true,
      count: result.count
    })
  } catch (error) {
    console.error('标记所有通知为已读错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
