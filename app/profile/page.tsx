// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

interface Post {
  id: string
  title: string
  createdAt: string
  community: {
    name: string
    id: string
  }
}

interface Project {
  id: string
  name: string
  description: string
  likes: number
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'posts'>('projects')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    async function fetchUserData() {
      if (!session?.user) return

      setLoading(true)
      try {
        const [projectsRes, postsRes] = await Promise.all([
          fetch(`/api/projects?authorId=${session.user.id}`),
          fetch(`/api/posts?authorId=${session.user.id}`)
        ])

        const projectsData = await projectsRes.json()
        const postsData = await postsRes.json()

        setUserProjects(projectsData.projects || [])
        setUserPosts(postsData.posts || [])
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUserData()
    }
  }, [session, status, router])

  async function handleLogout() {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
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

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 用户信息卡片 */}
        <div className="bg-[#2b2d31] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {session?.user?.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.username}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-4xl font-bold">
                  {session?.user?.username?.[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {session?.user?.username}
              </h1>
              <div className="text-discord-muted mb-4">
                {session?.user?.email}
              </div>

              <button
                onClick={handleLogout}
                className="bg-[#da373c] hover:bg-[#b32c30] text-white px-4 py-2 rounded-md transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProjects.length}
              </div>
              <div className="text-discord-muted">项目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userPosts.length}
              </div>
              <div className="text-discord-muted">帖子</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProjects.reduce((sum, p) => sum + p.likes, 0)}
              </div>
              <div className="text-discord-muted">获得点赞</div>
            </div>
          </div>
        </div>

        {/* 用户内容 */}
        <div className="bg-[#2b2d31] rounded-lg">
          <div className="flex border-b border-[#1e1f22]">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === 'projects'
                  ? 'text-white border-b-2 border-discord-accent'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              我的项目
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === 'posts'
                  ? 'text-white border-b-2 border-discord-accent'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              我的帖子
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'projects' ? (
              userProjects.length === 0 ? (
                <div className="text-discord-muted text-center py-12">
                  暂无项目，<a href="/projects/new" className="text-discord-accent hover:underline">创建第一个项目</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {userProjects.map((project) => (
                    <a
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block bg-[#383a40] hover:bg-[#424549] p-4 rounded-lg transition-colors"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">
                        {project.name}
                      </h3>
                      <div className="text-discord-muted mb-2 line-clamp-2">
                        {project.description || '暂无描述'}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-discord-muted">
                          {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="text-discord-muted">
                          ❤️ {project.likes}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )
            ) : (
              userPosts.length === 0 ? (
                <div className="text-discord-muted text-center py-12">
                  暂无帖子，<a href="/communities" className="text-discord-accent hover:underline">去社区发帖</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <a
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block bg-[#383a40] hover:bg-[#424549] p-4 rounded-lg transition-colors"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-discord-muted">
                        <span>{post.community.name}</span>
                        <span>·</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
