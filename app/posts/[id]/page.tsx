// app/posts/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MessageSquare, Eye, Trash2, MoreHorizontal, Share2 } from 'lucide-react'
import Link from 'next/link'
import CommentList from '@/components/comment/CommentList'

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
    slug: string
  }
  _count: {
    comments: number
  }
}

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

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const postId = params.id

  useEffect(() => {
    if (postId) {
      fetchPostData()
    }
  }, [postId])

  const fetchPostData = async () => {
    try {
      setLoading(true)

      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch(`/api/posts/${postId}/comments`),
      ])

      const postData = await postRes.json()
      const commentsData = await commentsRes.json()

      if (postRes.ok) {
        setPost(postData.post || null)
      }

      if (commentsRes.ok) {
        setComments(commentsData.comments || [])
      }
    } catch (error) {
      console.error('获取帖子数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const userId = (session?.user as any)?.id
    if (!session?.user || post?.author.id !== userId) {
      alert('只有作者才能删除帖子')
      return
    }

    try {
      const confirmed = confirm('确定要删除这条帖子吗？')
      if (!confirmed) return

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('帖子已删除')
        router.push('/posts')
      } else {
        const data = await response.json()
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除帖子失败:', error)
      alert('删除失败，请稍后重试')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || '',
          text: post?.content || '',
          url: window.location.href,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 降级到复制链接
      navigator.clipboard?.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-discord-muted text-center py-12">
          加载中...
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22] max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-discord-muted mb-4">未找到该帖子</p>
              <Link href="/posts">
                <Button>返回帖子列表</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <div className="mb-4">
        <Link href="/posts">
          <Button variant="ghost" className="text-discord-muted hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回帖子列表
          </Button>
        </Link>
      </div>

      {/* 帖子主体 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 帖子内容 */}
        <div className="lg:col-span-2">
          <Card className="bg-[#2b2d31] border-[#1e1f22] mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${post.author.id}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar || undefined} />
                      <AvatarFallback className="text-discord-accent">
                        {post.author.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${post.author.id}`}
                      className="text-white font-semibold hover:text-discord-accent transition-colors"
                    >
                      {post.author.username}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-discord-muted" />
                      <span className="text-discord-muted text-sm">
                        {new Date(post.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 操作按钮 */}
                  {session?.user?.id === post.author.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    分享
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 帖子标题 */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {post.title}
              </h1>

              {/* 社区标签 */}
              <Link
                href={`/communities/${post.community.id}`}
                className="inline-block mb-4"
              >
                <Badge variant="secondary" className="bg-discord-accent text-white">
                  {post.community.name}
                </Badge>
              </Link>

              {/* 帖子内容 */}
              <div className="text-discord-text whitespace-pre-wrap leading-relaxed space-y-4">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-0 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* 帖子统计 */}
              <div className="flex gap-6 pt-4 border-t border-[#1e1f22] text-discord-muted text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post._count.comments} 条评论</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{Math.floor(Math.random() * 1000 + 100)} 次浏览</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 作者信息 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">作者</h3>
                <Link
                  href={`/profile/${post.author.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar || undefined} />
                    <AvatarFallback className="text-discord-accent">
                      {post.author.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium">
                      {post.author.username}
                    </div>
                    <div className="text-discord-muted text-xs">
                      {new Date(post.createdAt).toLocaleDateString('zh-CN')} 加入
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* 社区信息 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">所属社区</h3>
                <Link
                  href={`/communities/${post.community.id}`}
                  className="block text-discord-accent hover:text-white transition-colors"
                >
                  {post.community.name}
                </Link>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">快捷操作</h3>
                <div className="space-y-2">
                  <Link href={`/communities/${post.community.id}`} className="block">
                    <Button variant="outline" className="w-full text-left">
                      浏览社区
                    </Button>
                  </Link>
                  <Link href={`/posts/new?community=${post.community.id}`} className="block">
                    <Button variant="outline" className="w-full text-left">
                      发布新帖
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 帖子标签 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">热门话题</h3>
                <div className="flex flex-wrap gap-2">
                  {['人工智能', '机器学习', '软件开发', '云计算', '区块链', '网络安全', '前端开发'].map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-[#35373c]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 评论区域 */}
        <Card className="bg-[#2b2d31] border-[#1e1f22] mt-6">
          <CardHeader>
            <CardTitle className="text-white">
              评论 ({post._count.comments})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommentList
              comments={comments}
              postId={postId}
              onCommentAdded={(comment) => {
                setComments((prev) => [...prev, comment])
              }}
              onCommentDeleted={(commentId) => {
                setComments((prev) => prev.filter((c) => c.id !== commentId))
                setPost((prev) => prev ? { ...prev, _count: { comments: prev._count.comments - 1 } } : null)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
