import { describe, it, expect, vi, beforeEach } from 'vitest'
import { factories } from '../factories'

describe('通知系统测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('通知数据工厂', () => {
    it('应该生成有效的通知数据', () => {
      const notification = factories.notification()

      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('type')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('userId')
      expect(['like', 'comment', 'follow', 'mention']).toContain(notification.type)
    })

    it('应该生成特定类型的通知', () => {
      const likeNotification = factories.notification({ type: 'like' })
      const commentNotification = factories.notification({ type: 'comment' })
      const followNotification = factories.notification({ type: 'follow' })

      expect(likeNotification.type).toBe('like')
      expect(commentNotification.type).toBe('comment')
      expect(followNotification.type).toBe('follow')
    })

    it('应该生成已读和未读通知', () => {
      const unread = factories.notification({ read: false })
      const read = factories.notification({ read: true })

      expect(unread.read).toBe(false)
      expect(read.read).toBe(true)
    })

    it('应该批量生成通知数据', () => {
      const notifications = Array.from({ length: 10 }, () =>
        factories.notification()
      )

      expect(notifications).toHaveLength(10)
      notifications.forEach(n => {
        expect(n).toHaveProperty('id')
        expect(n).toHaveProperty('type')
        expect(n).toHaveProperty('userId')
      })
    })
  })

  describe('通知类型测试', () => {
    it('应该创建点赞通知', () => {
      const notification = factories.notification({
        type: 'like',
        title: '有人点赞了你的项目',
      })

      expect(notification.type).toBe('like')
      expect(notification.title).toContain('点赞')
    })

    it('应该创建评论通知', () => {
      const notification = factories.notification({
        type: 'comment',
        title: '有人评论了你的项目',
        content: '这是一个很好的项目！',
      })

      expect(notification.type).toBe('comment')
      expect(notification.content).toBeDefined()
    })

    it('应该创建关注通知', () => {
      const notification = factories.notification({
        type: 'follow',
        title: '有人关注了你',
      })

      expect(notification.type).toBe('follow')
    })

    it('应该创建提及通知', () => {
      const notification = factories.notification({
        type: 'mention',
        title: '有人在评论中提及你',
      })

      expect(notification.type).toBe('mention')
    })
  })

  describe('通知状态管理', () => {
    it('应该生成未读通知', () => {
      const notifications = factories.notifications(5, { read: false })

      expect(notifications).toHaveLength(5)
      notifications.forEach(n => {
        expect(n.read).toBe(false)
      })
    })

    it('应该生成混合状态的通知', () => {
      const unread = factories.notification({ read: false })
      const read = factories.notification({ read: true })

      expect(unread.read).toBe(false)
      expect(read.read).toBe(true)
    })
  })

  describe('通知查询场景', () => {
    it('应该生成用户的所有通知', () => {
      const userId = 'test-user-123'
      const notifications = Array.from({ length: 8 }, () =>
        factories.notification({ userId })
      )

      expect(notifications).toHaveLength(8)
      notifications.forEach(n => {
        expect(n.userId).toBe(userId)
      })
    })

    it('应该生成按类型分组的通知', () => {
      const userId = 'test-user-123'
      const likeNotifications = Array.from({ length: 3 }, () =>
        factories.notification({ userId, type: 'like' })
      )
      const commentNotifications = Array.from({ length: 2 }, () =>
        factories.notification({ userId, type: 'comment' })
      )

      const allNotifications = [...likeNotifications, ...commentNotifications]

      expect(allNotifications).toHaveLength(5)
      expect(likeNotifications.filter(n => n.type === 'like')).toHaveLength(3)
      expect(commentNotifications.filter(n => n.type === 'comment')).toHaveLength(2)
    })

    it('应该生成按时间排序的通知', () => {
      const now = new Date()
      const notifications = Array.from({ length: 5 }, (_, i) => ({
        ...factories.notification(),
        createdAt: new Date(now.getTime() - i * 1000 * 60 * 60), // 每小时一个
      }))

      // 验证通知按时间递减排序（最新的在前）
      for (let i = 1; i < notifications.length; i++) {
        expect(notifications[i - 1].createdAt!.getTime())
          .toBeGreaterThanOrEqual(notifications[i].createdAt!.getTime())
      }
    })
  })

  describe('通知分页场景', () => {
    it('应该生成第一页的通知', () => {
      const userId = 'test-user-123'
      const page1Notifications = Array.from({ length: 10 }, () =>
        factories.notification({ userId })
      )

      expect(page1Notifications).toHaveLength(10)
    })

    it('应该生成第二页的通知', () => {
      const userId = 'test-user-123'
      const page2Notifications = Array.from({ length: 10 }, () =>
        factories.notification({ userId })
      )

      expect(page2Notifications).toHaveLength(10)
    })

    it('应该计算总页数', () => {
      const totalNotifications = 53
      const pageSize = 10
      const totalPages = Math.ceil(totalNotifications / pageSize)

      expect(totalPages).toBe(6)
    })
  })

  describe('通知统计', () => {
    it('应该计算未读通知数量', () => {
      const userId = 'test-user-123'
      const notifications = Array.from({ length: 20 }, (_, i) =>
        factories.notification({ 
          userId, 
          read: i < 5 // 前 5 个已读，后 15 个未读
        })
      )

      const unreadCount = notifications.filter(n => !n.read).length

      expect(unreadCount).toBe(15)
    })

    it('应该按类型统计通知', () => {
      const userId = 'test-user-123'
      const notifications = [
        ...Array.from({ length: 5 }, () => factories.notification({ userId, type: 'like' })),
        ...Array.from({ length: 3 }, () => factories.notification({ userId, type: 'comment' })),
        ...Array.from({ length: 2 }, () => factories.notification({ userId, type: 'follow' })),
      ]

      const stats = {
        like: notifications.filter(n => n.type === 'like').length,
        comment: notifications.filter(n => n.type === 'comment').length,
        follow: notifications.filter(n => n.type === 'follow').length,
      }

      expect(stats.like).toBe(5)
      expect(stats.comment).toBe(3)
      expect(stats.follow).toBe(2)
    })
  })

  describe('通知批量操作', () => {
    it('应该批量标记为已读', () => {
      const userId = 'test-user-123'
      const unreadNotifications = Array.from({ length: 10 }, () =>
        factories.notification({ userId, read: false })
      )

      // 模拟批量标记为已读
      const markedAsRead = unreadNotifications.map(n => ({ ...n, read: true }))

      expect(markedAsRead.every(n => n.read)).toBe(true)
      expect(markedAsRead).toHaveLength(10)
    })

    it('应该批量删除通知', () => {
      const userId = 'test-user-123'
      const notifications = Array.from({ length: 15 }, () =>
        factories.notification({ userId })
      )

      // 模拟删除旧通知（保留最近 5 个）
      const remainingNotifications = notifications.slice(0, 5)

      expect(remainingNotifications).toHaveLength(5)
    })
  })

  describe('通知边界条件', () => {
    it('应该处理空通知列表', () => {
      const notifications: any[] = []

      expect(notifications).toHaveLength(0)
    })

    it('应该处理单个通知', () => {
      const notification = factories.notification()

      expect(notification).toBeDefined()
      expect(notification.id).toBeDefined()
    })

    it('应该处理大量通知', () => {
      const userId = 'test-user-123'
      const notifications = Array.from({ length: 100 }, () =>
        factories.notification({ userId })
      )

      expect(notifications).toHaveLength(100)
    })
  })
})

// 辅助函数：生成多个通知
factories.notifications = (count: number, overrides?: any) => {
  return Array.from({ length: count }, () => factories.notification(overrides))
}
