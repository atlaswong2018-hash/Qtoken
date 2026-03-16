import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// PUT - 标记通知为已读
export async function PUT(
  request: Request,
  context: any
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // 查找通知
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: { message: '通知不存在' } },
        { status: 404 }
      )
    }

    // 检查权限：只能标记自己的通知
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: { message: '没有权限操作此通知' } },
        { status: 403 }
      )
    }

    // 标记为已读
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    return NextResponse.json({ notification: updatedNotification })
  } catch (error) {
    console.error('标记通知为已读错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
