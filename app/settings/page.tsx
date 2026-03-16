// app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Lock, Mail, Globe, Github, Twitter, Key, LogOut, Camera, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(session?.user?.avatar || null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.user?.avatar || null)

  // 个人资料表单
  const [profileData, setProfileData] = useState({
    username: session?.user?.username || '',
    email: session?.user?.email || '',
    bio: session?.user?.bio || '',
    location: session?.user?.location || '',
    website: session?.user?.website || '',
    github: session?.user?.github || '',
    twitter: session?.user?.twitter || '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileSaving, setProfileSaving] = useState(false)

  // 密码修改表单
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        username: session.user.username || '',
        email: session.user.email || '',
        bio: session.user.bio || '',
        location: session.user.location || '',
        website: session.user.website || '',
        github: session.user.github || '',
        twitter: session.user.twitter || '',
      })
      setAvatar(session.user.avatar || null)
      setAvatarPreview(session.user.avatar || null)
    }
  }, [session?.user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!profileData.username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (profileData.username.length < 3) {
      newErrors.username = '用户名至少需要 3 个字符'
    } else if (profileData.username.length > 20) {
      newErrors.username = '用户名不能超过 20 个字符'
    }

    if (!profileData.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (profileData.bio && profileData.bio.length > 200) {
      newErrors.bio = '简介不能超过 200 个字符'
    }

    if (profileData.website && !isValidUrl(profileData.website)) {
      newErrors.website = '请输入有效的网站链接'
    }

    setProfileErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      setProfileSaving(true)

      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username.trim(),
          email: profileData.email.trim(),
          bio: profileData.bio.trim() || undefined,
          location: profileData.location.trim() || undefined,
          website: profileData.website.trim() || undefined,
          github: profileData.github.trim() || undefined,
          twitter: profileData.twitter.trim() || undefined,
          avatar: avatar || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('个人资料更新成功！')
        await update({ user: data.user })
      } else {
        alert(data.error?.message || '更新失败')
      }
    } catch (error) {
      console.error('更新个人资料失败:', error)
      alert('更新失败，请稍后重试')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = '新密码至少需要 8 个字符'
    } else if (passwordData.newPassword.length > 32) {
      newErrors.newPassword = '新密码不能超过 32 个字符'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setPasswordErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      setPasswordSaving(true)

      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        alert('密码修改成功，请重新登录')
        await signOut({ callbackUrl: '/login' })
      } else {
        const data = await response.json()
        alert(data.error?.message || '密码修改失败')
      }
    } catch (error) {
      console.error('密码修改失败:', error)
      alert('密码修改失败，请稍后重试')
    } finally {
      setPasswordSaving(false)
    }
  }

  const isValidUrl = (url: string): boolean => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (!session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22] max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
              <p className="text-discord-muted mb-4">请先登录访问设置</p>
              <Button onClick={() => window.location.href = '/login'}>
                前往登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">账户设置</h1>
        <p className="text-discord-muted">
          管理你的个人资料、安全设置和偏好设置
        </p>
      </div>

      {/* 用户卡片 */}
      <Card className="bg-[#2b2d31] border-[#1e1f22] mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-3xl bg-discord-accent text-white">
                {session?.user?.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {session?.user?.username}
              </h2>
              <p className="text-discord-muted text-sm">
                {session?.user?.email}
              </p>

              <div className="flex gap-2 mt-4">
                <Badge variant="secondary">
                  <User className="h-3 w-3 mr-1" />
                  管理员
                </Badge>
                <span className="text-discord-muted text-sm">
                  加入于 {new Date(session?.user?.createdAt || '').toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e1f22] pt-4 mt-4">
            <div className="flex gap-4 text-sm text-discord-muted">
              <span>ID: {session?.user?.id}</span>
              <span>创建于: {new Date(session?.user?.createdAt || '').toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 设置选项卡 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="password">
            <Key className="h-4 w-4 mr-2" />
            安全设置
          </TabsTrigger>
        </TabsList>

        {/* 个人资料设置 */}
        <TabsContent value="profile">
          <Card className="bg-[#2b2d31] border-[#1e1f22]">
            <CardContent className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* 头像上传 */}
                <div className="space-y-2">
                  <Label className="text-white">头像</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="头像预览"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#1e1f22] flex items-center justify-center">
                          <Camera className="h-8 w-8 text-discord-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvatar(null)
                          setAvatarPreview(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        选择文件
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 用户名 */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    用户名 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                  {profileErrors.username && (
                    <p className="text-red-400 text-sm">{profileErrors.username}</p>
                  )}
                </div>

                {/* 邮箱 */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    邮箱 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                  {profileErrors.email && (
                    <p className="text-red-400 text-sm">{profileErrors.email}</p>
                  )}
                </div>

                {/* 简介 */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    个人简介（可选）
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="介绍一下你自己..."
                    className="bg-[#1e1f22] border-[#1e1f22] text-white resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-discord-muted text-xs">
                    {profileData.bio ? profileData.bio.length : 0}/200 字符
                  </p>
                  {profileErrors.bio && (
                    <p className="text-red-400 text-sm">{profileErrors.bio}</p>
                  )}
                </div>

                {/* 社交链接 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      个人网站（可选）
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      className="bg-[#1e1f22] border-[#1e1f22] text-white"
                    />
                    {profileErrors.website && (
                      <p className="text-red-400 text-sm">{profileErrors.website}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github" className="text-white flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub（可选）
                    </Label>
                    <Input
                      id="github"
                      type="text"
                      placeholder="username"
                      value={profileData.github}
                      onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                      className="bg-[#1e1f22] border-[#1e1f22] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-white flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter（可选）
                    </Label>
                    <Input
                      id="twitter"
                      type="text"
                      placeholder="@username"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                      className="bg-[#1e1f22] border-[#1e1f22] text-white"
                    />
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4 pt-4 border-t border-[#1e1f22]">
                  <Button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-discord-accent hover:bg-[#5865f2]"
                  >
                    {profileSaving ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="password">
          <Card className="bg-[#2b2d31] border-[#1e1f22]">
            <CardHeader>
              <CardTitle className="text-white">修改密码</CardTitle>
              <CardDescription className="text-discord-muted">
                为了账户安全，建议定期修改密码
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* 当前密码 */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    当前密码 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="输入当前密码"
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-400 text-sm">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* 新密码 */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    新密码 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="输入新密码（8-32 字符）"
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-400 text-sm">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* 确认新密码 */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    确认新密码 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="再次输入新密码"
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-400 text-sm">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* 密码要求提示 */}
                <div className="bg-[#1e1f22] rounded-md p-4 text-sm text-discord-muted">
                  <p className="mb-2 font-medium">密码要求：</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>长度在 8 到 32 个字符之间</li>
                    <li>两次输入的密码必须一致</li>
                    <li>建议包含大小写字母、数字和特殊字符</li>
                  </ul>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4 pt-4 border-t border-[#1e1f22]">
                  <Button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-discord-accent hover:bg-[#5865f2]"
                  >
                    {passwordSaving ? '修改中...' : '确认修改'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })}
                  >
                    重置
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 退出登录 */}
      <Card className="bg-[#2b2d31] border-[#1e1f22]">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-discord-muted mb-4">需要退出登录吗？</p>
            <Button
              variant="outline"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                const confirmed = confirm('确定要退出登录吗？')
                if (confirmed) {
                  signOut({ callbackUrl: '/login' })
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
