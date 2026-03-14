// app/api/comments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { content, projectId, postId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '评论内容不能为空' } },
        { status: 400 }
      )
    }

    if (!projectId && !postId) {
      return NextResponse.json(
        { error: { message: '必须指定项目或帖子' } },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        projectId: projectId || null,
        postId: postId || null
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('创建评论错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
