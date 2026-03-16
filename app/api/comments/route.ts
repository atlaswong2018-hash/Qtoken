import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(500, '评论最多500字符'),
  projectId: z.string().optional(),
  postId: z.string().optional()
}).refine(data => data.projectId || data.postId, {
  message: '必须指定项目或帖子ID'
})

// GET - 获取评论列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (postId) where.postId = postId

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              tier: {
                select: {
                  name: true,
                  level: true,
                  color: true
                }
  }
}
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where })
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取评论列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新评论
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        authorId: session.user.id,
        projectId: validatedData.projectId,
        postId: validatedData.postId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            tier: {
              select: {
                name: true,
                level: true,
                color: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('创建评论错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
