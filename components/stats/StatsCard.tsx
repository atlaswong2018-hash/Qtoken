// components/stats/StatsCard.tsx
'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  projects: number
  communities: number
  users: number
  posts: number
}

export default function StatsCard() {
  const [stats, setStats] = useState<StatsData>({
    projects: 0,
    communities: 0,
    users: 0,
    posts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // 每分钟刷新一次统计数据
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const statsItems = [
    {
      label: '项目',
      value: stats.projects,
      icon: '🚀',
      color: 'bg-blue-500',
      description: '已发布的项目总数'
    },
    {
      label: '社区',
      value: stats.communities,
      icon: '👥',
      color: 'bg-purple-500',
      description: '活跃的社区数量'
    },
    {
      label: '用户',
      value: stats.users,
      icon: '👤',
      color: 'bg-green-500',
      description: '注册用户总数'
    },
    {
      label: '帖子',
      value: stats.posts,
      icon: '💬',
      color: 'bg-yellow-500',
      description: '发布的帖子总数'
    }
  ]

  return (
    <div className="bg-[#2b2d31] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        平台统计
      </h2>

      {loading ? (
        <div className="text-discord-muted text-center py-8">
          加载统计数据中...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsItems.map((item) => (
            <div
              key={item.label}
              className="bg-[#1e1f22] rounded-lg p-4 hover:bg-[#35373c] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-lg`}>
                  {item.icon}
                </div>
                <span className="text-discord-muted text-sm">
                  {item.label}
                </span>
              </div>

              <div className="text-3xl font-bold text-white mb-1">
                {item.value.toLocaleString()}
              </div>

              <div className="text-xs text-discord-muted">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-[#1e1f22]">
        <p className="text-sm text-discord-muted">
          数据每分钟自动更新
        </p>
      </div>
    </div>
  )
}
