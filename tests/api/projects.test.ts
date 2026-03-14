import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/projects/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      count: vi.fn()
    }
  }
}))

describe('GET /api/projects', () => {
  it('should return list of projects', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Test Project',
        description: 'A test project',
        author: { id: '1', username: 'testuser', avatar: null },
        _count: { likes: 5, comments: 3 }
      }
    ]

    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any)
    vi.mocked(prisma.project.count).mockResolvedValue(1)

    const request = new Request('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.projects).toHaveLength(1)
  })
})
