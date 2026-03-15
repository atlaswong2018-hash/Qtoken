'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  Lock,
  Shield,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Community {
  id: string
  name: string
  description: string | null
  avatar: string | null
  isPrivate: boolean
  minTierRequired: number | null
  createdAt: Date
  _count: {
    members: number
    posts: number
  }
}

export default function CommunitiesPage() {
  const router = useRouter()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    minTierRequired: 0
  })

  const fetchCommunities = async (search?: string) => {
    try {
      setLoading(true)
      const url = search ? `/api/communities?search=${encodeURIComponent(search)}` : '/api/communities'
      const response = await fetch(url)
      const data = await response.json()
      setCommunities(data.communities || [])
    } catch (error) {
      console.error('获取社区列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCommunities(searchTerm)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          isPrivate: false,
          minTierRequired: 0
        })
        fetchCommunities()
      } else {
        const data = await response.json()
        alert(data.error?.message || '创建社区失败')
      }
    } catch (error) {
      console.error('创建社区失败:', error)
      alert('创建社区失败')
    }
  }

  if (loading) {
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 text-[#b5bac1]" />
            </Button>
            <h1 className="text-2xl font-bold text-[#f2f3f5]">社区</h1>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5865F2] hover:bg-[#4752C4]"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建社区
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b5bac1]" />
            <Input
              type="text"
              placeholder="搜索社区..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
            />
          </div>
        </form>

        {/* 社区列表 */}
        {communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Link key={community.id} href={`/communities/${community.id}`}>
                <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865F2] transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 flex-shrink-0">
                        <AvatarImage src={community.avatar || undefined} />
                        <AvatarFallback className="bg-[#5865F2] text-white text-xl">
                          {community.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-white truncate">{community.name}</CardTitle>
                          {community.isPrivate && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" />
                              私密
                            </Badge>
                          )}
                        </div>
                        {community.minTierRequired && (
                          <div className="flex items-center gap-1 text-sm text-[#b5bac1]">
                            <Shield className="h-4 w-4" />
                            <span>需要 {community.minTierRequired} 级</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.description && (
                        <CardDescription className="line-clamp-2">
                          {community.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-[#b5bac1]">
                          <Users className="h-4 w-4" />
                          <span>{community._count.members} 成员</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#b5bac1]">
                          <MessageSquare className="h-4 w-4" />
                          <span>{community._count.posts} 帖子</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-[#2b2d31] border-[#1e1f22]">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-[#b5bac1]" />
              <p className="text-[#b5bac1] mb-4">
                {searchTerm ? '没有找到匹配的社区' : '还没有社区'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#5865F2] hover:bg-[#4752C4]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个社区
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 创建社区模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-[#2b2d31] border-[#1e1f22] w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">创建社区</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#f2f3f5]">社区名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入社区名称"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#f2f3f5]">社区描述</label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入社区描述"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-[#f2f3f5]">
                    私密社区
                  </label>
                </div>
                {formData.isPrivate && (
                  <div>
                    <label className="text-sm font-medium text-[#f2f3f5]">最低等级要求</label>
                    <Input
                      type="number"
                      value={formData.minTierRequired}
                      onChange={(e) => setFormData({ ...formData, minTierRequired: parseInt(e.target.value) })}
                      placeholder="0 表示不限制"
                      min="0"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#5865F2] hover:bg-[#4752C4] flex-1">
                    创建
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
