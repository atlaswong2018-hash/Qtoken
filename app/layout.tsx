import type { Metadata } from "next"
import { Inter, Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import Providers from "@/components/providers/Providers"
import Navbar from "@/components/navigation/Navbar"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI 社区交流平台",
  description: "类似 Discord 的 AI 爱好者社区平台",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-discord-bg">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
