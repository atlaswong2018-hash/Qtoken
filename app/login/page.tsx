'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('登录错误:', error)
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <Card className="w-full max-w-md bg-[#2b2d31] border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#f2f3f5]">欢迎回来</CardTitle>
          <CardDescription className="text-[#b5bac1]">
            登录到 AI 社区平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#dbdee1]">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#dbdee1]">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-[#b5bac1]">
            还没有账号？{' '}
            <a href="/register" className="text-[#00a8fc] hover:underline">
              注册
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
