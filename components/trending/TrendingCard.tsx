// components/trending/TrendingCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrendingItem {
  id: string
  title: string
  views: number
  type: 'project' | 'community'
  author: {
    username: string
  }
}

export default function TrendingCard() {
  const router = useRouter()
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // 获取浏览量最高的项目和社区
        const [projectsRes, communitiesRes] = await Promise.all([
          fetch('/api/projects?limit=5&sort=views'),
          fetch('/api/communities?limit=5&sort=members')
        ])

        const projectsData = await projectsRes.json()
        const communitiesData = await communitiesRes.json()

        const trendingProjects = (projectsData.projects || []).map((p: any) => ({
          ...p,
          type: 'project' as const,
          views: p.views || 0
        }))

        const trendingCommunities = (communitiesData.communities || []).map((c: any) => ({
          ...c,
          type: 'community' as const,
          views: c.memberCount || 0
        }))

        // 合并并按浏览量排序
        const combined = [...trendingProjects, ...trendingCommunities]
          .sort((a, b) => b.views - a.views)
          .slice(0, 10)

        setTrendingItems(combined)
      } catch (error) {
        console.error('Failed to fetch trending:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // 每 5 分钟更新一次
    const interval = setInterval(fetchTrending, 300000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = (item: TrendingItem) => {
    if (item.type === 'project') {
      router.push(`/projects/${item.id}`)
    } else {
      router.push(`/communities/${item.id}`)
    }
  }

  const getTrendIcon = (item: TrendingItem) => {
    if (item.type === 'project') {
      return '🚀'
    }
    return '👥'
  }

  return (
    <Card className="bg-[#2b2d31] border-[#1e1f22]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          热门趋势
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-discord-muted text-center py-4">
            加载中...
          </div>
        ) : trendingItems.length === 0 ? (
          <div className="text-discord-muted text-center py-4">
            暂无热门内容
          </div>
        ) : (
          <div className="space-y-2">
            {trendingItems.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleClick(item)}
                className="w-full text-left p-3 hover:bg-[#35373c] rounded transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      index < 3 ? 'bg-yellow-500' : 'bg-discord-muted'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-lg">
                      {getTrendIcon(item)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate group-hover:text-discord-accent transition-colors">
                        {item.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.type === 'project' ? '项目' : '社区'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-discord-muted">
                      <span>
                        👁 {item.views.toLocaleString()}
                      </span>
                      <span>
                        👤 {item.author.username}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[#1e1f22] text-center">
          <button
            onClick={() => router.push('/projects')}
            className="text-discord-accent hover:text-white text-sm transition-colors"
          >
            查看更多 →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
