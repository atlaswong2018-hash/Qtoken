import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { signIn } from '@/lib/auth-config'

vi.mock('@/lib/auth-config', () => ({
  signIn: vi.fn()
}))

describe('POST /api/auth/login', () => {
  it('should login successfully with correct credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: '$2a$10$hash...'
    }

    vi.mocked(signIn).mockResolvedValue({ user: mockUser })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return 401 for invalid credentials', async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: '邮箱或密码错误'
    })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })
})
