// app/communities/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCommunities() {
      setLoading(true)
      try {
        const response = await fetch('/api/communities')
        const data = await response.json()
        setCommunities(data.communities || [])
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          社区
        </h1>

        {loading ? (
          <div className="text-discord-muted text-center py-12">
            加载中...
          </div>
        ) : communities.length === 0 ? (
          <div className="text-discord-muted text-center py-12">
            暂无社区
          </div>
        ) : (
          <div className="space-y-4">
            {communities.map((community: any) => (
              <div
                <div key={community.id} className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {community.name}
                  </h2>
                  <div className="text-discord-muted mb-2">
                    {community.description || '暂无描述'}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-discord-muted text-sm">
                      成员数：{community.memberCount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-discord-muted text-sm">
                      创建于：{new Date(community.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <a
                    href={`/communities/${community.id}`}
                    className="text-discord-accent hover:underline"
                  >
                    查看帖子
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
