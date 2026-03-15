'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProjectCard from '@/components/project/ProjectCard'

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
  isPrivate: boolean
  _count: {
    likes: number
    comments: number
  }
}

export default function HomePage() {
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
    <div className="min-h-screen bg-[#313338]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f2f3f5] mb-4">
            AI 作品广场
          </h1>
          <div className="flex gap-4">
            <Input
              placeholder="搜索项目..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
            />
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1] rounded-md px-3 py-2"
            >
              <option value="">所有标签</option>
              <option value="ai">AI</option>
              <option value="machine-learning">机器学习</option>
              <option value="computer-vision">计算机视觉</option>
              <option value="nlp">自然语言处理</option>
              <option value="computer-science">数据科学</option>
              <option value="deep-learning">深度学习</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-[#b5bac1] text-center py-12">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-[#b5bac1] text-center py-12">
            暂无项目
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
