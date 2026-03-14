// app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-discord-bg flex items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          404
        </h1>
        <p className="text-discord-muted mb-8">
          抱歉，您访问的页面不存在。
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            asChild
            className="bg-discord-accent hover:bg-[#5865f2]"
          >
            <Link href="/">返回首页</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">浏览项目</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
