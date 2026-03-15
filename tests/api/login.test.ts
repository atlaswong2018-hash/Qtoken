import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { signIn } from '@/lib/auth-config'
import { factories } from '../../factories'

vi.mock('@/lib/auth-config', () => ({
  signIn: vi.fn(),
}))

describe('POST /api/auth/login - 系统化测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该使用有效的凭据成功登录', async () => {
    const user = factories.user({
      email: 'test@example.com',
      username: 'testuser',
    })

    vi.mocked(signIn).mockResolvedValue({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(user.email)
  })

  it('应该拒绝无效的邮箱格式', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('应该拒绝空密码', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('应该处理认证失败', async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: '邮箱或密码错误',
    })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })

  it('应该处理缺失的字段', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('应该处理服务器错误', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Database connection failed'))

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })

  it('应该批量处理多个登录请求', async () => {
    const users = factories.users(5)

    for (const user of users) {
      vi.clearAllMocks()
      vi.mocked(signIn).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      })

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          password: 'TestPass123!',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }
  })
})
