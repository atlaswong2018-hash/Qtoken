'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  X,
  Heart,
  MessageSquare,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system'
  title: string
  content: string
  read: boolean
  createdAt: Date
  relatedUserId?: string
  relatedPostId?: string
  relatedProjectId?: string
}

interface NotificationsProps {
  userId: string
}

export default function Notifications({ userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('标记为已读失败:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read?userId=${userId}`, {
        method: 'PUT'
      })

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('标记全部已读失败:', error)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-[#eb459e]" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-[#5865F2]" />
      case 'follow':
        return <Users className="h-4 w-4 text-[#23a559]" />
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-[#fee75c]" />
      case 'system':
        return <CheckCircle className="h-4 w-4 text-[#5865F2]" />
      default:
        return <Bell className="h-4 w-4 text-[#b5bac1]" />
    }
  }

  const getIconBackground = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return 'bg-[#eb459e]/20'
      case 'comment':
        return 'bg-[#5865F2]/20'
      case 'follow':
        return 'bg-[#23a559]/20'
      case 'mention':
        return 'bg-[#fee75c]/20'
      case 'system':
        return 'bg-[#5865F2]/20'
      default:
        return 'bg-[#5865F2]/20'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="h-5 w-5 text-[#b5bac1]" />
        {unreadCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#ed4245] text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* 通知下拉框 */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-y-auto bg-[#2b2d31] border border-[#1e1f22] rounded-md shadow-lg z-50">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="flex items-center justify-between pb-3 border-b border-[#1e1f22]">
              <CardTitle className="text-white">通知</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-[#5865F2] text-xs"
                >
                  全部已读
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div className="divide-y divide-[#1e1f22]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-[#3f4147] cursor-pointer transition-colors ${
                        !notification.read ? 'bg-[#2b2d31]' : 'bg-[#1e1f22]/50'
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full flex-shrink-0 ${getIconBackground(notification.type)}`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[#f2f3f5] font-medium text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-[#5865F2] flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[#dbdee1] text-sm mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          <div className="text-[#b5bac1] text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#b5bac1]">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                  <p>暂无通知</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
