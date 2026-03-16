// app/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Check, Trash2, CheckCircle, AlertCircle, MessageSquare, Heart, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session?.user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
      }
    } catch (error) {
      console.error('标记为已读失败:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        )
      }
    } catch (error) {
      console.error('标记全部为已读失败:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const confirmed = confirm('确定要删除这条通知吗？')
      if (!confirmed) return

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      }
    } catch (error) {
      console.error('删除通知失败:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_CREATED':
        return <CheckCircle className="h-5 w-5 text-discord-accent" />
      case 'POST_CREATED':
        return <MessageSquare className="h-5 w-5 text-discord-accent" />
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-5 w-5 text-discord-accent" />
      case 'LIKE_RECEIVED':
        return <Heart className="h-5 w-5 text-red-400" />
      default:
        return <Bell className="h-5 w-5 text-discord-muted" />
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22] max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
              <p className="text-discord-muted mb-4">请先登录查看通知</p>
              <Link href="/login">
                <Button>登录</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">通知中心</h1>
        <p className="text-discord-muted">
          {unreadCount > 0
            ? `你有 ${unreadCount} 条未读通知`
            : '所有通知'}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="mb-6 flex gap-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-discord-accent' : ''}
        >
          全部通知 ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className={filter === 'unread' ? 'bg-discord-accent' : ''}
          disabled={unreadCount === 0}
        >
          未读通知 ({unreadCount})
        </Button>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-2" />
            全部标为已读
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="py-12">
            <div className="text-center text-discord-muted">
              <div className="inline-block h-8 w-8 border-2 border-discord-muted border-t-transparent animate-spin rounded-full mb-4" />
              加载中...
            </div>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="py-12">
            <div className="text-center">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
              <p className="text-discord-muted text-lg mb-2">暂无通知</p>
              <p className="text-discord-muted text-sm">
                {filter === 'unread' ? '没有未读通知' : '还没有收到任何通知'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 通知列表 */
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              className="block"
            >
              <Card
                className={`bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-all ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <Badge variant="secondary" className="bg-discord-accent text-white text-xs">
                                未读
                              </Badge>
                            )}
                          </div>
                          <p className="text-discord-muted text-sm line-clamp-2">
                            {notification.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-discord-muted text-xs">
                            {new Date(notification.createdAt).toLocaleString('zh-CN')}
                          </span>

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                              }}
                              className="h-8 w-8 text-discord-accent hover:text-white"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="h-8 w-8 text-discord-muted hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
