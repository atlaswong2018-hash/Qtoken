import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容最多2000字符'),
  communityId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  minTierRequired: z.number().int().min(0).optional()
})

// GET - 获取帖子列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const communityId = searchParams.get('communityId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}

    // 社区筛选
    if (communityId) {
      where.communityId = communityId
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

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
              avatar: true,
              tier: {
                select: {
                  name: true,
                  level: true,
                  color: true
                }
              }
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
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

// POST - 创建新帖子
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
    const validatedData = postSchema.parse(body)

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id
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
        },
        community: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
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
