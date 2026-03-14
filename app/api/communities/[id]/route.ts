// app/api/communities/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const community = await prisma.community.findUnique({
      where: { id: params.id }
    })

    if (!community) {
      return NextResponse.json(
        { error: { message: '社区不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error('获取社区详情错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
