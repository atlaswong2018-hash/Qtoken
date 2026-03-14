// app/projects/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

function TagInput({ tags, setTags }: TagInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = input.trim()
      if (value && !tags.includes(value)) {
        setTags([...tags, value])
        setInput('')
      }
    } else if (e.key === 'Backspace' && input === '') {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tags" className="text-discord-text">标签</Label>
      <div className="flex flex-wrap gap-2 p-2 bg-[#1e1f22] border-[#1e1f22] rounded-md min-h-[48px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-discord-accent text-white px-2 py-1 rounded text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-[#5865f2] rounded px-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="tags"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入标签，按 Enter 或逗号添加"
          className="flex-1 bg-transparent border-none text-white focus:outline-none min-w-[150px]"
        />
      </div>
      <p className="text-xs text-discord-muted">
        按回车或逗号添加标签，点击 × 删除
      </p>
    </div>
  )
}

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repository: '',
    website: ''
  })
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-discord-bg flex items-center justify-center">
        <div className="text-discord-muted">加载中...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tags.length > 0 ? tags : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '创建项目失败')
      } else {
        router.push(`/projects/${data.project.id}`)
      }
    } catch (error) {
      setError('创建项目失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            创建新项目
          </h1>
          <p className="text-discord-muted">
            分享你的 AI 项目，与社区交流
          </p>
        </div>

        <Card className="bg-discord-card border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">项目信息</CardTitle>
            <CardDescription className="text-discord-muted">
              填写项目的基本信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-discord-text">
                  项目名称 *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="例如：AI 图像识别助手"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-discord-text">
                  项目描述 *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="描述你的项目功能、技术栈和使用场景..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="bg-[#1e1f22] border-[#1e1f22] text-white min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repository" className="text-discord-text">
                  仓库地址
                </Label>
                <Input
                  id="repository"
                  name="repository"
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.repository}
                  onChange={handleChange}
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-discord-text">
                  官方网站
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://your-project.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                />
              </div>

              <TagInput tags={tags} setTags={setTags} />

              {error && (
                <div className="bg-[#da373c] text-white px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-discord-accent hover:bg-[#5865f2]"
                >
                  {loading ? '创建中...' : '创建项目'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
