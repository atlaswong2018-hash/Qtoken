// app/posts/[id]/page.tsx
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

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
  community: {
    id: string
    name: string
  }
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchPostAndComments() {
      setLoading(true)
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${params.id}`),
          fetch(`/api/posts/${params.id}/comments`)
        ])

        if (!postRes.ok) {
          router.push('/communities')
          return
        }

        const postData = await postRes.json()
        const commentsData = await commentsRes.json()

        setPost(postData.post)
        setComments(commentsData.comments || [])
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostAndComments()
  }, [params.id, router])

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: params.id
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

  if (!post) {
    return (
      <div className="min-h-screen bg-discord-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-discord-muted text-center py-12">
            帖子不存在
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 帖子内容 */}
        <div className="bg-[#2b2d31] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <a
              href={`/communities/${post.community.id}`}
              className="text-discord-accent hover:underline text-sm"
            >
              {post.community.name}
            </a>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-discord-muted">
              作者：{post.author.username}
            </span>
            <span className="text-discord-muted">
              · {new Date(post.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>

          <div className="text-white whitespace-pre-wrap leading-relaxed">
            {post.content}
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
