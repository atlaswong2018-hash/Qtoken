// app/settings/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileData, setProfileData] = useState({
    username: session?.user?.username || '',
    email: session?.user?.email || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '更新失败')
      } else {
        setSuccess('个人资料更新成功')
        // 更新会话
        if (data.user) {
          await update({ user: data.user })
        }
      }
    } catch (error) {
      setError('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('密码至少需要 8 个字符')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '更新失败')
      } else {
        setSuccess('密码更新成功，请重新登录')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })

        // 延迟 2 秒后退出登录
        setTimeout(() => {
          signIn('credentials', {
            username: profileData.username,
            password: passwordData.newPassword,
            redirect: false
          })
        }, 2000)
      }
    } catch (error) {
      setError('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            账户设置
          </h1>
          <p className="text-discord-muted">
            管理你的个人资料和安全设置
          </p>
        </div>

        <Card className="bg-discord-card border-[#1e1f22]">
          <div className="flex border-b border-[#1e1f22]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-discord-accent'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              个人资料
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === 'password'
                  ? 'text-white border-b-2 border-discord-accent'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              修改密码
            </button>
          </div>

          <CardContent className="p-6">
            {error && (
              <div className="bg-[#da373c] text-white px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-[#3ba55c] text-white px-4 py-2 rounded mb-4">
                {success}
              </div>
            )}

            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-discord-text">
                    用户名
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    required
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-discord-text">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-discord-accent hover:bg-[#5865f2]"
                >
                  {loading ? '更新中...' : '保存更改'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-discord-text">
                    当前密码
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-discord-text">
                    新密码
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-discord-text">
                    确认新密码
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>

                <div className="text-sm text-discord-muted">
                  密码至少需要 8 个字符
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-discord-accent hover:bg-[#5865f2]"
                >
                  {loading ? '更新中...' : '更新密码'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
