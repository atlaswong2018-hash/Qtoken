// app/projects/new/page.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface CreateProjectData {
  name: string
  description: string
  repository: string
  website: string
  tags: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    repository: '',
    website: '',
    tags: '',
  })
  const [errors, setErrors] = useState<Partial<CreateProjectData>>({})

  const predefinedTags = [
    'AI',
    '机器学习',
    '计算机视觉',
    '自然语言处理',
    '数据科学',
    '深度学习',
    '机器人技术',
    '区块链',
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CreateProjectData]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof CreateProjectData]
        return newErrors
      })
    }
  }

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (currentTags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: currentTags.filter((t) => t !== tag).join(', '),
      }))
    } else if (currentTags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...currentTags, tag].join(', '),
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProjectData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '项目名称不能超过 100 个字符'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过 500 个字符'
    }

    if (formData.repository && !isValidUrl(formData.repository)) {
      newErrors.repository = '请输入有效的 GitHub 仓库链接'
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = '请输入有效的网站链接'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
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

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          repository: formData.repository.trim() || undefined,
          website: formData.website.trim() || undefined,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('项目创建成功！')
        router.push(`/projects/${data.project.id}`)
      } else {
        alert(data.error?.message || '项目创建失败')
      }
    } catch (error) {
      console.error('创建项目失败:', error)
      alert('项目创建失败，请稍后重试')
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
                创建项目需要先登录
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

  const selectedTags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card className="bg-[#2b2d31] border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-white">创建新项目</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                项目名称 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}
            </div>

            {/* 项目描述 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                项目描述
              </Label>
              <Textarea
                id="description"
                placeholder="描述你的项目（可选）"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white resize-none"
                rows={4}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description}</p>
              )}
            </div>

            {/* GitHub 仓库 */}
            <div className="space-y-2">
              <Label htmlFor="repository" className="text-white">
                GitHub 仓库链接（可选）
              </Label>
              <Input
                id="repository"
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.repository}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
              {errors.repository && (
                <p className="text-red-400 text-sm">{errors.repository}</p>
              )}
            </div>

            {/* 项目网站 */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-white">
                项目网站（可选）
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleInputChange}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
              {errors.website && (
                <p className="text-red-400 text-sm">{errors.website}</p>
              )}
            </div>

            {/* 标签选择 */}
            <div className="space-y-2">
              <Label className="text-white">
                项目标签（最多 5 个）
              </Label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-discord-accent text-white'
                        : 'bg-[#1e1f22] text-discord-muted hover:text-white'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-2 text-sm text-discord-muted">
                  已选择: {selectedTags.join(', ')}
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, tags: '' }))}
                    className="ml-2 text-discord-accent hover:underline"
                  >
                    清除
                  </button>
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#1e1f22]">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-discord-accent hover:bg-[#5865f2]"
              >
                {loading ? '创建中...' : '创建项目'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
