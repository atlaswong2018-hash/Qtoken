// app/api/communities/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

// GET - 获取社区列表
export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { memberCount: 'desc' }
    })

    return NextResponse.json({ communities })
  } catch (error) {
    console.error('获取社区列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新社区（管理员功能，简化处理）
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
    const { name, description, slug } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: { message: '社区名称不能为空' } },
        { status: 400 }
      )
    }

    const existingCommunity = await prisma.community.findUnique({
      where: { name: name }
    })

    if (existingCommunity) {
      return NextResponse.json(
        { error: { message: '社区名称已存在' } },
        { status: 409 }
      )
    }

    const community = await prisma.community.create({
      data: {
        name,
        description: description || null,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }
    })

    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('创建社区错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
