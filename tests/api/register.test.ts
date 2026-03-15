import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'
import { factories, generateTestEmail, generateTestUsername } from '../factories'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('POST /api/auth/register - 系统化测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该成功注册新用户', async () => {
    const userData = factories.user()
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: userData.id,
      email: userData.email,
      username: userData.username,
    } as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe(userData.email)
  })

  it('应该拒绝已存在的邮箱', async () => {
    const existingUser = factories.user()
    vi.mocked(prisma.user.findFirst).mockResolvedValue(existingUser as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: existingUser.email,
        username: 'newuser',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toContain('邮箱或用户名已存在')
  })

  it('应该拒绝已存在的用户名', async () => {
    // 使用一个有效的用户名格式
    const existingUser = {
      id: '1',
      email: 'existing@example.com',
      username: 'existinguser',
    }
    vi.mocked(prisma.user.findFirst).mockResolvedValue(existingUser as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        username: 'existinguser',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toBe('邮箱或用户名已存在')
  })

  it('应该拒绝无效的用户名（太短）', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: generateTestEmail(),
        username: 'ab',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('应该拒绝无效的用户名（包含特殊字符）', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: generateTestEmail(),
        username: 'user@name!',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('应该拒绝无效的邮箱格式', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        username: generateTestUsername(),
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('应该拒绝弱密码', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: generateTestEmail(),
        username: generateTestUsername(),
        password: '123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('应该拒绝缺少必填字段', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: generateTestEmail(),
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('应该批量注册多个用户', async () => {
    // 简单测试批量注册功能
    const users = [
      { email: 'user1@test.com', username: 'user1' },
      { email: 'user2@test.com', username: 'user2' },
    ]
    
    for (const user of users) {
      vi.clearAllMocks()
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: '1',
        email: user.email,
        username: user.username,
      } as any)

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          password: 'TestPass123!',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    }
  })
})
