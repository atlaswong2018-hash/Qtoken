'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FileText,
  MessageSquare,
  Heart,
  TrendingUp,
  Settings,
  Shield,
  Send,
  LogOut
} from 'lucide-react'

interface DashboardStats {
  users: number
  projects: number
  posts: number
  comments: number
  likes: number
  communities: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      // 这里可以调用实际的后端API获取统计数据
      // 暂时使用模拟数据
      setStats({
        users: 125,
        projects: 48,
        posts: 234,
        comments: 1567,
        likes: 8923,
        communities: 12
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      title: '总用户数',
      value: stats?.users || 0,
      icon: Users,
      color: '#5865F2',
      change: '+12%'
    },
    {
      title: '项目总数',
      value: stats?.projects || 0,
      icon: FileText,
      color: '#23a559',
      change: '+8%'
    },
    {
      title: '帖子总数',
      value: stats?.posts || 0,
      icon: MessageSquare,
      color: '#faa61a',
      change: '+15%'
    },
    {
      title: '评论总数',
      value: stats?.comments || 0,
      icon: MessageSquare,
      color: '#fee75c',
      change: '+22%'
    },
    {
      title: '点赞总数',
      value: stats?.likes || 0,
      icon: Heart,
      color: '#eb459e',
      change: '+18%'
    },
    {
      title: '社区总数',
      value: stats?.communities || 0,
      icon: Users,
      color: '#5865F2',
      change: '+5%'
    }
  ]

  const menuItems = [
    {
      title: '用户等级管理',
      description: '管理系统用户等级和权限',
      icon: Shield,
      onClick: () => router.push('/admin/tiers')
    },
    {
      title: '社区规则管理',
      description: '管理社区规则和规范',
      icon: FileText,
      onClick: () => router.push('/admin/rules')
    },
    {
      title: 'Telegram 配置',
      description: '配置 Telegram Bot 和频道同步',
      icon: Send,
      onClick: () => router.push('/admin/telegram')
    },
    {
      title: '系统设置',
      description: '系统配置和选项',
      icon: Settings,
      onClick: () => alert('系统设置功能开发中')
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#313338] p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f2f3f5]">管理员仪表盘</h1>
            <p className="text-[#b5bac1] mt-1">系统概览和管理</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{stat.title}</CardTitle>
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-[#f2f3f5]">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-[#23a559]" />
                      <span className="text-[#23a559] text-sm font-medium">
                        {stat.change}
                      </span>
                      <span className="text-[#b5bac1] text-sm">较上月</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-4"
                  >
                    本月
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#f2f3f5] mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="bg-[#2b2d31] border-[#1e1f22] cursor-pointer hover:bg-[#3f4147] transition-colors"
                onClick={item.onClick}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#5865F2]">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* 最近活动 */}
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">最近活动</CardTitle>
            <CardDescription>
              系统最近的重要操作和事件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#1e1f22] rounded-md">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#23a559]"></div>
                <div className="flex-1">
                  <p className="text-[#f2f3f5] font-medium">新用户注册</p>
                  <p className="text-[#b5bac1] text-sm mt-1">
                    用户 @newuser 加入了平台
                  </p>
                  <p className="text-[#b5bac1] text-xs mt-1">2 分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#1e1f22] rounded-md">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#5865F2]"></div>
                <div className="flex-1">
                  <p className="text-[#f2f3f5] font-medium">新项目发布</p>
                  <p className="text-[#b5bac1] text-sm mt-1">
                    项目 "AI 图像识别系统" 已发布
                  </p>
                  <p className="text-[#b5bac1] text-xs mt-1">15 分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#1e1f22] rounded-md">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#faa61a]"></div>
                <div className="flex-1">
                  <p className="text-[#f2f3f5] font-medium">规则更新</p>
                  <p className="text-[#b5bac1] text-sm mt-1">
                    管理员更新了社区规则
                  </p>
                  <p className="text-[#b5bac1] text-xs mt-1">1 小时前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#1e1f22] rounded-md">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#23a559]"></div>
                <div className="flex-1">
                  <p className="text-[#f2f3f5] font-medium">系统配置</p>
                  <p className="text-[#b5bac1] text-sm mt-1">
                    Telegram Bot 配置已更新
                  </p>
                  <p className="text-[#b5bac1] text-xs mt-1">3 小时前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
