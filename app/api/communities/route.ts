import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { z } from 'zod'

const communitySchema = z.object({
  name: z.string().min(1, '社区名称不能为空').max(100, '社区名称最多100字符'),
  description: z.string().max(500, '描述最多500字符').optional(),
  avatar: z.string().url('头像必须是有效的URL').optional(),
  isPrivate: z.boolean().optional(),
  minTierRequired: z.number().int().min(0).optional()
})

// GET - 获取社区列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}

    // 搜索功能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              members: true,
              posts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.community.count({ where })
    ])

    return NextResponse.json({
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取社区列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新社区
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
    const validatedData = communitySchema.parse(body)

    const community = await prisma.community.create({
      data: {
        ...validatedData,
        ownerId: session.user.id
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    })

    // 创建者自动成为社区成员
    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
        role: 'owner'
      }
    })

    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('创建社区错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
