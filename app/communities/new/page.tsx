// app/communities/new/page.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateCommunityData {
  name: string
  description: string
}

export default function CreateCommunityPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCommunityData>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Partial<CreateCommunityData>>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CreateCommunityData]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof CreateCommunityData]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCommunityData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '社区名称不能为空'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '社区名称不能超过 50 个字符'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = '描述不能超过 200 个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!session?.user) {
      alert('请先登录')
      router.push('/login')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('社区创建成功！')
        router.push(`/communities/${data.community.id}`)
      } else {
        alert(data.error?.message || '社区创建失败')
      }
    } catch (error) {
      console.error('创建社区失败:', error)
      alert('社区创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-discord-muted text-center py-12">
          加载中...
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22] max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">需要登录</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-discord-muted mb-4">
                创建社区需要先登录
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  登录
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                >
                  注册
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card className="bg-[#2b2d31] border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-white">创建新社区</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 社区名称 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                社区名称 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="输入社区名称"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}
            </div>

            {/* 社区描述 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                社区描述（可选）
              </Label>
              <Textarea
                id="description"
                placeholder="描述社区的主题和目标（可选）"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white resize-none"
                rows={4}
                maxLength={200}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#1e1f22]">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/communities')}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-discord-accent hover:bg-[#5865f2]"
              >
                {loading ? '创建中...' : '创建社区'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
