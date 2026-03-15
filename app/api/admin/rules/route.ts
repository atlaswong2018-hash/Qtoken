import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ruleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容最多 2000 字符'),
  category: z.enum(['general', 'posting', 'behavior', 'privacy']),
  order: z.number().int().min(0, '顺序不能为负数'),
  active: z.boolean().optional()
})

const CATEGORY_NAMES = {
  general: '通用规则',
  posting: '发帖规则',
  behavior: '行为规范',
  privacy: '隐私保护'
}

// GET - 获取所有规则
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (category) {
      where.category = category
    }
    if (activeOnly) {
      where.active = true
    }

    const rules = await prisma.communityRule.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('获取规则列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新规则
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
    const validatedData = ruleSchema.parse(body)

    const rule = await prisma.communityRule.create({
      data: validatedData
    })

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error('创建规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 更新规则
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
    const validatedData = ruleSchema.partial().parse(body)

    const rule = await prisma.communityRule.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('更新规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除规则
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

    await prisma.communityRule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
