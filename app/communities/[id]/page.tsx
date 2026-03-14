// app/communities/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    name: string
  }
}

interface Community {
  id: string
  name: string
  description: string | null
  memberCount: number
  createdAt: string
}

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchCommunityAndPosts() {
      setLoading(true)
      try {
        const [communityRes, postsRes] = await Promise.all([
          fetch(`/api/communities/${params.id}`),
          fetch(`/api/posts?communityId=${params.id}`)
        ])

        if (!communityRes.ok) {
          router.push('/communities')
          return
        }

        const communityData = await communityRes.json()
        const postsData = await postsRes.json()

        setCommunity(communityData.community)
        setPosts(postsData.posts || [])
      } catch (error) {
        console.error('Failed to fetch community:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityAndPosts()
  }, [params.id, router])

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPost,
          communityId: params.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error?.message || '创建帖子失败')
        return
      }

      const data = await response.json()
      setPosts([data.post, ...posts])
      setNewPost({ title: '', content: '' })
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('创建帖子失败')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-discord-bg p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-discord-muted text-center py-12">
            加载中...
          </div>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-discord-bg p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-discord-muted text-center py-12">
            社区不存在
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 社区信息头部 */}
        <div className="bg-[#2b2d31] rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {community.name}
          </h1>
          <div className="text-discord-muted mb-4">
            {community.description || '暂无描述'}
          </div>
          <div className="flex gap-6 text-discord-muted text-sm">
            <span>成员数：{community.memberCount}</span>
            <span>
              创建于：{new Date(community.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="mt-4 bg-discord-accent hover:bg-[#5865f2] text-white px-4 py-2 rounded-md transition-colors"
          >
            发布新帖子
          </button>
        </div>

        {/* 帖子列表 */}
        <h2 className="text-xl font-bold text-white mb-4">帖子列表</h2>
        {posts.length === 0 ? (
          <div className="text-discord-muted text-center py-12">
            暂无帖子
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors p-4 rounded-lg"
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {post.title}
                </h3>
                <div className="text-discord-muted mb-3 line-clamp-3">
                  {post.content}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-discord-muted">
                      作者：{post.author.username}
                    </span>
                    <span className="text-discord-muted">
                      · {new Date(post.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <a
                    href={`/posts/${post.id}`}
                    className="text-discord-accent hover:underline"
                  >
                    查看详情
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 创建帖子对话框 */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#313338] rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  发布新帖子
                </h3>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="text-discord-muted hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <label className="block text-discord-muted mb-2 text-sm">
                    标题
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className="w-full bg-[#1e1f22] border-[#1e1f22] text-white px-3 py-2 rounded-md focus:outline-none focus:border-discord-accent"
                    placeholder="输入帖子标题"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-discord-muted mb-2 text-sm">
                    内容
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    className="w-full bg-[#1e1f22] border-[#1e1f22] text-white px-3 py-2 rounded-md focus:outline-none focus:border-discord-accent min-h-[200px]"
                    placeholder="输入帖子内容"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="px-4 py-2 text-discord-muted hover:text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-discord-accent hover:bg-[#5865f2] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {creating ? '发布中...' : '发布'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
