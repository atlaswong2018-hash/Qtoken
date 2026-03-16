import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// POST - 点赞项目
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

    const { id: projectId } = await context.params

    // 检查是否已点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        projectId
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      return NextResponse.json({ liked: false })
    } else {
      // 创建点赞
      const like = await prisma.like.create({
        data: {
          userId: session.user.id,
          projectId
        }
      })
      return NextResponse.json({ liked: true, like })
    }
  } catch (error) {
    console.error('点赞错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
