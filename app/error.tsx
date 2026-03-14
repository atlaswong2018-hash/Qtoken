// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-discord-bg flex items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        <div className="text-8xl mb-6">💥</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          出错了
        </h1>
        <p className="text-discord-muted mb-8">
          {error.message || '应用程序遇到了一些问题。'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-discord-accent hover:bg-[#5865f2] text-white px-6 py-2 rounded-md transition-colors"
          >
            重新加载
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#4e5058] hover:bg-[#5865f2] text-white px-6 py-2 rounded-md transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
