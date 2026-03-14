// app/projects/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
}

interface Project {
  id: string
  name: string
  description: string
  repository: string | null
  website: string | null
  tags: string[]
  likes: number
  createdAt: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    async function fetchProjectAndComments() {
      setLoading(true)
      try {
        const [projectRes, commentsRes] = await Promise.all([
          fetch(`/api/projects/${params.id}`),
          fetch(`/api/projects/${params.id}/comments`)
        ])

        if (!projectRes.ok) {
          router.push('/')
          return
        }

        const projectData = await projectRes.json()
        const commentsData = await commentsRes.json()

        setProject(projectData.project)
        setComments(commentsData.comments || [])

        // 检查是否已点赞（需要登录状态，这里简化处理）
        const likeRes = await fetch(`/api/projects/${params.id}/like`, {
          method: 'GET'
        })
        if (likeRes.ok) {
          const likeData = await likeRes.json()
          setLiked(likeData.liked || false)
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectAndComments()
  }, [params.id, router])

  async function handleLike() {
    try {
      const response = await fetch(`/api/projects/${params.id}/like`, {
        method: 'POST'
      })

      if (!response.ok) {
        alert('点赞失败，请先登录')
        return
      }

      const data = await response.json()
      setLiked(data.liked)
      if (project) {
        setProject({ ...project, likes: data.likes })
      }
    } catch (error) {
      console.error('Failed to like project:', error)
      alert('点赞失败')
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          projectId: params.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error?.message || '发表评论失败')
        return
      }

      const data = await response.json()
      setComments([...comments, data.comment])
      setNewComment('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('发表评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-discord-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-discord-muted text-center py-12">
            加载中...
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-discord-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-discord-muted text-center py-12">
            项目不存在
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 项目信息 */}
        <div className="bg-[#2b2d31] rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">
              {project.name}
            </h1>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                liked
                  ? 'bg-discord-accent text-white'
                  : 'bg-[#4e5058] text-discord-muted hover:bg-[#5865f2] hover:text-white'
              }`}
            >
              <span>❤️</span>
              <span>{project.likes}</span>
            </button>
          </div>

          <div className="text-discord-muted mb-4">
            {project.description || '暂无描述'}
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-discord-muted">
              作者：{project.author.username}
            </span>
            <span className="text-discord-muted">
              · {new Date(project.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#4e5058] text-discord-muted text-sm px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-discord-accent hover:underline"
              >
                仓库地址
              </a>
            )}
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-discord-accent hover:underline"
              >
                官方网站
              </a>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-[#2b2d31] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            评论 ({comments.length})
          </h2>

          {/* 发表评论表单 */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-[#1e1f22] border-[#1e1f22] text-white px-3 py-2 rounded-md focus:outline-none focus:border-discord-accent min-h-[100px]"
              placeholder="写下你的评论..."
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-discord-accent hover:bg-[#5865f2] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {submitting ? '发表中...' : '发表评论'}
            </button>
          </form>

          {/* 评论列表 */}
          {comments.length === 0 ? (
            <div className="text-discord-muted text-center py-8">
              暂无评论，快来发表第一条评论吧！
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-t border-[#1e1f22] pt-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold">
                          {comment.author.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">
                          {comment.author.username}
                        </span>
                        <span className="text-discord-muted text-sm">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-discord-muted">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
