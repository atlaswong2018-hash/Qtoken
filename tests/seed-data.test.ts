import { describe, it, expect } from 'vitest'
import { factories } from './factories'

/**
 * 数据库种子数据
 * 用于开发和测试环境的初始数据
 */
describe('数据库种子数据', () => {
  describe('开发环境种子数据', () => {
    it('应该生成完整的开发环境数据集', () => {
      // 创建管理员用户
      const admin = factories.user({
        email: 'admin@example.com',
        username: 'admin',
      })

      // 创建测试用户
      const testUsers = factories.users(10)

      // 创建社区
      const communities = [
        factories.community({
          name: 'React 开发者',
          slug: 'react-developers',
          memberCount: 1500,
        }),
        factories.community({
          name: 'TypeScript 爱好者',
          slug: 'typescript-fans',
          memberCount: 800,
        }),
        factories.community({
          name: 'Next.js 社区',
          slug: 'nextjs-community',
          memberCount: 1200,
        }),
      ]

      // 为每个社区创建帖子
      const posts = communities.flatMap(community =>
        factories.posts(5, {
          communityId: community.id!,
          authorId: testUsers[Math.floor(Math.random() * testUsers.length)].id!,
        })
      )

      // 创建项目
      const projects = factories.projects(15, {
        authorId: testUsers[Math.floor(Math.random() * testUsers.length)].id!,
      })

      // 为项目创建评论
      const comments = projects.flatMap(project =>
        Array.from({ length: 3 }, () =>
          factories.comment({
            projectId: project.id!,
            postId: null,
            authorId: testUsers[Math.floor(Math.random() * testUsers.length)].id!,
          })
        )
      )

      // 验证数据完整性
      expect(admin).toBeDefined()
      expect(testUsers).toHaveLength(10)
      expect(communities).toHaveLength(3)
      expect(posts).toHaveLength(15) // 3 个社区 * 5 个帖子
      expect(projects).toHaveLength(15)
      expect(comments).toHaveLength(45) // 15 个项目 * 3 条评论
    })

    it('应该生成测试用户数据集', () => {
      const testUsers = [
        factories.user({
          email: 'user1@test.com',
          username: 'user1',
          bio: '前端开发工程师',
        }),
        factories.user({
          email: 'user2@test.com',
          username: 'user2',
          bio: '后端开发工程师',
        }),
        factories.user({
          email: 'user3@test.com',
          username: 'user3',
          bio: '全栈开发工程师',
        }),
      ]

      expect(testUsers).toHaveLength(3)
      testUsers.forEach(user => {
        expect(user.email).toBeDefined()
        expect(user.username).toBeDefined()
        expect(user.bio).toBeDefined()
      })
    })

    it('应该生成示例项目数据集', () => {
      const sampleProjects = [
        factories.project({
          title: 'React 组件库',
          description: '一个现代化的 React UI 组件库',
          tags: ['react', 'typescript', 'ui'],
          views: 1250,
        }),
        factories.project({
          title: 'Next.js 博客模板',
          description: '功能完整的博客系统模板',
          tags: ['nextjs', 'blog', 'mdx'],
          views: 980,
        }),
        factories.project({
          title: 'TypeScript 工具集',
          description: '常用的 TypeScript 工具函数集合',
          tags: ['typescript', 'utils', 'npm'],
          views: 2100,
        }),
      ]

      expect(sampleProjects).toHaveLength(3)
      sampleProjects.forEach(project => {
        expect(project.title).toBeDefined()
        expect(project.tags!.length).toBeGreaterThan(0)
        expect(project.views).toBeGreaterThan(0)
      })
    })
  })

  describe('压力测试数据集', () => {
    it('应该生成大规模用户数据', () => {
      const startTime = Date.now()
      const users = factories.users(1000)
      const endTime = Date.now()

      expect(users).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(2000) // 应该在 2 秒内完成

      // 验证数据唯一性
      const uniqueEmails = new Set(users.map(u => u.email))
      const uniqueUsernames = new Set(users.map(u => u.username))
      expect(uniqueEmails.size).toBe(users.length)
      expect(uniqueUsernames.size).toBe(users.length)
    })

    it('应该生成大规模项目数据', () => {
      const users = factories.users(100)
      const projects = factories.projects(500, {
        authorId: users[Math.floor(Math.random() * users.length)].id!,
      })

      expect(projects).toHaveLength(500)
      projects.forEach(project => {
        expect(project.authorId).toBeDefined()
        expect(project.title).toBeDefined()
      })
    })

    it('应该生成大规模通知数据', () => {
      const users = factories.users(50)
      const notifications = Array.from({ length: 1000 }, () =>
        factories.notification({
          userId: users[Math.floor(Math.random() * users.length)].id!,
        })
      )

      expect(notifications).toHaveLength(1000)
      
      // 统计通知类型分布
      const typeDistribution = notifications.reduce((acc, n) => {
        acc[n.type!] = (acc[n.type!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(Object.keys(typeDistribution)).toContain('like')
      expect(Object.keys(typeDistribution)).toContain('comment')
    })
  })

  describe('关联数据集', () => {
    it('应该生成完整的社交网络数据', () => {
      // 创建用户
      const users = factories.users(20)

      // 创建社区
      const communities = Array.from({ length: 5 }, (_, i) =>
        factories.community({
          name: `社区 ${i + 1}`,
          memberCount: Math.floor(Math.random() * 100) + 10,
        })
      )

      // 用户加入社区并发布内容
      const posts = users.flatMap(user =>
        Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          factories.post({
            authorId: user.id!,
            communityId: communities[Math.floor(Math.random() * communities.length)].id!,
          })
        )
      )

      // 其他用户评论
      const comments = posts.flatMap(post =>
        Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
          factories.comment({
            postId: post.id!,
            projectId: null,
            authorId: users[Math.floor(Math.random() * users.length)].id!,
          })
        )
      )

      // 验证数据关联
      expect(users).toHaveLength(20)
      expect(communities).toHaveLength(5)
      expect(posts.length).toBeGreaterThan(20)
      expect(comments.length).toBeGreaterThan(posts.length)
    })

    it('应该生成项目生态系统数据', () => {
      // 创建作者
      const authors = factories.users(10)

      // 创建项目
      const projects = authors.flatMap(author =>
        factories.projects(3, {
          authorId: author.id!,
        })
      )

      // 创建点赞
      const likes = projects.flatMap(project =>
        Array.from({ length: Math.floor(Math.random() * 20) + 5 }, () =>
          factories.like({
            projectId: project.id!,
            userId: authors[Math.floor(Math.random() * authors.length)].id!,
          })
        )
      )

      // 创建评论
      const comments = projects.flatMap(project =>
        Array.from({ length: 5 }, () =>
          factories.comment({
            projectId: project.id!,
            postId: null,
            authorId: authors[Math.floor(Math.random() * authors.length)].id!,
          })
        )
      )

      // 验证数据完整性
      expect(authors).toHaveLength(10)
      expect(projects).toHaveLength(30) // 10 个作者 * 3 个项目
      expect(likes.length).toBeGreaterThan(150) // 至少 30 个项目 * 5 个点赞
      expect(comments).toHaveLength(150) // 30 个项目 * 5 条评论
    })
  })

  describe('测试场景数据', () => {
    it('应该生成分页测试数据', () => {
      const totalItems = 100
      const pageSize = 10
      const items = factories.projects(totalItems)

      // 模拟分页
      const totalPages = Math.ceil(totalItems / pageSize)
      const pages = Array.from({ length: totalPages }, (_, i) =>
        items.slice(i * pageSize, (i + 1) * pageSize)
      )

      expect(pages).toHaveLength(10)
      pages.forEach(page => {
        expect(page.length).toBeLessThanOrEqual(pageSize)
      })
    })

    it('应该生成搜索测试数据', () => {
      const projects = [
        factories.project({ title: 'React 入门教程' }),
        factories.project({ title: 'Vue 入门教程' }),
        factories.project({ title: 'React 进阶指南' }),
        factories.project({ title: 'TypeScript 实战' }),
        factories.project({ title: 'React 最佳实践' }),
      ]

      // 搜索 "React"
      const searchResults = projects.filter(p =>
        p.title!.includes('React')
      )

      expect(searchResults).toHaveLength(3)
    })

    it('应该生成过滤测试数据', () => {
      const projects = [
        factories.project({ tags: ['react', 'typescript'], views: 1000 }),
        factories.project({ tags: ['vue', 'javascript'], views: 500 }),
        factories.project({ tags: ['react', 'nextjs'], views: 2000 }),
        factories.project({ tags: ['angular', 'typescript'], views: 800 }),
      ]

      // 按标签过滤
      const reactProjects = projects.filter(p => p.tags!.includes('react'))
      expect(reactProjects).toHaveLength(2)

      // 按浏览量过滤
      const popularProjects = projects.filter(p => p.views! > 900)
      expect(popularProjects).toHaveLength(2)
    })

    it('应该生成排序测试数据', () => {
      const projects = factories.projects(10)

      // 按浏览量排序
      const sortedByViews = [...projects].sort((a, b) => b.views! - a.views!)
      expect(sortedByViews[0].views).toBeGreaterThanOrEqual(sortedByViews[1].views!)

      // 按标题排序
      const sortedByTitle = [...projects].sort((a, b) =>
        a.title!.localeCompare(b.title!)
      )
      expect(sortedByTitle[0].title!.localeCompare(sortedByTitle[1].title!)).toBeLessThanOrEqual(0)
    })
  })

  describe('边界条件数据', () => {
    it('应该生成最小数据集', () => {
      const minimalUser = factories.user({
        email: 'minimal@example.com',
        username: 'minimal',
      })

      const minimalProject = factories.project({
        title: '最小项目',
        description: null,
        tags: [],
      })

      expect(minimalUser).toBeDefined()
      expect(minimalProject).toBeDefined()
      expect(minimalProject.description).toBeNull()
    })

    it('应该生成最大数据集', () => {
      const maxTitle = 'A'.repeat(200)
      const maxDescription = 'B'.repeat(5000)
      const maxTags = Array.from({ length: 10 }, (_, i) => `tag${i}`)

      const maxProject = factories.project({
        title: maxTitle,
        description: maxDescription,
        tags: maxTags,
      })

      expect(maxProject.title).toBe(maxTitle)
      expect(maxProject.description).toBe(maxDescription)
      expect(maxProject.tags).toHaveLength(10)
    })

    it('应该生成特殊字符数据', () => {
      const specialChars = factories.user({
        username: 'user_with_special_chars_123',
        bio: '包含中文、emoji 🎉 和特殊字符 !@#$%',
      })

      expect(specialChars.username).toBeDefined()
      expect(specialChars.bio).toContain('🎉')
    })
  })
})

// 导出种子数据生成函数
export function generateSeedData() {
  return {
    users: factories.users(10),
    communities: Array.from({ length: 3 }, (_, i) =>
      factories.community({ name: `社区 ${i + 1}` })
    ),
    projects: factories.projects(15),
    posts: factories.posts(20),
    notifications: factories.notifications(30),
  }
}

export function generateTestData() {
  return {
    testUser: factories.user({
      email: 'test@example.com',
      username: 'testuser',
    }),
    testProject: factories.project({
      title: '测试项目',
    }),
    testCommunity: factories.community({
      name: '测试社区',
    }),
  }
}
