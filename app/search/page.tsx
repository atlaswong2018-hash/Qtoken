// app/search/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, FileText, MessageSquare, User, Folder, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SearchResult {
  type: 'project' | 'post' | 'user'
  id: string
  title: string
  description?: string
  author?: string
  createdAt?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(query)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    projects: SearchResult[]
    posts: SearchResult[]
    users: SearchResult[]
  }>({
    projects: [],
    posts: [],
    users: [],
  })
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'posts' | 'users'>('all')

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    }
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults({ projects: [], posts: [], users: [] })
      return
    }

    setLoading(true)
    try {
      const [projectsRes, postsRes, usersRes] = await Promise.all([
        fetch(`/api/projects?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/posts?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`),
      ])

      const projectsData = await projectsRes.json()
      const postsData = await postsRes.json()
      const usersData = await usersRes.json()

      setResults({
        projects: projectsData.projects?.map((p: any) => ({
          type: 'project' as const,
          id: p.id,
          title: p.name,
          description: p.description,
          author: p.author?.username,
          createdAt: p.createdAt,
        })) || [],
        posts: postsData.posts?.map((p: any) => ({
          type: 'post' as const,
          id: p.id,
          title: p.title,
          description: p.content,
          author: p.author?.username,
          createdAt: p.createdAt,
        })) || [],
        users: usersData.users?.map((u: any) => ({
          type: 'user' as const,
          id: u.id,
          title: u.username,
          description: u.bio,
          createdAt: u.createdAt,
        })) || [],
      })
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const allResults = [
    ...results.projects,
    ...results.posts,
    ...results.users,
  ]

  const getFilteredResults = () => {
    if (activeTab === 'all') return allResults
    if (activeTab === 'projects') return results.projects
    if (activeTab === 'posts') return results.posts
    if (activeTab === 'users') return results.users
    return []
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Folder className="h-5 w-5" />
      case 'post':
        return <MessageSquare className="h-5 w-5" />
      case 'user':
        return <User className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 搜索框 */}
      <div className="mb-8">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-discord-muted" size={20} />
            <Input
              type="search"
              placeholder="搜索项目、帖子、用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2b2d31] border-[#1e1f22] text-white pl-10 pr-4 h-12 text-lg"
              autoFocus
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setResults({ projects: [], posts: [], users: [] })
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                清除
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 搜索结果 */}
      {!searchQuery.trim() ? (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
              <p className="text-discord-muted text-lg">输入关键词开始搜索</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-discord-muted">
              <div className="inline-block h-6 w-6 border-2 border-discord-muted border-t-transparent animate-spin rounded-full mb-4" />
              <p>搜索中...</p>
            </div>
          </CardContent>
        </Card>
      ) : allResults.length === 0 ? (
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-discord-muted" />
              <p className="text-discord-muted text-lg">未找到相关结果</p>
              <p className="text-discord-muted text-sm mt-2">
                尝试使用其他关键词
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 结果统计 */}
          <div className="flex gap-4 mb-4 text-discord-muted">
            <span>找到 {allResults.length} 个结果</span>
            <span>•</span>
            <span>项目: {results.projects.length}</span>
            <span>•</span>
            <span>帖子: {results.posts.length}</span>
            <span>•</span>
            <span>用户: {results.users.length}</span>
          </div>

          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">
                全部 ({allResults.length})
              </TabsTrigger>
              <TabsTrigger value="projects">
                项目 ({results.projects.length})
              </TabsTrigger>
              <TabsTrigger value="posts">
                帖子 ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                用户 ({results.users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredResults().map((result) => (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-discord-accent flex-shrink-0">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="text-xs mb-1">
                            {result.type === 'project' && '项目'}
                            {result.type === 'post' && '帖子'}
                            {result.type === 'user' && '用户'}
                          </Badge>
                          <Link
                            href={
                              result.type === 'project'
                                ? `/projects/${result.id}`
                                : result.type === 'post'
                                ? `/posts/${result.id}`
                                : `/profile/${result.id}`
                            }
                            className="text-white font-semibold hover:text-discord-accent transition-colors line-clamp-1"
                          >
                            {result.title}
                          </Link>
                        </div>
                      </div>
                      {result.description && (
                        <p className="text-discord-muted text-sm line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.author && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-discord-muted">
                          <span>{result.author}</span>
                          {result.createdAt && (
                            <span>• {new Date(result.createdAt).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.projects.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-discord-accent">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/projects/${result.id}`}
                            className="text-white font-semibold hover:text-discord-accent transition-colors line-clamp-1"
                          >
                            {result.title}
                          </Link>
                        </div>
                      </div>
                      {result.description && (
                        <p className="text-discord-muted text-sm line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.author && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-discord-muted">
                          <span>{result.author}</span>
                          {result.createdAt && (
                            <span>• {new Date(result.createdAt).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.posts.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-discord-accent">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/posts/${result.id}`}
                            className="text-white font-semibold hover:text-discord-accent transition-colors line-clamp-1"
                          >
                            {result.title}
                          </Link>
                        </div>
                      </div>
                      {result.description && (
                        <p className="text-discord-muted text-sm line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.author && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-discord-muted">
                          <span>{result.author}</span>
                          {result.createdAt && (
                            <span>• {new Date(result.createdAt).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-discord-accent">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${result.id}`}
                            className="text-white font-semibold hover:text-discord-accent transition-colors line-clamp-1"
                          >
                            {result.title}
                          </Link>
                        </div>
                      </div>
                      {result.description && (
                        <p className="text-discord-muted text-sm line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.createdAt && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-discord-muted">
                          <span>加入于 {new Date(result.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
