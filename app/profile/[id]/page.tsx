'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Shield,
  FileText,
  MessageSquare,
  Heart,
  Users,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  tier: {
    id: string
    name: string
    level: number
    color: string
    description: string | null
  } | null
  createdAt: Date
  _count: {
    projects: number
    posts: number
    comments: number
    likes: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userId = params.id

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '获取用户信息失败')
      } else {
        setUser(data.user)
      }
    } catch (err) {
      console.error('获取用户错误:', err)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

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

  if (!user) {
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
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 text-[#b5bac1]" />
          </Button>
          <h1 className="text-2xl font-bold text-[#f2f3f5]">{user.username}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户信息 */}
          <div className="lg:col-span-1">
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-[#5865F2] text-white">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white text-xl">{user.username}</CardTitle>
                  {user.tier && (
                    <Badge
                      className="mt-2"
                      style={{ backgroundColor: user.tier.color }}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.tier.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#b5bac1]">
                    <Calendar className="h-4 w-4" />
                    <span>加入时间</span>
                  </div>
                  <div className="text-[#f2f3f5] text-sm">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </div>

                  {user.tier && (
                    <div className="pt-4 border-t border-[#1e1f22]">
                      <div className="flex items-center gap-2 text-[#b5bac1]">
                        <Shield className="h-4 w-4" />
                        <span>等级 {user.tier.level}</span>
                      </div>
                      {user.tier.description && (
                        <CardDescription className="mt-2 text-sm">
                          {user.tier.description}
                        </CardDescription>
                      )}
                    </div>
                  )}

                  {user.bio && (
                    <div className="pt-4 border-t border-[#1e1f22]">
                      <h3 className="text-[#f2f3f5] font-medium mb-2">个人简介</h3>
                      <p className="text-[#dbdee1] text-sm whitespace-pre-wrap">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计数据和内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#2b2d31] border-[#1e1f22]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-[#5865F2] mb-2" />
                    <div className="text-2xl font-bold text-[#f2f3f5]">
                      {user._count.projects}
                    </div>
                    <div className="text-[#b5bac1] text-sm">项目</div>
                  </div>
                </CardHeader>
              </Card>
              <Card className="bg-[#2b2d31] border-[#1e1f22]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center">
                    <MessageSquare className="h-8 w-8 text-[#5865F2] mb-2" />
                    <div className="text-2xl font-bold text-[#f2f3f5]">
                      {user._count.posts}
                    </div>
                    <div className="text-[#b5bac1] text-sm">帖子</div>
                  </div>
                </CardHeader>
              </Card>
              <Card className="bg-[#2b2d31] border-[#1e1f22]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center">
                    <Heart className="h-8 w-8 text-[#eb459e] mb-2" />
                    <div className="text-2xl font-bold text-[#f2f3f5]">
                      {user._count.likes}
                    </div>
                    <div className="text-[#b5bac1] text-sm">点赞</div>
                  </div>
                </CardHeader>
              </Card>
              <Card className="bg-[#2b2d31] border-[#1e1f22]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center">
                    <MessageSquare className="h-8 w-8 text-[#fee75c] mb-2" />
                    <div className="text-2xl font-bold text-[#f2f3f5]">
                      {user._count.comments}
                    </div>
                    <div className="text-[#b5bac1] text-sm">评论</div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* 最近项目 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">最近项目</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5865F2]">
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#b5bac1]">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                  <p>暂无项目</p>
                </div>
              </CardContent>
            </Card>

            {/* 最近帖子 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">最近帖子</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5865F2]">
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#b5bac1]">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                  <p>暂无帖子</p>
                </div>
              </CardContent>
            </Card>

            {/* 参与的社区 */}
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">参与的社区</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5865F2]">
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#b5bac1]">
                  <Users className="h-12 w-12 mx-auto mb-2 text-[#b5bac1]" />
                  <p>暂无参与的社区</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
