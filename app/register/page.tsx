// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '注册失败')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-bg">
      <Card className="w-full max-w-md bg-discord-card border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">创建账号</CardTitle>
          <CardDescription className="text-discord-muted">
            加入 AI 社区平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-discord-text">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-discord-text">用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-discord-text">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 8 位，包含大小写字母和数字"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-discord-accent hover:bg-[#4752c4]"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-discord-muted">
            已有账号？{' '}
            <a href="/login" className="text-discord-accent hover:underline">
              登录
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
