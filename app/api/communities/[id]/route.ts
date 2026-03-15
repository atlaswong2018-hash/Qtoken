import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 获取社区详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        owner: {
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
            members: true,
            posts: true
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json(
        { error: { message: '社区不存在' } },
        { status: 404 }
      )
    }

    // 检查私密社区权限
    if (community.isPrivate) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          { error: { message: '需要登录才能查看此社区' } },
          { status: 401 }
        )
      }

      // 检查用户等级要求
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

      // 检查是否为社区成员
      const isMember = await prisma.communityMember.findFirst({
        where: {
          userId: session.user.id,
          communityId: id
        }
      })

      if (!isMember && session.user.id !== community.ownerId) {
        return NextResponse.json(
          { error: { message: '需要是社区成员才能查看' } },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error('获取社区详情错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除社区
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = params

    // 查找社区
    const community = await prisma.community.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true
      }
    })

    if (!community) {
      return NextResponse.json(
        { error: { message: '社区不存在' } },
        { status: 404 }
      )
    }

    // 检查权限：只有社区所有者或管理员可以删除
    const isAdmin = await prisma.userTier.findFirst({
      where: {
        id: session.user.tierId || undefined,
        permissions: {
          has: 'manage_communities'
        }
      }
    })

    if (community.ownerId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: { message: '没有权限删除此社区' } },
        { status: 403 }
      )
    }

    // 删除社区
    await prisma.community.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除社区错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
