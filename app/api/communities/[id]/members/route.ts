import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const memberSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin']).optional()
})

// GET - 获取社区成员列表
export async function GET(
  request: Request,
  context: any
) {
  try {
    const { id: communityId } = await context.params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where: { communityId },
        skip,
        take: limit,
        include: {
          user: {
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
        orderBy: { joinedAt: 'desc' }
      }),
      prisma.communityMember.count({ where: { communityId } })
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取社区成员列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 加入社区
export async function POST(
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

    const { id: communityId } = await context.params

    // 检查社区是否存在
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        isPrivate: true,
        minTierRequired: true,
        ownerId: true
      }
    })

    if (!community) {
      return NextResponse.json(
        { error: { message: '社区不存在' } },
        { status: 404 }
      )
    }

    // 检查是否已经是成员
    const existingMember = await prisma.communityMember.findFirst({
      where: {
        userId: session.user.id,
        communityId
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: { message: '已经是社区成员' } },
        { status: 400 }
      )
    }

    // 检查等级要求
    if (community.minTierRequired) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          tier: {
            select: { level: true }
  }
}
      })

      const userLevel = currentUser?.tier?.level || 0
      if (userLevel < community.minTierRequired) {
        return NextResponse.json(
          { error: { message: `需要 ${community.minTierRequired} 级以上才能加入此社区` } },
          { status: 403 }
        )
      }
    }

    // 创建成员
    const member = await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId,
        role: 'member'
      },
      include: {
        user: {
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

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('加入社区错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 退出社区
export async function DELETE(
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

    const { id: communityId } = await context.params

    // 查找成员记录
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: session.user.id,
        communityId
      },
      include: {
        community: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: { message: '不是社区成员' } },
        { status: 404 }
      )
    }

    // 社区所有者不能退出
    if (member.community.ownerId === session.user.id) {
      return NextResponse.json(
        { error: { message: '社区所有者不能退出，请先转让社区' } },
        { status: 400 }
      )
    }

    // 删除成员
    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('退出社区错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
