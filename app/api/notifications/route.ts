import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// GET - 获取通知列表
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    const where: any = { userId: session.user.id }
    if (unreadOnly) where.read = false

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取通知列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建通知（内部使用）
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, content } = body

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        read: false
      }
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('创建通知错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
