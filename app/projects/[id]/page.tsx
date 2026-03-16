'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, Heart, MessageSquare, Eye, Share2, Github } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string | null
  githubUrl: string | null
  codeSnippet: string | null
  imageUrl: string | null
  tags: string[]
  views: number
  isPrivate: boolean
  minTierRequired: number | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    username: string
    avatar: string | null
    tier?: {
      name: string
      level: number
      color: string
    }
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const projectId = params.id

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setError('需要登录才能查看此项目')
        } else if (response.status === 404) {
          setError('项目不存在或没有权限查看')
        } else {
          setError('加载项目失败')
        }
      } else {
        setProject(data.project)
      }
    } catch (err) {
      console.error('加载项目错误:', err)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？')) return

    setDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/')
      } else {
        setError('删除失败')
      }
    } catch (err) {
      console.error('删除项目错误:', err)
      setError('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleLike = async () => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setProject({ ...project, _count: { ...project._count, likes: project._count.likes + (data.liked ? 1 : -1) } })
      }
    } catch (err) {
      console.error('点赞错误:', err)
      setError('点赞失败')
    }
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <Card className="max-w-md bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-red-500">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#dbdee1]">{error}</p>
            <Button onClick={() => router.back()}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#313338]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <Share2 className="h-4 w-4 text-[#b5bac1]" />
              返回
            </Button>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? '删除中...' : '删除'}
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-[#f2f3f5]">
            {project.title}
          </h1>
          {project.isPrivate && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3 text-[#dbdee1]" />
              私密
            </Badge>
          )}
        </div>

        {/* 作者信息和等级 */}
        <div className="flex items-center gap-4">
          <Link href={`/profile/${project.author.id}`} className="flex items-center gap-2 hover:underline">
            <Avatar>
              <AvatarImage src={project.author.avatar || undefined} />
              <AvatarFallback>{project.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {project.author.tier && (
              <Badge
                className="text-xs"
                style={{ backgroundColor: project.author.tier.color }}
              >
                {project.author.tier.name}
              </Badge>
            )}
          </Link>
        </div>

        <div className="text-[#b5bac1] text-sm">
          发布于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* 项目描述 */}
      <Card className="bg-[#2b2d31] border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-white">项目描述</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#dbdee1] whitespace-pre-wrap mb-4">
            {project.description || '暂无描述'}
          </p>
          {project.minTierRequired && (
            <div className="flex items-center gap-2 text-[#b5bac1] text-sm">
              <Shield className="h-4 w-4" />
              <span>需要 {project.minTierRequired} 级以上查看</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub 链接 */}
      {project.githubUrl && (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">源码链接</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#5865f2] hover:underline"
            >
              <Github className="h-5 w-5" />
              <span>查看源码</span>
            </a>
          </CardContent>
        </Card>
      )}

      {/* 代码片段 */}
      {project.codeSnippet && (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">代码片段</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-[#1e1f22] text-[#dbdee1] p-4 rounded-md overflow-x-auto">
              <code>{project.codeSnippet}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">统计信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#b5bac1]" />
                <span>{project.views}</span>
                <span className="text-sm text-[#b5bac1]">查看次数</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#b5bac1]" />
                <span>{project._count.likes}</span>
                <span className="text-sm text-[#b5bac1]">点赞数</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#b5bac1]" />
                <span>{project._count.comments}</span>
                <span className="text-sm text-[#b5bac1]">评论数</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">互动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={project._count.likes > 0 ? 'outline' : 'ghost'}
                onClick={handleLike}
              className="text-[#b5bac1]"
              >
                <Heart className="h-4 w-4" />
                {project._count.likes > 0 ? '取消点赞' : '点赞'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签 */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
