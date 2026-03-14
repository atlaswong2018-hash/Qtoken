import { describe, it, expect, vi } from 'vitest'
import { sendProjectToTelegram, testTelegramConnection } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    telegramConfig: {
      findFirst: vi.fn()
    }
  }
}))

vi.mock('node-telegram-bot-api', () => ({
  default: class MockTelegramBot {
    constructor(token: string) {
      if (!token) throw new Error('Token is required')
    }
    async sendMessage() { return { message_id: '123' } }
    async getMe() { return { id: 123, first_name: 'Test Bot' } }
  }
}))

describe('Telegram Bot', () => {
  it('should send project to Telegram channel', async () => {
    vi.mocked(prisma.telegramConfig.findFirst).mockResolvedValue({
      id: '1',
      botToken: 'test-token',
      channelId: '@test-channel',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const project = {
      id: '1',
      title: 'Test Project',
      description: 'A test project',
      author: { username: 'testuser' },
      tags: ['ai', 'ml'],
      githubUrl: 'https://github.com/test/project'
    }

    const result = await sendProjectToTelegram(project)
    expect(result).toBe(true)
  })

  it('should test Telegram connection', async () => {
    vi.mocked(prisma.telegramConfig.findFirst).mockResolvedValue({
      id: '1',
      botToken: 'test-token',
      channelId: '@test-channel',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const result = await testTelegramConnection()
    expect(result.success).toBe(true)
    expect(result.message).toBe('Telegram Bot 连接成功')
  })
})
