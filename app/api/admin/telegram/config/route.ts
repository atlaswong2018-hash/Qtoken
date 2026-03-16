import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { getEnabledConfig, testTelegramConnection } from '@/lib/telegram'

// GET - 获取 Telegram 配置
export async function GET() {
  try {
    const config = await getEnabledConfig()

    if (!config) {
      return NextResponse.json({
        configured: false
      })
    }

    return NextResponse.json({
      configured: true,
      channelId: config.channelId,
      enabled: config.enabled
    })
  } catch (error) {
    console.error('获取 Telegram 配置错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 更新 Telegram 配置
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
    const { botToken, channelId, enabled } = body

    if (!botToken || !channelId) {
      return NextResponse.json(
        { error: { message: 'Bot Token 和 Channel ID 不能为空' } },
        { status: 400 }
      )
    }

    // 更新或创建配置
    const config = await prisma.telegramConfig.upsert({
      where: { botToken },
      update: { channelId, enabled: enabled ?? true },
      create: {
        botToken,
        channelId,
        enabled: enabled ?? true
      }
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('更新 Telegram 配置错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 测试连接
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { botToken } = body

    if (!botToken) {
      return NextResponse.json(
        { error: { message: 'Bot Token 不能为空' } },
        { status: 400 }
      )
    }

    // 测试连接
    const result = await testTelegramConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error('测试 Telegram 连接错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
