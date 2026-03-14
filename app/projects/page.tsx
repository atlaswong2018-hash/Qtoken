// app/projects/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectCard from '@/components/project/ProjectCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Project {
  id: string
  title: string
  description: string | null
  author: {
    id: string
    username: string
    avatar: string | null
  }
  tags: string[]
  views: number
  _count: {
    likes: number
    comments: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (tag) params.append('tag', tag)
      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [search, tag])

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              项目广场
            </h1>
            <p className="text-discord-muted">
              发现和分享精彩的 AI 项目，与社区一起成长
            </p>
          </div>
          <Button
            onClick={() => router.push('/projects/new')}
            className="bg-discord-accent hover:bg-[#4752c4]"
          >
            创建项目
          </Button>
        </div>

        <div className="mb-8 bg-[#2b2d31] rounded-lg p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索项目..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-[#1e1f22] border-[#1e1f22] text-white rounded-md px-3 py-2"
            >
              <option value="">所有标签</option>
              <option value="ai">AI</option>
              <option value="machine-learning">机器学习</option>
              <option value="computer-vision">计算机视觉</option>
              <option value="nlp">自然语言处理</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-discord-muted text-center py-12">
            加载中...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-discord-muted text-center py-12">
            {search || tag ? '没有找到匹配的项目' : '暂无项目'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
