// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { sendPostToTelegram } from '@/lib/telegram'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const communityId = searchParams.get('communityId')

    const skip = (page - 1) * limit
    const where: any = {
      communityId: { equals: communityId }
    }

    // 获取帖子列表
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          community: {
            select: {
              name: true
            }
          },
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取帖子列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { title, content, communityId } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '标题不能为空' } },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '内容不能为空' } },
        { status: 400 }
      )
    }

    if (!communityId) {
      return NextResponse.json(
        { error: { message: '社区 ID 不能为空' } },
        { status: 400 }
      )
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId }
    })

    if (!community) {
      return NextResponse.json(
        { error: { message: '社区不存在' } },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        communityId: community.id
      }
    })

    // 异步发送到 Telegram 频道
    sendPostToTelegram({
      id: post.id,
      title: post.title,
      content: post.content,
      author: { username: session.user.username },
      community: { name: community.name }
    }).catch(err => {
      console.error('发送到 Telegram 失败:', err)
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('创建帖子错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
