import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { auth } from '@/lib/auth-config'
import { sendProjectToTelegram } from '@/lib/telegram'

// GET - 获取项目列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const includePrivate = searchParams.get('includePrivate') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}

    // 标签筛选
    if (tag) {
      where.tags = {
        has: tag
      }
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 私密内容筛选
    if (includePrivate) {
      const session = await auth()
      if (!session?.user) {
        // 未登录用户只能查看公开内容
        where.isPrivate = false
      } else {
        // 已登录用户检查权限
        const canAccessPrivate = await prisma.userTier.findFirst({
          where: {
            id: session.user.tierId || undefined,
            permissions: {
              has: 'view_private_content'
            }
          }
        })

        if (!canAccessPrivate) {
          where.isPrivate = false
        }
      }
    }

    // 获取项目列表
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
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
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取项目列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新项目
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
    const validatedData = projectSchema.parse(body)

    const project = await prisma.project.create({
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
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    // 异步发送到 Telegram
    sendProjectToTelegram({
      id: project.id,
      title: project.title,
      description: project.description,
      author: {
        username: project.author.username
      },
      tags: project.tags,
      githubUrl: project.githubUrl
    }).catch(err => {
      console.error('发送到 Telegram 失败:', err)
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('创建项目错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
