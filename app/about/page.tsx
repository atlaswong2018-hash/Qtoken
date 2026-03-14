// app/about/page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  const features = [
    {
      icon: '🚀',
      title: '项目分享',
      description: '分享你的 AI 项目，展示你的技术实力，获得社区反馈'
    },
    {
      icon: '👥',
      title: '社区交流',
      description: '加入感兴趣的社区，与志同道合的开发者交流心得'
    },
    {
      icon: '💬',
      title: '互动讨论',
      description: '对项目和帖子进行评论，参与讨论，建立人脉'
    },
    {
      icon: '❤️',
      title: '点赞支持',
      description: '为喜欢的项目点赞，支持优秀创作者'
    },
    {
      icon: '🔔',
      title: '实时通知',
      description: '及时收到评论、点赞等互动通知'
    },
    {
      icon: '📱',
      title: '响应式设计',
      description: '支持桌面和移动设备，随时随地访问社区'
    }
  ]

  return (
    <div className="min-h-screen bg-discord-bg pt-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI 社区交流平台
          </h1>
          <p className="text-xl text-discord-muted mb-8 max-w-2xl mx-auto">
            一个类似 Discord 的 AI 爱好者社区平台，汇聚创意，连接开发者，共同成长
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="bg-discord-accent hover:bg-[#5865f2]"
            >
              <Link href="/register">立即加入</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects">浏览项目</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            平台特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors"
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-discord-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            技术栈
          </h2>
          <Card className="bg-[#2b2d31] border-[#1e1f22]">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">前端</h3>
                  <ul className="space-y-2 text-discord-muted">
                    <li>• Next.js 14 (App Router)</li>
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">后端</h3>
                  <li>• Next.js API Routes</li>
                  <li>• Prisma ORM</li>
                  <li>• NextAuth.js</li>
                  <li>• PostgreSQL</li>
                  <li>• bcryptjs</li>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">集成</h3>
                  <ul className="space-y-2 text-discord-muted">
                    <li>• Telegram Bot API</li>
                    <li>• OAuth (GitHub, Google)</li>
                    <li>• S3 文件存储</li>
                    <li>• Sentry 错误追踪</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">开发</h3>
                  <ul className="space-y-2 text-discord-muted">
                    <li>• Vitest 测试</li>
                    <li>• React Testing Library</li>
                    <li>• ESLint</li>
                    <li>• Git Worktrees</li>
                    <li>• TypeScript 类型安全</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center py-16 bg-[#2b2d31] rounded-lg">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好加入了吗？
          </h2>
          <p className="text-discord-muted mb-8 max-w-2xl mx-auto">
            注册账号，开始分享你的项目，与全球 AI 开发者建立连接
          </p>
          <Button
            asChild
            className="bg-discord-accent hover:bg-[#5865f2] text-lg px-8 py-3"
          >
            <Link href="/register">免费注册</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
