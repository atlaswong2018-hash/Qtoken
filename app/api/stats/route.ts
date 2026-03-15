// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 并行获取所有统计数据
    const [projectCount, communityCount, userCount, postCount] = await Promise.all([
      prisma.project.count(),
      prisma.community.count(),
      prisma.user.count(),
      prisma.post.count()
    ])

    const stats = {
      projects: projectCount,
      communities: communityCount,
      users: userCount,
      posts: postCount,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
