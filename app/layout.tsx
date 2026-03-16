import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import Navbar from '@/components/navigation/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 社区交流平台',
  description: 'AI 作品广场和社区交流平台，汇聚创意，连接开发者',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-[#2b2d31] border-t border-[#1e1f22] py-6 mt-8">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-discord-muted text-sm">
                  © 2025 AI 社区交流平台. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}