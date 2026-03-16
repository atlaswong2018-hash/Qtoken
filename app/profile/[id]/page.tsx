'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  MessageSquare,
  Heart,
  Calendar,
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Mail,
  Github,
  Twitter
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  location: string | null
  website: string | null
  github: string | null
  twitter: string | null
  createdAt: Date
  _count: {
    projects: number
    posts: number
    comments: number
    likes: number
  }
}

interface Project {
  id: string
  name: string
  description: string | null
  tags: string[]
  views: number
  _count: {
    likes: number
    comments: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  community: {
    id: string
    name: string
  }
  _count: {
    comments: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'projects' | 'posts'>('projects')

  const userId = params.id

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError('')

      // 并行获取用户信息、项目和帖子
      const [userRes, projectsRes, postsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/projects?authorId=${userId}&limit=6`),
        fetch(`/api/posts?authorId=${userId}&limit=6`)
      ])

      const userData = await userRes.json()
      const projectsData = await projectsRes.json()
      const postsData = await postsRes.json()

      if (!userRes.ok) {
        setError(userData.error?.message || '获取用户信息失败')
      } else {
        setUser(userData.user || null)
        setProjects(projectsData.projects || [])
        setPosts(postsData.posts || [])
      }
    } catch (err) {
      console.error('获取用户错误:', err)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const isOwnProfile = session?.user?.id === userId

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-discord-muted text-center py-12">
          加载中...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="max-w-md bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-red-500">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-discord-muted mb-4">{error}</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="max-w-md bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-discord-muted mb-4">未找到该用户</p>
              <Link href="/">
                <Button>返回首页</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 用户信息卡片 */}
      <Card className="bg-[#2b2d31] border-[#1e1f22] mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-3xl bg-discord-accent text-white">
                  {user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                {user.username}
              </h1>

              {user.bio && (
                <p className="text-discord-muted mb-4">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {user.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </Badge>
                )}

                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </Badge>

                <Badge variant="secondary">
                  {user._count.projects} 个项目
                </Badge>

                <Badge variant="secondary">
                  {user._count.posts} 个帖子
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-discord-accent hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <LinkIcon size={16} />
                    <span>个人网站</span>
                  </a>
                )}

                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-discord-accent hover:text-white transition-colors"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                )}

                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-discord-accent hover:text-white transition-colors"
                  >
                    <Twitter size={16} />
                    <span>Twitter</span>
                  </a>
                )}

                {session?.user?.id !== userId && (
                  <a
                    href={`mailto:${user.email}`}
                    className="text-discord-accent hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Mail size={16} />
                    <span>联系</span>
                  </a>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex-shrink-0">
                <Link href="/settings">
                  <Button variant="outline">编辑资料</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center">
              <FileText className="h-8 w-8 text-discord-accent mb-2" />
              <div className="text-2xl font-bold text-white">
                {user._count.projects}
              </div>
              <div className="text-discord-muted text-sm">项目</div>
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-discord-accent mb-2" />
              <div className="text-2xl font-bold text-white">
                {user._count.posts}
              </div>
              <div className="text-discord-muted text-sm">帖子</div>
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center">
              <Heart className="h-8 w-8 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {user._count.likes}
              </div>
              <div className="text-discord-muted text-sm">获赞</div>
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-discord-accent mb-2" />
              <div className="text-2xl font-bold text-white">
                {user._count.comments}
              </div>
              <div className="text-discord-muted text-sm">评论</div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'projects'
              ? 'bg-discord-accent text-white'
              : 'bg-[#2b2d31] text-discord-muted hover:text-white'
          }`}
        >
          项目 ({user._count.projects})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'posts'
              ? 'bg-discord-accent text-white'
              : 'bg-[#2b2d31] text-discord-muted hover:text-white'
          }`}
        >
          帖子 ({user._count.posts})
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'projects' && (
        <>
          {projects.length === 0 ? (
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
                  <p className="text-discord-muted mb-4">
                    {isOwnProfile ? '你还没有发布任何项目' : '该用户还没有发布任何项目'}
                  </p>
                  {isOwnProfile && (
                    <Link href="/projects/new">
                      <Button>创建第一个项目</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <Link href={`/projects/${project.id}`} className="text-white font-semibold hover:text-discord-accent transition-colors">
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-discord-muted text-sm mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-discord-muted">
                      <span>{project.views} 次浏览</span>
                      <span>{project._count.likes} 个点赞</span>
                      <span>{project._count.comments} 条评论</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
                  <p className="text-discord-muted mb-4">
                    {isOwnProfile ? '你还没有发布任何帖子' : '该用户还没有发布任何帖子'}
                  </p>
                  {isOwnProfile && (
                    <Link href="/posts/new">
                      <Button>发布第一个帖子</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/posts/${post.id}`} className="text-white font-semibold hover:text-discord-accent transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-discord-muted text-sm mt-1 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-discord-muted">
                          <Link
                            href={`/communities/${post.community.id}`}
                            className="hover:text-discord-accent transition-colors"
                          >
                            {post.community.name}
                          </Link>
                          <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                          <span>{post._count.comments} 条评论</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
