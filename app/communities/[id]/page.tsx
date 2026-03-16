'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  MessageSquare,
  ArrowLeft,
  UserPlus,
  Settings,
  Lock,
  Shield,
  Heart
} from 'lucide-react'
import Link from 'next/link'

interface CommunityDetail {
  id: string
  name: string
  description: string | null
  avatar: string | null
  isPrivate: boolean
  minTierRequired: number | null
  createdAt: Date
  owner: {
    id: string
    username: string
    avatar: string | null
    tier: {
      name: string
      level: number
      color: string
    }
  }
  _count: {
    members: number
    posts: number
  }
}

interface CommunityMember {
  id: string
  user: {
    id: string
    username: string
    avatar: string | null
    tier?: {
      name: string
      color: string
    }
  }
  joinedAt: Date
}

interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
  _count: {
    comments: number
    likes: number
  }
  createdAt: Date
}

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [community, setCommunity] = useState<CommunityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [error, setError] = useState('')

  const communityId = params.id

  const fetchCommunity = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/communities/${communityId}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '获取社区详情失败')
      } else {
        setCommunity(data.community)
        // 加载社区帖子
        fetchPosts()
      }
    } catch (err) {
      console.error('获取社区错误:', err)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?communityId=${communityId}`)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error('获取帖子失败:', err)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/members`)
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      console.error('获取成员失败:', err)
    }
  }

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert('成功加入社区！')
        fetchCommunity() // 刷新数据
      } else {
        const data = await response.json()
        alert(data.error?.message || '加入失败')
      }
    } catch (err) {
      console.error('加入社区失败:', err)
      alert('加入失败')
    }
  }

  const handleLeave = async () => {
    if (!confirm('确定要退出这个社区吗？')) return

    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('已退出社区')
        router.push('/communities')
      } else {
        const data = await response.json()
        alert(data.error?.message || '退出失败')
      }
    } catch (err) {
      console.error('退出社区失败:', err)
      alert('退出失败')
    }
  }

  useEffect(() => {
    fetchCommunity()
  }, [communityId])

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
            <Button onClick={() => router.push('/communities')}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#313338]">
      {/* 顶部导航 */}
      <div className="bg-[#2b2d31] border-b border-[#1e1f22] p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/communities')}>
            <ArrowLeft className="h-4 w-4 text-[#b5bac1]" />
          </Button>
          <h1 className="text-2xl font-bold text-[#f2f3f5] truncate max-w-[400px]">
            {community.name}
          </h1>
          <div className="flex gap-2">
            {community.isPrivate && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                私密社区
              </Badge>
            )}
            {community.minTierRequired && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                需要 {community.minTierRequired} 级
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：社区信息 */}
          <div className="lg:col-span-1">
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={community.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-[#5865F2] text-white">
                      {community.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white text-xl">{community.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {community.description && (
                    <div>
                      <h3 className="text-[#f2f3f5] font-medium mb-2">社区简介</h3>
                      <CardDescription className="whitespace-pre-wrap">
                        {community.description}
                      </CardDescription>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1e1f22]">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-[#5865F2]" />
                      <div className="text-2xl font-bold text-[#f2f3f5]">
                        {community._count.members}
                      </div>
                      <div className="text-[#b5bac1] text-sm">成员</div>
                    </div>
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#5865F2]" />
                      <div className="text-2xl font-bold text-[#f2f3f5]">
                        {community._count.posts}
                      </div>
                      <div className="text-[#b5bac1] text-sm">帖子</div>
                    </div>
                  </div>

                  {/* 创建者信息 */}
                  <div className="pt-4 border-t border-[#1e1f22]">
                    <h3 className="text-[#f2f3f5] font-medium mb-2">社区创建者</h3>
                    <div className="flex items-center gap-3">
                      <Link href={`/profile/${community.owner.id}`}>
                        <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-[#5865F2]">
                          <AvatarImage src={community.owner.avatar || undefined} />
                          <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                            {community.owner.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <div className="text-[#f2f3f5] font-medium">
                          {community.owner.username}
                        </div>
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: community.owner.tier.color }}
                        >
                          {community.owner.tier.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：帖子和成员 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 社区帖子 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">社区帖子</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMembers(!showMembers)}
                    className="text-[#5865F2]"
                  >
                    {showMembers ? (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        显示帖子
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        显示成员
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showMembers ? (
                  /* 成员列表 */
                  <div className="space-y-3">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-[#1e1f22] rounded-md">
                          <Link href={`/profile/${member.user.id}`}>
                            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-[#5865F2]">
                              <AvatarImage src={member.user.avatar || undefined} />
                              <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                                {member.user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#f2f3f5] font-medium">
                              {member.user.username}
                            </div>
                            {member.user.tier && (
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: member.user.tier.color }}
                              >
                                {member.user.tier.name}
                              </Badge>
                            )}
                            <div className="text-[#b5bac1] text-xs mt-1">
                              加入于 {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#b5bac1]">
                        <Users className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                        <p>暂无成员</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 帖子列表 */
                  <div className="space-y-3">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <div key={post.id} className="p-4 bg-[#1e1f22] rounded-md hover:bg-[#3f4147] cursor-pointer transition-colors">
                          <div className="flex items-start gap-3 mb-2">
                            <Link href={`/profile/${post.author.id}`}>
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarImage src={post.author.avatar || undefined} />
                                <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                                  {post.author.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="text-[#f2f3f5] font-medium">
                                {post.title}
                              </div>
                              <div className="text-[#b5bac1] text-sm mt-1 line-clamp-2">
                                {post.content}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-[#b5bac1] pt-2 border-t border-[#1e1f22]">
                            <div className="flex items-center gap-4">
                              <MessageSquare className="h-4 w-4" />
                              <span>{post._count.comments}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Heart className="h-4 w-4" />
                              <span>{post._count.likes}</span>
                            </div>
                            <div className="text-xs">
                              {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#b5bac1]">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                        <p>暂无帖子</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleJoin}
            className="bg-[#5865F2] hover:bg-[#4752C4] flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            加入社区
          </Button>
          <Button
            variant="outline"
            onClick={handleLeave}
            className="flex-1"
          >
            退出社区
          </Button>
        </div>
      </div>
    </div>
  )
}
