import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const tierSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50, '名称最多 50 字符'),
  level: z.number().int().positive('等级必须为正整数'),
  description: z.string().max(500, '描述最多 500 字符').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '颜色格式不正确').optional(),
  icon: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional()
})

// GET - 获取所有等级
export async function GET() {
  try {
    const tiers = await prisma.userTier.findMany({
      orderBy: { level: 'asc' }
    })

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error('获取等级列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新等级
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
    const validatedData = tierSchema.parse(body)

    // 检查等级是否已存在
    const existingTier = await prisma.userTier.findUnique({
      where: { level: validatedData.level }
    })

    if (existingTier) {
      return NextResponse.json(
        { error: { message: '该等级已存在' } },
        { status: 400 }
      )
    }

    const tier = await prisma.userTier.create({
      data: {
        ...validatedData,
        permissions: validatedData.permissions || []
      }
    })

    return NextResponse.json({ tier }, { status: 201 })
  } catch (error) {
    console.error('创建等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 更新等级
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

    const { id } = await context.params
    const body = await request.json()
    const validatedData = tierSchema.partial().parse(body)

    const tier = await prisma.userTier.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ tier })
  } catch (error) {
    console.error('更新等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除等级
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

    // 检查是否有用户使用该等级
    const usersWithTier = await prisma.user.count({
      where: { tierId: id }
    })

    if (usersWithTier > 0) {
      return NextResponse.json(
        { error: { message: '无法删除，有用户正在使用该等级' } },
        { status: 400 }
      )
    }

    await prisma.userTier.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
