import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 获取用户详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
            description: true,
            permissions: true
          }
        },
        _count: {
          select: {
            projects: true,
            posts: true,
            comments: true,
            likes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: { message: '用户不存在' } },
        { status: 404 }
      )
    }

    // 移除密码信息，只返回必要的数据
    const { password: _, ...userWithoutPassword } = user as any

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('获取用户详情错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
