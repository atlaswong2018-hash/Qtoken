import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn()
    }
  }
}))

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser'
    }

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return 400 if user already exists', async () => {
    const existingUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser'
    }

    vi.mocked(prisma.user.findFirst).mockResolvedValue(existingUser as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
