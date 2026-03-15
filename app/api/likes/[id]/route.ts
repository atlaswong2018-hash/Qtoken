import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// DELETE - 取消点赞
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

    // 查找点赞记录
    const like = await prisma.like.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    })

    if (!like) {
      return NextResponse.json(
        { error: { message: '点赞记录不存在' } },
        { status: 404 }
      )
    }

    // 检查权限：只有点赞者本人可以取消
    if (like.userId !== session.user.id) {
      return NextResponse.json(
        { error: { message: '没有权限取消此点赞' } },
        { status: 403 }
      )
    }

    // 删除点赞
    await prisma.like.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, liked: false })
  } catch (error) {
    console.error('取消点赞错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
