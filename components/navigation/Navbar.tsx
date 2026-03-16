// components/navigation/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Search, Bell, Settings, LogOut, User, Home, Folder, Users, MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const user = session?.user as any

  // 模拟获取未读通知数量
  useEffect(() => {
    if (session?.user) {
      // 这里应该调用 API 获取真实的未读数量
      setUnreadCount(3)
    }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-[#2b2d31] border-b border-[#1e1f22] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo 和主导航 */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
              <div className="w-8 h-8 bg-discord-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">社区</span>
            </Link>

            {/* 桌面端导航链接 */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/projects"
                className="text-discord-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <Folder size={16} />
                <span>项目</span>
              </Link>
              <Link
                href="/communities"
                className="text-discord-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <Users size={16} />
                <span>社区</span>
              </Link>
              <Link
                href="/posts"
                className="text-discord-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <MessageSquare size={16} />
                <span>帖子</span>
              </Link>
            </div>
          </div>

          {/* 中间：搜索框 */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-discord-muted" size={18} />
                <Input
                  type="search"
                  placeholder="搜索项目、帖子、社区..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1f22] border-[#1e1f22] text-white pl-10 pr-4"
                />
              </div>
            </form>
          </div>

          {/* 右侧：用户操作 */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-[#1e1f22] animate-pulse" />
            ) : session?.user ? (
              <>
                {/* 创建按钮 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-[#35373c]">
                      <Plus size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/projects/new" className="flex items-center gap-2 cursor-pointer">
                        <Folder size={16} />
                        <span>创建项目</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/communities/new" className="flex items-center gap-2 cursor-pointer">
                        <Users size={16} />
                        <span>创建社区</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/posts/new" className="flex items-center gap-2 cursor-pointer">
                        <MessageSquare size={16} />
                        <span>发布帖子</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 通知按钮 */}
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-[#35373c]">
                    <Bell size={20} />
                  </Button>
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>

                {/* 用户菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || user.email || '用户'}
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-discord-accent h-full w-full flex items-center justify-center text-white font-semibold">
                            {user.name?.[0] || user.email?.[0] || 'U'}
                          </div>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs leading-none text-discord-muted">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                        <User size={16} />
                        <span>个人主页</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings size={16} />
                        <span>账户设置</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-500"
                    >
                      <LogOut size={16} />
                      <span>登出</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* 未登录状态 */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-[#35373c]">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-discord-accent hover:bg-[#5865f2]">
                    注册
                  </Button>
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-[#35373c]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <LogOut size={24} /> : <MessageSquare size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e1f22] py-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/projects"
              className="px-4 py-2 text-discord-muted hover:text-white hover:bg-[#35373c] transition-colors flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Folder size={16} />
              <span>项目</span>
            </Link>
            <Link
              href="/communities"
              className="px-4 py-2 text-discord-muted hover:text-white hover:bg-[#35373c] transition-colors flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users size={16} />
              <span>社区</span>
            </Link>
            <Link
              href="/posts"
              className="px-4 py-2 text-discord-muted hover:text-white hover:bg-[#35373c] transition-colors flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageSquare size={16} />
              <span>帖子</span>
            </Link>
            {session?.user && (
              <>
                <div className="border-t border-[#1e1f22] my-2" />
                <Link
                  href={`/profile/${user.id}`}
                  className="px-4 py-2 text-discord-muted hover:text-white hover:bg-[#35373c] transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={16} />
                  <span>个人主页</span>
                </Link>
                <Link
                  href="/settings"
                  className="px-4 py-2 text-discord-muted hover:text-white hover:bg-[#35373c] transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={16} />
                  <span>账户设置</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
