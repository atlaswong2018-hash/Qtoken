import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// DELETE - 删除评论
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

    const { id } = await context.params

    // 查找评论
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: { message: '评论不存在' } },
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

    if (comment.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: { message: '没有权限删除此评论' } },
        { status: 403 }
      )
    }

    // 删除评论
    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除评论错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
