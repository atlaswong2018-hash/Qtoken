import { describe, it, expect } from 'vitest'
import { factories, generateTestEmail, generateTestUsername } from './factories'

describe('测试数据工厂系统化测试', () => {
  describe('User Factory - 用户数据工厂', () => {
    it('应该生成有效的用户数据', () => {
      const user = factories.user()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('passwordHash')
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(user.username.length).toBeGreaterThanOrEqual(3)
    })

    it('应该生成唯一的数据', () => {
      const user1 = factories.user()
      const user2 = factories.user()

      expect(user1.id).not.toBe(user2.id)
      expect(user1.email).not.toBe(user2.email)
      expect(user1.username).not.toBe(user2.username)
    })

    it('应该允许自定义字段', () => {
      const customUser = factories.user({
        username: 'custom_username',
        email: 'custom@example.com',
      })

      expect(customUser.username).toBe('custom_username')
      expect(customUser.email).toBe('custom@example.com')
    })

    it('应该批量生成用户数据', () => {
      const users = factories.users(10)

      expect(users).toHaveLength(10)
      users.forEach(user => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('username')
      })

      // 验证所有用户都是唯一的
      const uniqueEmails = new Set(users.map(u => u.email))
      expect(uniqueEmails.size).toBe(users.length)
    })
  })

  describe('Project Factory - 项目数据工厂', () => {
    it('应该生成有效的项目数据', () => {
      const project = factories.project()

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('tags')
      expect(project).toHaveProperty('authorId')
      expect(Array.isArray(project.tags)).toBe(true)
      expect(project.views).toBeGreaterThanOrEqual(0)
    })

    it('应该生成合理的标签数量', () => {
      const project = factories.project()

      expect(project.tags.length).toBeGreaterThan(0)
      expect(project.tags.length).toBeLessThanOrEqual(3)
    })

    it('应该允许自定义标签', () => {
      const project = factories.project({
        tags: ['react', 'typescript', 'nextjs'],
      })

      expect(project.tags).toEqual(['react', 'typescript', 'nextjs'])
    })

    it('应该批量生成项目数据', () => {
      const projects = factories.projects(15)

      expect(projects).toHaveLength(15)
      projects.forEach(project => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('title')
        expect(project.tags).toBeDefined()
      })
    })

    it('应该生成不同的项目标题', () => {
      const projects = factories.projects(5)
      const titles = projects.map(p => p.title)
      const uniqueTitles = new Set(titles)

      expect(uniqueTitles.size).toBe(projects.length)
    })
  })

  describe('Community Factory - 社区数据工厂', () => {
    it('应该生成有效的社区数据', () => {
      const community = factories.community()

      expect(community).toHaveProperty('id')
      expect(community).toHaveProperty('name')
      expect(community).toHaveProperty('slug')
      expect(community).toHaveProperty('memberCount')
      expect(community.memberCount).toBeGreaterThanOrEqual(0)
    })

    it('应该生成有效的 slug', () => {
      const community = factories.community()

      expect(community.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    })

    it('应该批量生成社区数据', () => {
      const communities = Array.from({ length: 5 }, () => factories.community())

      expect(communities).toHaveLength(5)
      communities.forEach(c => {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('slug')
      })
    })
  })

  describe('Post Factory - 帖子数据工厂', () => {
    it('应该生成有效的帖子数据', () => {
      const post = factories.post()

      expect(post).toHaveProperty('id')
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('content')
      expect(post).toHaveProperty('authorId')
      expect(post).toHaveProperty('communityId')
      expect(post.content.length).toBeGreaterThan(0)
    })

    it('应该生成合理的浏览量', () => {
      const post = factories.post()

      expect(post.views).toBeGreaterThanOrEqual(0)
      expect(post.views).toBeLessThanOrEqual(5000)
    })

    it('应该批量生成帖子数据', () => {
      const posts = factories.posts(20)

      expect(posts).toHaveLength(20)
      posts.forEach(post => {
        expect(post).toHaveProperty('title')
        expect(post).toHaveProperty('content')
      })
    })
  })

  describe('Comment Factory - 评论数据工厂', () => {
    it('应该生成有效的评论数据', () => {
      const comment = factories.comment()

      expect(comment).toHaveProperty('id')
      expect(comment).toHaveProperty('content')
      expect(comment).toHaveProperty('authorId')
      expect(comment.content.length).toBeGreaterThan(0)
    })

    it('应该批量生成评论数据', () => {
      const comments = Array.from({ length: 25 }, () => factories.comment())

      expect(comments).toHaveLength(25)
      comments.forEach(c => {
        expect(c).toHaveProperty('content')
      })
    })
  })

  describe('Like Factory - 点赞数据工厂', () => {
    it('应该生成有效的点赞数据', () => {
      const like = factories.like()

      expect(like).toHaveProperty('id')
      expect(like).toHaveProperty('userId')
      expect(like).toHaveProperty('projectId')
    })

    it('应该批量生成点赞数据', () => {
      const likes = Array.from({ length: 30 }, () => factories.like())

      expect(likes).toHaveLength(30)
      likes.forEach(like => {
        expect(like).toHaveProperty('userId')
        expect(like).toHaveProperty('projectId')
      })
    })
  })

  describe('Notification Factory - 通知数据工厂', () => {
    it('应该生成有效的通知数据', () => {
      const notification = factories.notification()

      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('type')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('userId')
      expect(['like', 'comment', 'follow', 'mention']).toContain(notification.type)
    })

    it('应该生成指定类型的通知', () => {
      const types: Array<'like' | 'comment' | 'follow' | 'mention'> = ['like', 'comment', 'follow', 'mention']
      
      types.forEach(type => {
        const notification = factories.notification({ type })
        expect(notification.type).toBe(type)
      })
    })

    it('应该批量生成通知数据', () => {
      const notifications = factories.notifications(15)

      expect(notifications).toHaveLength(15)
      notifications.forEach(n => {
        expect(n).toHaveProperty('type')
        expect(n).toHaveProperty('title')
      })
    })
  })

  describe('Helper Functions - 辅助函数', () => {
    it('应该生成测试邮箱', () => {
      const email1 = generateTestEmail()
      const email2 = generateTestEmail()

      expect(email1).toMatch(/^test_[a-f0-9-]+@example\.com$/)
      expect(email2).toMatch(/^test_[a-f0-9-]+@example\.com$/)
      expect(email1).not.toBe(email2)
    })

    it('应该生成测试用户名', () => {
      const username1 = generateTestUsername()
      const username2 = generateTestUsername()

      expect(username1).toMatch(/^testuser_[a-f0-9]+$/)
      expect(username2).toMatch(/^testuser_[a-f0-9]+$/)
      expect(username1).not.toBe(username2)
    })
  })

  describe('数据一致性测试', () => {
    it('应该生成关联的用户和项目', () => {
      const user = factories.user()
      const project = factories.project({ authorId: user.id })

      expect(project.authorId).toBe(user.id)
    })

    it('应该生成关联的社区和帖子', () => {
      const community = factories.community()
      const post = factories.post({ communityId: community.id })

      expect(post.communityId).toBe(community.id)
    })

    it('应该生成关联的帖子和评论', () => {
      const post = factories.post()
      const comment = factories.comment({ postId: post.id, projectId: null })

      expect(comment.postId).toBe(post.id)
    })
  })

  describe('性能测试', () => {
    it('应该快速生成大量数据', () => {
      const startTime = Date.now()
      const users = factories.users(1000)
      const endTime = Date.now()

      expect(users).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // 应该在 1 秒内完成
    })

    it('应该快速生成复杂数据', () => {
      const startTime = Date.now()
      
      const users = factories.users(100)
      const projects = factories.projects(200)
      const posts = factories.posts(300)
      const comments = Array.from({ length: 400 }, () => factories.comment())
      
      const endTime = Date.now()

      expect(users).toHaveLength(100)
      expect(projects).toHaveLength(200)
      expect(posts).toHaveLength(300)
      expect(comments).toHaveLength(400)
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })
})
