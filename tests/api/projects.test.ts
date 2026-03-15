import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/projects/route'
import { prisma } from '@/lib/prisma'
import { factories } from '../factories'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-config', () => ({
  auth: vi.fn(),
}))

describe('项目 API 系统化测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects - 获取项目列表', () => {
    it('应该返回项目列表（带分页）', async () => {
      const projects = factories.projects(10)
      const mockResponse = projects.map(p => ({
        ...p,
        author: { id: p.authorId, username: 'testuser', avatar: null },
        _count: { likes: 5, comments: 3 },
      }))

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockResponse as any)
      vi.mocked(prisma.project.count).mockResolvedValue(50)

      const request = new Request('http://localhost:3000/api/projects?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(10)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBe(50)
    })

    it('应该支持按标签过滤', async () => {
      const projects = factories.projects(5, { tags: ['react', 'typescript'] })
      const mockResponse = projects.map(p => ({
        ...p,
        author: { id: p.authorId, username: 'testuser', avatar: null },
        _count: { likes: 3, comments: 1 },
      }))

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockResponse as any)
      vi.mocked(prisma.project.count).mockResolvedValue(5)

      const request = new Request('http://localhost:3000/api/projects?tags=react,typescript')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(5)
    })

    it('应该支持按作者过滤', async () => {
      const authorId = 'test-author-id'
      const projects = factories.projects(3, { authorId })
      const mockResponse = projects.map(p => ({
        ...p,
        author: { id: authorId, username: 'author123', avatar: null },
        _count: { likes: 10, comments: 5 },
      }))

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockResponse as any)
      vi.mocked(prisma.project.count).mockResolvedValue(3)

      const request = new Request(`http://localhost:3000/api/projects?authorId=${authorId}`)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(3)
    })

    it('应该支持搜索功能', async () => {
      const projects = factories.projects(5, { title: 'React Project' })
      const mockResponse = projects.map(p => ({
        ...p,
        author: { id: p.authorId, username: 'testuser', avatar: null },
        _count: { likes: 2, comments: 1 },
      }))

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockResponse as any)
      vi.mocked(prisma.project.count).mockResolvedValue(5)

      const request = new Request('http://localhost:3000/api/projects?search=react')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(5)
    })

    it('应该返回空列表当没有项目时', async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([])
      vi.mocked(prisma.project.count).mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(0)
      expect(data.pagination.total).toBe(0)
    })
  })

  describe('项目数据验证', () => {
    it('应该生成有效的测试项目数据', () => {
      const project = factories.project()
      
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('authorId')
      expect(project.tags).toBeInstanceOf(Array)
      expect(project.views).toBeGreaterThanOrEqual(0)
    })

    it('应该允许自定义项目数据', () => {
      const customProject = factories.project({
        title: 'Custom Title',
        views: 9999,
      })

      expect(customProject.title).toBe('Custom Title')
      expect(customProject.views).toBe(9999)
    })

    it('应该批量生成项目数据', () => {
      const projects = factories.projects(20)

      expect(projects).toHaveLength(20)
      projects.forEach(p => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('title')
      })
    })
  })
})
