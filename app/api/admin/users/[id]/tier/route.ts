import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateTierSchema = z.object({
  tierId: z.string().min(1, '等级ID不能为空')
})

// PUT - 更新用户等级
export async function PUT(
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

    // 检查是否为管理员
    const isAdmin = await prisma.userTier.findFirst({
      where: {
        id: session.user.tierId || undefined,
        permissions: {
          has: 'manage_users'
        }
      }
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: { message: '需要管理员权限' } },
        { status: 403 }
      )
    }

    const { id: userId } = await context.params
    const body = await request.json()
    const { tierId } = updateTierSchema.parse(body)

    // 验证目标等级是否存在
    const targetTier = await prisma.userTier.findUnique({
      where: { id: tierId }
    })

    if (!targetTier) {
      return NextResponse.json(
        { error: { message: '目标等级不存在' } },
        { status: 404 }
      )
    }

    // 更新用户等级
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tierId },
      include: {
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('更新用户等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
