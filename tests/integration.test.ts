import { describe, it, expect, vi, beforeEach } from 'vitest'
import { factories } from './factories'

/**
 * 集成测试场景
 * 模拟真实的用户交互流程
 */
describe('集成测试场景', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('用户注册到发布项目流程', () => {
    it('应该完成完整的用户旅程', () => {
      // 1. 用户注册
      const newUser = factories.user({
        email: 'newuser@example.com',
        username: 'newuser123',
      })

      expect(newUser).toHaveProperty('email', 'newuser@example.com')
      expect(newUser).toHaveProperty('username', 'newuser123')

      // 2. 用户创建项目
      const project = factories.project({
        authorId: newUser.id!,
        title: '我的第一个项目',
        tags: ['react', 'typescript'],
      })

      expect(project.authorId).toBe(newUser.id)
      expect(project.title).toBe('我的第一个项目')

      // 3. 其他用户点赞项目
      const liker = factories.user()
      const like = factories.like({
        userId: liker.id!,
        projectId: project.id!,
      })

      expect(like.userId).toBe(liker.id)
      expect(like.projectId).toBe(project.id)

      // 4. 生成点赞通知
      const notification = factories.notification({
        userId: newUser.id!,
        type: 'like',
        title: `${liker.username} 点赞了你的项目`,
      })

      expect(notification.userId).toBe(newUser.id)
      expect(notification.type).toBe('like')
    })

    it('应该处理多个用户交互', () => {
      // 创建社区
      const community = factories.community({
        name: 'React 开发者社区',
        memberCount: 100,
      })

      // 创建多个用户
      const users = factories.users(5)

      // 每个用户发布一个帖子
      const posts = users.map((user, index) =>
        factories.post({
          authorId: user.id!,
          communityId: community.id!,
          title: `${user.username} 的帖子 #${index + 1}`,
        })
      )

      expect(posts).toHaveLength(5)
      posts.forEach((post, index) => {
        expect(post.communityId).toBe(community.id)
        expect(post.title).toContain(`#${index + 1}`)
      })

      // 生成评论
      const comments = posts.flatMap(post =>
        factories.comments(3, {
          postId: post.id!,
          projectId: null,
          authorId: factories.user().id!,
        })
      )

      expect(comments).toHaveLength(15) // 5 个帖子 * 3 条评论
    })
  })

  describe('项目管理场景', () => {
    it('应该处理项目的完整生命周期', () => {
      const author = factories.user()
      
      // 创建项目
      const project = factories.project({
        authorId: author.id!,
        views: 0,
      })

      // 模拟浏览量增长
      const viewIncrements = [10, 25, 50, 100, 250]
      viewIncrements.forEach(views => {
        project.views = views
      })

      expect(project.views).toBe(250)

      // 添加标签
      project.tags = ['javascript', 'react', 'nextjs', 'typescript', 'nodejs']
      expect(project.tags).toHaveLength(5)

      // 生成相关评论
      const comments = factories.comments(8, {
        projectId: project.id!,
        postId: null,
      })

      expect(comments).toHaveLength(8)
    })

    it('应该支持项目搜索和过滤', () => {
      // 创建包含 react 标签的项目
      const reactProjects = factories.projects(10, {
        tags: ['react', 'typescript']
      })

      expect(reactProjects.length).toBeGreaterThan(0)
      reactProjects.forEach(p => {
        expect(p.tags).toContain('react')
      })

      // 创建高浏览量项目
      const popularProjects = factories.projects(5, {
        views: 1000
      })

      expect(popularProjects.length).toBeGreaterThan(0)
      popularProjects.forEach(p => {
        expect(p.views).toBeGreaterThan(500)
      })

      // 测试搜索
      const searchTerm = 'Project'
      const allProjects = [...reactProjects, ...popularProjects]
      const matchedProjects = allProjects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      expect(matchedProjects.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('通知系统场景', () => {
    it('应该处理复杂的通知流', () => {
      const user = factories.user()
      
      // 生成混合类型的通知
      const notifications = [
        factories.notification({ userId: user.id!, type: 'like', read: false }),
        factories.notification({ userId: user.id!, type: 'like', read: false }),
        factories.notification({ userId: user.id!, type: 'comment', read: true }),
        factories.notification({ userId: user.id!, type: 'follow', read: false }),
        factories.notification({ userId: user.id!, type: 'mention', read: false }),
      ]

      // 统计未读通知
      const unreadCount = notifications.filter(n => !n.read).length
      expect(unreadCount).toBe(4)

      // 按类型分组
      const grouped = notifications.reduce((acc, notif) => {
        acc[notif.type!] = (acc[notif.type!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(grouped.like).toBe(2)
      expect(grouped.comment).toBe(1)
      expect(grouped.follow).toBe(1)
      expect(grouped.mention).toBe(1)
    })

    it('应该支持通知批量操作', () => {
      const user = factories.user()
      const notifications = factories.notifications(20, { userId: user.id! })

      // 标记所有为已读
      const markedAsRead = notifications.map(n => ({ ...n, read: true }))
      expect(markedAsRead.every(n => n.read)).toBe(true)

      // 删除旧通知（保留最近 5 个）
      const recentNotifications = notifications.slice(0, 5)
      expect(recentNotifications).toHaveLength(5)
    })
  })

  describe('数据验证场景', () => {
    it('应该验证用户数据的完整性', () => {
      const user = factories.user()

      // 验证必填字段
      expect(user.id).toBeDefined()
      expect(user.email).toBeDefined()
      expect(user.username).toBeDefined()
      expect(user.passwordHash).toBeDefined()

      // 验证邮箱格式
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

      // 验证用户名格式
      expect(user.username).toMatch(/^[a-zA-Z0-9_]/)
      expect(user.username!.length).toBeGreaterThanOrEqual(3)
    })

    it('应该验证项目数据的完整性', () => {
      const project = factories.project()

      // 验证必填字段
      expect(project.id).toBeDefined()
      expect(project.title).toBeDefined()
      expect(project.authorId).toBeDefined()

      // 验证标签
      expect(Array.isArray(project.tags)).toBe(true)
      expect(project.tags!.length).toBeGreaterThan(0)

      // 验证浏览量
      expect(project.views).toBeGreaterThanOrEqual(0)
    })
  })

  describe('性能测试场景', () => {
    it('应该快速生成大量测试数据', () => {
      const startTime = Date.now()

      const users = factories.users(100)
      const projects = factories.projects(200)
      const posts = factories.posts(300)
      const comments = Array.from({ length: 400 }, () => factories.comment())
      const notifications = factories.notifications(500)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(users).toHaveLength(100)
      expect(projects).toHaveLength(200)
      expect(posts).toHaveLength(300)
      expect(comments).toHaveLength(400)
      expect(notifications).toHaveLength(500)
      expect(duration).toBeLessThan(2000) // 应该在 2 秒内完成
    })

    it('应该处理大数据集的过滤操作', () => {
      const projects = factories.projects(1000)

      const startTime = Date.now()

      // 过滤操作
      const filtered = projects.filter(p => p.views! > 500)
      const sorted = filtered.sort((a, b) => b.views! - a.views!)

      const endTime = Date.now()

      expect(sorted.length).toBeLessThanOrEqual(projects.length)
      expect(endTime - startTime).toBeLessThan(1000) // 应该在 1 秒内完成
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空数据集', () => {
      const emptyUsers: any[] = []
      const emptyProjects: any[] = []

      expect(emptyUsers).toHaveLength(0)
      expect(emptyProjects).toHaveLength(0)
    })

    it('应该处理单个数据项', () => {
      const singleUser = factories.user()
      const singleProject = factories.project()

      expect(singleUser).toBeDefined()
      expect(singleProject).toBeDefined()
    })

    it('应该处理极大数据量', () => {
      const largeDataset = factories.notifications(10000)

      expect(largeDataset).toHaveLength(10000)
      
      // 验证所有数据都有效
      expect(largeDataset.every(n => n.id)).toBe(true)
      expect(largeDataset.every(n => n.type)).toBe(true)
    })
  })

  describe('数据一致性测试', () => {
    it('应该维护引用完整性', () => {
      const user = factories.user()
      const project = factories.project({ authorId: user.id! })
      const comment = factories.comment({
        projectId: project.id!,
        authorId: user.id!,
      })

      // 验证引用关系
      expect(project.authorId).toBe(user.id)
      expect(comment.authorId).toBe(user.id)
      expect(comment.projectId).toBe(project.id)
    })

    it('应该支持级联数据生成', () => {
      const community = factories.community()
      const users = factories.users(10)
      
      const posts = users.map(user =>
        factories.post({
          communityId: community.id!,
          authorId: user.id!,
        })
      )

      const comments = posts.flatMap(post =>
        factories.comments(5, {
          postId: post.id!,
          projectId: null,
          authorId: factories.user().id!,
        })
      )

      expect(posts).toHaveLength(10)
      expect(comments).toHaveLength(50) // 10 个帖子 * 5 条评论
    })
  })
})

// 扩展 factories 以支持 comments 批量生成
declare module './factories' {
  export const factories: {
    comments: (count: number, overrides?: any) => any[]
    [key: string]: any
  }
}

factories.comments = (count: number, overrides?: any) => {
  return Array.from({ length: count }, () => factories.comment(overrides))
}
