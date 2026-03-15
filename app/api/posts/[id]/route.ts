import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 获取帖子详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: { message: '帖子不存在' } },
        { status: 404 }
      )
    }

    // 检查权限
    const session = await auth()
    if (post.isPrivate) {
      if (!session?.user) {
        return NextResponse.json(
          { error: { message: '需要登录才能查看此帖子' } },
          { status: 401 }
        )
      }

      // 检查用户等级要求
      if (post.minTierRequired) {
        const currentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            tier: {
              select: { level: true }
            }
          }
        })

        const userLevel = currentUser?.tier?.level || 0
        if (userLevel < post.minTierRequired) {
          return NextResponse.json(
            { error: { message: `需要 ${post.minTierRequired} 级以上才能查看此帖子` } },
            { status: 403 }
          )
        }
      }
    }

    // 增加浏览次数
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('获取帖子详情错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 更新帖子
export async function PUT(
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
    const body = await request.json()

    // 查找帖子
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: { message: '帖子不存在' } },
        { status: 404 }
      )
    }

    // 检查权限：只有作者或管理员可以编辑
    const isAdmin = await prisma.userTier.findFirst({
      where: {
        id: session.user.tierId || undefined,
        permissions: {
          has: 'manage_content'
        }
      }
    })

    if (post.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: { message: '没有权限编辑此帖子' } },
        { status: 403 }
      )
    }

    // 更新帖子
    const updatedPost = await prisma.post.update({
      where: { id },
      data: body,
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

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('更新帖子错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除帖子
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

    // 查找帖子
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: { message: '帖子不存在' } },
        { status: 404 }
      )
    }

    // 检查权限：只有作者或管理员可以删除
    const isAdmin = await prisma.userTier.findFirst({
      where: {
        id: session.user.tierId || undefined,
        permissions: {
          has: 'manage_content'
        }
      }
    })

    if (post.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: { message: '没有权限删除此帖子' } },
        { status: 403 }
      )
    }

    // 删除帖子
    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除帖子错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
