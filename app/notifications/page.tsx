// app/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'PROJECT_CREATED' | 'POST_CREATED' | 'COMMENT_ADDED' | 'LIKE_RECEIVED'
  title: string
  content: string
  read: boolean
  createdAt: string
  projectId?: string | null
  postId?: string | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status, router])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await fetch('/api/notifications/mark-all', {
        method: 'POST'
      })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_CREATED':
        return '🚀'
      case 'POST_CREATED':
        return '📝️'
      case 'COMMENT_ADDED':
        return '💬'
      case 'LIKE_RECEIVED':
        return '❤️'
      default:
        return '🔔'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.projectId) {
      return `/projects/${notification.projectId}`
    }
    if (notification.postId) {
      return `/posts/${notification.postId}`
    }
    return '#'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-discord-bg flex items-center justify-center">
        <div className="text-discord-muted">加载中...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              通知中心
            </h1>
            <p className="text-discord-muted">
              {unreadCount > 0 && `${unreadCount} 条未读通知`}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="bg-discord-accent hover:bg-[#5865f2] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {markingAll ? '标记中...' : '全部已读'}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-discord-muted text-center py-12">
            暂无通知
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[#2b2d31] border ${
                  notification.read ? 'border-[#1e1f22] opacity-60' : 'border-discord-accent'
                } rounded-lg p-4 transition-opacity hover:opacity-100`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-semibold ${
                        notification.read ? 'text-discord-muted' : 'text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-discord-accent hover:underline text-sm flex-shrink-0"
                          >
                            标记已读
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-discord-muted hover:text-[#da373c] text-sm flex-shrink-0"
                        >
                          删除
                        </button>
                      </div>
                    </div>

                    <p className="text-discord-muted mb-3">
                      {notification.content}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-discord-muted">
                        {new Date(notification.createdAt).toLocaleString('zh-CN')}
                      </span>
                      {getNotificationLink(notification) !== '#' && (
                        <a
                          href={getNotificationLink(notification)}
                          className="text-discord-accent hover:underline"
                        >
                          查看
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
