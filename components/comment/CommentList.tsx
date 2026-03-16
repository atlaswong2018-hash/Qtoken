// components/comment/CommentList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, MoreHorizontal, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

interface CommentListProps {
  comments: Comment[]
  projectId?: string
  postId?: string
  onCommentAdded?: (comment: Comment) => void
  onCommentDeleted?: (commentId: string) => void
}

export default function CommentList({
  comments,
  projectId,
  postId,
  onCommentAdded,
  onCommentDeleted
}: CommentListProps) {
  const { data: session } = useSession()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user || !newComment.trim() || submitting) return

    try {
      setSubmitting(true)

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          projectId,
          postId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewComment('')
        onCommentAdded?.(data.comment)
      } else {
        alert(data.error?.message || '评论发布失败')
      }
    } catch (error) {
      console.error('评论失败:', error)
      alert('评论发布失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!session?.user) return

    try {
      const confirmed = confirm('确定要删除这条评论吗？')
      if (!confirmed) return

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onCommentDeleted?.(commentId)
      } else {
        const data = await response.json()
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败')
    }
  }

  const handleSubmitReply = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user || !replyContent.trim() || submitting) return

    try {
      setSubmitting(true)

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          projectId,
          postId,
          parentId: commentId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setReplyingTo(null)
        setReplyContent('')
        onCommentAdded?.(data.comment)
      } else {
        alert(data.error?.message || '回复失败')
      }
    } catch (error) {
      console.error('回复失败:', error)
      alert('回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 评论输入框 */}
      {session?.user && (projectId || postId) && (
        <form onSubmit={handleSubmit} className="bg-[#2b2d31] border border-[#1e1f22] rounded-lg p-4">
          <Textarea
            placeholder={projectId ? '写下你对这个项目的看法...' : '写下你的想法...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-[#1e1f22] border-[#1e1f22] text-white resize-none mb-4"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-discord-accent hover:bg-[#5865f2]"
            >
              {submitting ? '发布中...' : '发布评论'}
            </Button>
          </div>
        </form>
      )}

      {!session?.user && (
        <div className="bg-[#2b2d31] border border-[#1e1f22] rounded-lg p-4 text-center">
          <p className="text-discord-muted text-sm">
            <Button variant="link" asChild>
              <Link href="/login" className="text-discord-accent">
                登录
              </Link>
            </Button>
            后参与讨论
          </p>
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-discord-muted">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无评论</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-[#2b2d31] border border-[#1e1f22] rounded-lg p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatar || undefined} />
                    <AvatarFallback>
                      {comment.author.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">
                          {comment.author.username}
                        </span>
                        <span className="text-discord-muted text-sm">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-discord-text break-words">
                        {comment.content}
                      </p>

                      {/* 回复输入框 */}
                      {replyingTo === comment.id && session?.user && (
                        <form onSubmit={(e) => handleSubmitReply(comment.id, e)} className="mt-4">
                          <Textarea
                            placeholder="回复这条评论..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="bg-[#1e1f22] border-[#1e1f22] text-white resize-none mb-2"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!replyContent.trim() || submitting}
                              className="bg-discord-accent hover:bg-[#5865f2]"
                            >
                              {submitting ? '发送中...' : '回复'}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setReplyingTo(null)}
                            >
                              取消
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* 回复按钮 */}
                      {replyingTo !== comment.id && session?.user && (
                        <button
                          onClick={() => {
                            setReplyingTo(comment.id)
                            setReplyContent('')
                          }}
                          className="text-discord-accent text-sm hover:text-white transition-colors mt-2"
                        >
                          回复
                        </button>
                      )}
                    </div>

                    {/* 评论操作菜单 */}
                    {session?.user?.id === comment.author.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-discord-muted hover:text-white">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-400 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>删除评论</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
