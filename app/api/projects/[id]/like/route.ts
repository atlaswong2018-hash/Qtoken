// app/api/projects/[id]/like/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

// GET - 检查是否已点赞
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id
        }
      }
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('检查点赞状态错误:', error)
    return NextResponse.json({ liked: false })
  }
}

// POST - 点赞/取消点赞
export async function POST(
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

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { error: { message: '项目不存在' } },
        { status: 404 }
      )
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      // 更新项目点赞数
      const updatedProject = await prisma.project.update({
        where: { id: params.id },
        data: { likes: { decrement: 1 } }
      })

      return NextResponse.json({ liked: false, likes: updatedProject.likes })
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId: session.user.id,
          projectId: params.id
        }
      })

      // 更新项目点赞数
      const updatedProject = await prisma.project.update({
        where: { id: params.id },
        data: { likes: { increment: 1 } }
      })

      return NextResponse.json({ liked: true, likes: updatedProject.likes })
    }
  } catch (error) {
    console.error('点赞操作错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
