// components/navigation/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/projects', label: '项目' },
    { href: '/communities', label: '社区' },
    { href: '/about', label: '关于' }
  ]

  return (
    <nav className="bg-[#1e1f22] border-b border-[#2b2d31] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo 和导航链接 */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white font-bold text-xl">
              AI 社区
            </Link>

            <div className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'text-white bg-[#4e5058]'
                      : 'text-discord-muted hover:text-white hover:bg-[#4e5058]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 全局搜索 */}
          <GlobalSearch />

          {/* 用户菜单 */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/notifications"
                  className={`relative px-3 py-2 rounded-md transition-colors ${
                    isActive('/notifications')
                      ? 'text-white bg-[#4e5058]'
                      : 'text-discord-muted hover:text-white hover:bg-[#4e5058]'
                  }`}
                >
                  🔔
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive('/profile')
                      ? 'text-white bg-[#4e5058]'
                      : 'text-discord-muted hover:text-white hover:bg-[#4e5058]'
                  }`}
                >
                  {session.user.username}
                </Link>
                <Link
                  href="/settings"
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive('/settings')
                      ? 'text-white bg-[#4e5058]'
                      : 'text-discord-muted hover:text-white hover:bg-[#4e5058]'
                  }`}
                >
                  设置
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-discord-muted hover:text-white px-3 py-2 rounded-md transition-colors hover:bg-[#4e5058]"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-discord-muted hover:text-white px-3 py-2 rounded-md transition-colors hover:bg-[#4e5058]"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-discord-accent hover:bg-[#5865f2] text-white px-4 py-2 rounded-md transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
