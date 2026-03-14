// app/projects/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectCard from '@/components/project/ProjectCard'
import { Pagination } from '@/components/pagination/Pagination'
import ProjectFilters from '@/components/filters/ProjectFilters'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import EmptyState from '@/components/states/EmptyState'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  })

  const fetchProjects = async (page: number = currentPage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pagination.limit.toString())
      if (search) params.append('search', search)
      if (tag) params.append('tag', tag)
      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
      setPagination({
        ...pagination,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1
      })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects(1)
  }, [search, tag])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProjects(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

        <ProjectFilters
          search={search}
          onSearchChange={setSearch}
          tag={tag}
          onTagChange={setTag}
          onCreateProject={() => router.push('/projects/new')}
        />

        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState
            title={search || tag ? '没有找到匹配的项目' : '暂无项目'}
            description={
              search || tag
                ? '尝试调整搜索关键词或筛选条件'
                : '成为第一个创建项目的用户吧！'
            }
            action={
              !search && !tag
                ? {
                    label: '创建项目',
                    onClick: () => router.push('/projects/new')
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}

            <div className="text-center text-discord-muted mt-4">
              共 {pagination.total} 个项目，第 {pagination.page} / {pagination.totalPages} 页
            </div>
          </>
        )}
      </div>
    </div>
  )
}
