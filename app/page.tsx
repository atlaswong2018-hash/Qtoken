// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectCard from '@/components/project/ProjectCard'
import ProjectFilters from '@/components/filters/ProjectFilters'
import StatsCard from '@/components/stats/StatsCard'
import TrendingCard from '@/components/trending/TrendingCard'

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

export default function HomePage() {
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
    <div className="min-h-screen bg-discord-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                AI 作品广场
              </h1>
              <p className="text-discord-muted mb-6">
                发现和分享精彩的 AI 项目，与社区一起成长
              </p>
            </div>

            <div className="mb-8">
              <ProjectFilters
                search={search}
                onSearchChange={setSearch}
                tag={tag}
                onTagChange={setTag}
                onCreateProject={() => router.push('/projects/new')}
              />
            </div>

            {loading ? (
              <div className="text-discord-muted text-center py-12">
                加载中...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-discord-muted text-center py-12">
                暂无项目
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-8">
            <TrendingCard />
            <StatsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
