'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Notifications } from './Notifications'
import {
  Home,
  Users,
  MessageSquare,
  FileText,
  Bell,
  LogOut,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth-config'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await auth()
        setSession(sessionData)
      } catch (error) {
        console.error('获取会话失败:', error)
      }
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path)
  }

  return (
    <nav className="bg-[#2b2d31] border-b border-[#1e1f22] px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo和主要导航 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:text-[#f2f3f5] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
              Q
            </div>
            <span className="text-xl font-bold text-[#f2f3f5]">Qtoken</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'bg-[#5865F2]' : 'text-[#b5bac1] hover:text-[#f2f3f5]'}`}>
              <Home className="h-5 w-5" />
              <span>首页</span>
            </Link>

            <Link href="/projects" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive('/projects') ? 'bg-[#5865F2]' : 'text-[#b5bac1] hover:text-[#f2f3f5]'}`}>
              <FileText className="h-5 w-5" />
              <span>项目</span>
            </Link>

            <Link href="/posts" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive('/posts') ? 'bg-[#5865F2]' : 'text-[#b5bac1] hover:text-[#f2f3f5]'}`}>
              <MessageSquare className="h-5 w-5" />
              <span>帖子</span>
            </Link>

            <Link href="/communities" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive('/communities') ? 'bg-[#5865F2]' : 'text-[#b5bac1] hover:text-[#f2f3f5]'}`}>
              <Users className="h-5 w-5" />
              <span>社区</span>
            </Link>

            <Link href="/posts/new" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive('/posts/new') ? 'bg-[#5865F2]' : 'text-[#b5bac1] hover:text-[#f2f3f5]'}`}>
              <FileText className="h-5 w-5" />
              <span>发帖</span>
            </Link>
          </div>
        </div>

        {/* 用户信息和通知 */}
        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              {/* 通知组件 */}
              <div className="relative">
                <Notifications userId={session.user.id} onUnreadChange={setUnreadCount} />
              </div>

              {/* 用户菜单 */}
              <div className="flex items-center gap-4">
                {/* 用户信息 */}
                <Link href={`/profile/${session.user.id}`} className="flex items-center gap-2 hover:underline">
                  <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
                    {session.user.username[0].toUpperCase()}
                  </div>
                  <span className="text-[#f2f3f5]">{session.user.username}</span>
                </Link>

                {/* 管理员入口 */}
                <Link href="/admin" className="hover:underline">
                  <Settings className="h-5 w-5 text-[#b5bac1]" />
                  <span className="text-[#b5bac1]">管理后台</span>
                </Link>

                {/* 登出按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-[#ed4245] hover:text-[#f23f43]"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[#5865F2] hover:underline font-medium">
                登录
              </Link>
              <Link href="/register" className="text-[#5865F2] hover:underline font-medium">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
