import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const likeSchema = z.object({
  projectId: z.string().optional(),
  postId: z.string().optional()
}).refine(data => data.projectId || data.postId, {
  message: '必须指定项目或帖子ID'
})

// POST - 添加点赞
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
    const validatedData = likeSchema.parse(body)

    // 检查是否已点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        AND: [
          { projectId: validatedData.projectId || null },
          { postId: validatedData.postId || null }
        ]
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: { message: '已经点赞过了' } },
        { status: 400 }
      )
    }

    // 创建点赞
    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        postId: validatedData.postId
      }
    })

    return NextResponse.json({ like, liked: true }, { status: 201 })
  } catch (error) {
    console.error('点赞错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
