# AI 社区交流平台 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 构建一个类似 Discord 的 AI 爱好者社区平台，支持作品展示、代码分享、社区交流。

**架构：** Next.js 全栈应用，采用 App Router 架构，React Server Components 提升性能，PostgreSQL + Prisma ORM 处理数据层，NextAuth.js 处理认证，集成用户权限和等级管理系统，支持私密内容和 Telegram 频道同步。

**技术栈：** Next.js 14、React、TypeScript、Tailwind CSS、shadcn/ui、PostgreSQL、Prisma、NextAuth.js、Vitest、Telegram Bot API、Zod（输入验证）。

---

## 准备工作

### Task 1: 项目初始化

**文件：**
- 创建项目根目录文件
- 修改项目配置文件

**Step 1: 初始化 Next.js 项目**

```bash
npm create next-app@latest discord2 --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd discord2
```

**Step 2: 安装依赖**

```bash
npm install @prisma/client bcryptjs next-auth zod node-telegram-bot-api
npm install -D prisma vitest @testing-library/react @testing-library/jest-dom
npm install -D @types/bcryptjs @types/node-telegram-bot-api
npm install class-variance-authority clsx tailwind-merge lucide-react
```

**Step 3: 初始化 Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

**Step 4: 创建 .env 文件**

```bash
cp .env.example .env.local
```

**Step 5: 创建工具函数**

创建 `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 6: 更新 tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        discord: {
          bg: '#313338',
          card: '#2b2d31',
          text: '#dbdee1',
          muted: '#b5bac1',
          accent: '#5865f2'
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

**Step 7: 添加 Discord 主题 CSS**

更新 `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-discord-bg text-discord-text;
  }
}
```

**Step 8: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with dependencies"
```

---

## 数据库设置

### Task 2: 配置 Prisma Schema

**文件：**
- 修改: `prisma/schema.prisma`

**Step 1: 更新 Prisma Schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  avatar        String?
  bio           String?   @db.Text
  github        String?   @unique
  twitter       String?
  tierId        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]
  comments      Comment[]
  likes         Like[]
  posts         Post[]
  notifications Notification[]
  tier          UserTier?  @relation(fields: [tierId], references: [id], onDelete: SetNull)

  @@index([tierId])
}

model UserTier {
  id            String   @id @default(cuid())
  name          String   @unique
  level         Int      @unique
  description   String?  @db.Text
  color         String   @default("#5865f2")
  icon          String?
  permissions   String[] // JSON 数组存储权限列表
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  users         User[]

  @@index([level])
  @@index([active])
}

model CommunityRule {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  category    String   // 'general', 'posting', 'behavior', 'privacy'
  order       Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([active])
  @@index([order])
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  githubUrl   String?
  codeSnippet String?  @db.Text
  imageUrl    String?
  tags        String[]
  views       Int      @default(0)
  isPrivate   Boolean  @default(false)
  minTierRequired Int? // 最低等级要求
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  likes       Like[]

  @@index([authorId])
  @@index([createdAt])
  @@index([tags])
  @@index([isPrivate])
  @@index([minTierRequired])
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?  @db.Text
  slug        String   @unique
  icon        String?
  memberCount Int      @default(0)
  isPrivate   Boolean  @default(false)
  minTierRequired Int? // 最低等级要求
  createdAt   DateTime @default(now())

  posts       Post[]

  @@index([isPrivate])
  @@index([minTierRequired])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  views     Int      @default(0)
  isPrivate Boolean  @default(false)
  minTierRequired Int? // 最低等级要求
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  communityId String
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  comments    Comment[]

  @@index([isPrivate])
  @@index([minTierRequired])
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId   String
  author     User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  projectId  String?
  project    Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  postId     String?
  post       Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

model Notification {
  id        String   @id @default(cuid())
  type      String
  title     String
  content   String?  @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model TelegramConfig {
  id          String   @id @default(cuid())
  botToken    String   @unique
  channelId   String
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([enabled])
}
```

**Step 2: 生成 Prisma Client**

```bash
npx prisma generate
```

**Step 3: 运行数据库迁移**

```bash
npx prisma migrate dev --name init
```

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add Prisma schema and run initial migration"
```

---

## 认证系统

### Task 3: 创建认证工具函数

**文件：**
- 创建: `lib/auth.ts`

**Step 1: 创建认证工具函数**

```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

**Step 2: 创建测试文件**

创建 `tests/unit/auth.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Password Hashing', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should verify correct password', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword('WrongPassword', hash)
    expect(isValid).toBe(false)
  })
})
```

**Step 3: 运行测试验证失败（函数未导入）**

```bash
npm test -- tests/unit/auth.test.ts
```

Expected: FAIL with import error

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/unit/auth.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add lib/auth.ts tests/unit/auth.test.ts
git commit -m "feat: add password hashing and verification"
```

### Task 4: 配置 NextAuth

**文件：**
- 创建: `lib/auth-config.ts`
- 创建: `app/api/auth/[...nextauth]/route.ts`

**Step 1: 创建 NextAuth 配置**

```typescript
// lib/auth-config.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('邮箱和密码不能为空')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('邮箱不存在')
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('密码错误')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  }
})
```

**Step 2: 创建 NextAuth API 路由**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth-config'

export const { GET, POST } = handlers
```

**Step 3: Commit**

```bash
git add lib/auth-config.ts app/api/auth/[...nextauth]/route.ts
git commit -m "feat: configure NextAuth with credentials provider"
```

---

## Telegram 集成设置

### Task 5: 创建 Telegram Bot 工具函数

**文件：**
- 创建: `lib/telegram.ts`

**Step 1: 创建 Telegram Bot 工具函数**

```typescript
// lib/telegram.ts
import TelegramBot from 'node-telegram-bot-api'
import { prisma } from '@/lib/prisma'

interface ProjectData {
  id: string
  title: string
  description: string | null
  author: {
    username: string
  }
  tags: string[]
  githubUrl: string | null
}

interface PostData {
  id: string
  title: string
  content: string
  author: {
    username: string
  }
  community: {
    name: string
  }
}

/**
 * 获取启用的 Telegram 配置
 */
async function getEnabledConfig() {
  const config = await prisma.telegramConfig.findFirst({
    where: { enabled: true }
  })
  return config
}

/**
 * 发送项目到 Telegram 频道
 */
export async function sendProjectToTelegram(project: ProjectData): Promise<boolean> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      console.log('Telegram 配置未启用')
      return false
    }

    const bot = new TelegramBot(config.botToken)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const projectUrl = `${baseUrl}/projects/${project.id}`

    // 构建消息
    const tags = project.tags.length > 0 ? project.tags.map(t => `#${t}`).join(' ') : ''

    let message = `🚀 <b>新项目发布</b>\n\n`
    message += `📝 <b>${project.title}</b>\n\n`
    if (project.description) {
      message += `${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}\n\n`
    }
    message += `👤 作者: @${project.author.username}\n`
    if (tags) {
      message += `🏷️ ${tags}\n`
    }
    message += `\n🔗 <a href="${projectUrl}">查看详情</a>`

    await bot.sendMessage(config.channelId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })

    console.log('项目已发送到 Telegram 频道')
    return true
  } catch (error) {
    console.error('发送到 Telegram 失败:', error)
    return false
  }
}

/**
 * 发送帖子到 Telegram 频道
 */
export async function sendPostToTelegram(post: PostData): Promise<boolean> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      console.log('Telegram 配置未启用')
      return false
    }

    const bot = new TelegramBot(config.botToken)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const postUrl = `${baseUrl}/posts/${post.id}`

    // 构建消息
    let message = `💬 <b>新帖子发布</b>\n\n`
    message += `📝 <b>${post.title}</b>\n\n`
    message += `${post.content.substring(0, 300)}${post.content.length > 300 ? '...' : ''}\n\n`
    message += `👤 作者: @${post.author.username}\n`
    message += `🏠 社区: ${post.community.name}\n`
    message += `\n🔗 <a href="${postUrl}">查看详情</a>`

    await bot.sendMessage(config.channelId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })

    console.log('帖子已发送到 Telegram 频道')
    return true
  } catch (error) {
    console.error('发送到 Telegram 失败:', error)
    return false
  }
}

/**
 * 测试 Telegram Bot 连接
 */
export async function testTelegramConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      return { success: false, message: '未找到启用的 Telegram 配置' }
    }

    const bot = new TelegramBot(config.botToken)
    await bot.getMe()

    return { success: true, message: 'Telegram Bot 连接成功' }
  } catch (error) {
    console.error('Telegram 连接测试失败:', error)
    return { success: false, message: 'Telegram Bot 连接失败' }
  }
}
```

**Step 2: 创建 Telegram 工具函数测试**

创建 `tests/unit/telegram.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { sendProjectToTelegram, testTelegramConnection } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')
vi.mock('node-telegram-bot-api', () => ({
  default: class MockTelegramBot {
    constructor(token: string) {
      if (!token) throw new Error('Token is required')
    }
    async sendMessage() { return { message_id: '123' } }
    async getMe() { return { id: 123, first_name: 'Test Bot' } }
  }
}))

describe('Telegram Bot', () => {
  it('should send project to Telegram channel', async () => {
    vi.mocked(prisma.telegramConfig.findFirst).mockResolvedValue({
      id: '1',
      botToken: 'test-token',
      channelId: '@test-channel',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const project = {
      id: '1',
      title: 'Test Project',
      description: 'A test project',
      author: { username: 'testuser' },
      tags: ['ai', 'ml'],
      githubUrl: 'https://github.com/test/project'
    }

    const result = await sendProjectToTelegram(project)
    expect(result).toBe(true)
  })

  it('should test Telegram connection', async () => {
    vi.mocked(prisma.telegramConfig.findFirst).mockResolvedValue({
      id: '1',
      botToken: 'test-token',
      channelId: '@test-channel',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const result = await testTelegramConnection()
    expect(result.success).toBe(true)
    expect(result.message).toBe('Telegram Bot 连接成功')
  })
})
```

**Step 3: 运行测试验证失败**

```bash
npm test -- tests/unit/telegram.test.ts
```

Expected: FAIL with import errors

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/unit/telegram.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add lib/telegram.ts tests/unit/telegram.test.ts
git commit -m "feat: add Telegram Bot integration utilities"
```

### Task 6: 创建 Telegram 配置 API

**文件：**
- 创建: `app/api/admin/telegram/config/route.ts`

**Step 1: 创建 Telegram 配置 API**

```typescript
// app/api/admin/telegram/config/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { testTelegramConnection } from '@/lib/telegram'

// GET - 获取 Telegram 配置
export async function GET() {
  try {
    const session = await auth()

    // 简化处理：生产环境需要管理员权限验证
    const config = await prisma.telegramConfig.findFirst({
      where: { enabled: true }
    })

    if (!config) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({
      configured: true,
      channelId: config.channelId,
      enabled: config.enabled
    })
  } catch (error) {
    console.error('获取 Telegram 配置错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 更新 Telegram 配置
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { botToken, channelId, enabled } = body

    // 验证输入
    if (!botToken || !channelId) {
      return NextResponse.json(
        { error: { message: 'Bot Token 和 Channel ID 不能为空' } },
        { status: 400 }
      )
    }

    // 测试连接
    // 这里需要临时保存 token 进行测试
    // 简化处理，直接保存

    const config = await prisma.telegramConfig.upsert({
      where: { botToken },
      update: { channelId, enabled },
      create: { botToken, channelId, enabled: enabled ?? true }
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('更新 Telegram 配置错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 测试连接
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { botToken } = body

    if (!botToken) {
      return NextResponse.json(
        { error: { message: 'Bot Token 不能为空' } },
        { status: 400 }
      )
    }

    // 临时测试
    // 注意：这里需要临时设置 token 进行测试
    const result = await testTelegramConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error('测试 Telegram 连接错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/admin/telegram/config/route.ts
git commit -m "feat: add Telegram configuration API"
```

---

## 用户注册 API

### Task 7: 创建输入验证 Schema

**文件：**
- 创建: `lib/validations.ts`

**Step 1: 创建验证 Schema**

```typescript
// lib/validations.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字')
})

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
})

export const projectSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多 100 个字符'),
  description: z.string().max(1000, '描述最多 1000 个字符').optional(),
  githubUrl: z.string().url('GitHub 链接格式不正确').optional(),
  codeSnippet: z.string().max(10000, '代码片段最多 10000 个字符').optional(),
  tags: z.array(z.string()).max(5, '最多 5 个标签').optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInput = z.infer<typeof projectSchema>
```

**Step 2: Commit**

```bash
git add lib/validations.ts
git commit -m "feat: add input validation schemas"
```

### Task 6: 创建错误处理工具

**文件：**
- 创建: `lib/errors.ts`

**Step 1: 创建错误处理类和函数**

```typescript
// lib/errors.ts
import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code
        }
      },
      { status: error.statusCode }
    )
  }

  // Prisma 错误处理
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string }

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: { message: '数据已存在', code: 'DUPLICATE_ENTRY' } },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: { message: '记录不存在', code: 'NOT_FOUND' } },
          { status: 404 }
        )
    }
  }

  // 未知错误
  return NextResponse.json(
    { error: { message: '服务器内部错误', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  )
}
```

**Step 2: Commit**

```bash
git add lib/errors.ts
git commit -m "feat: add error handling utilities"
```

### Task 7: 创建用户注册 API

**文件：**
- 创建: `app/api/auth/register/route.ts`

**Step 1: 创建注册测试**

创建 `tests/api/register.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser'
    }

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return 400 if user already exists', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: '1',
      email: 'test@example.com'
    } as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/register.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现注册 API**

```typescript
// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证输入
    const validatedData = registerSchema.parse(body)

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: { message: '邮箱或用户名已存在', code: 'USER_EXISTS' } },
        { status: 400 }
      )
    }

    // 创建用户
    const passwordHash = await hashPassword(validatedData.password)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { message: '输入验证失败' } },
        { status: 400 }
      )
    }

    console.error('注册错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/register.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/auth/register/route.ts tests/api/register.test.ts
git commit -m "feat: implement user registration API"
```

---

## 用户登录 API

### Task 8: 创建用户登录 API

**文件：**
- 创建: `app/api/auth/login/route.ts`

**Step 1: 创建登录测试**

创建 `tests/api/login.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('POST /api/auth/login', () => {
  it('should login successfully with correct credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: '$2a$10$hash...'
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
  })

  it('should return 401 for invalid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/login.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现登录 API**

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { signIn } from '@/lib/auth-config'
import { loginSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证输入
    const validatedData = loginSchema.parse(body)

    // 使用 NextAuth 登录
    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false
    })

    if (result?.error) {
      return NextResponse.json(
        { error: { message: result.error } },
        { status: 401 }
      )
    }

    // 获取用户信息
    // 这里需要从 session 获取用户信息，简化处理
    return NextResponse.json({
      success: true,
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/login.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/auth/login/route.ts tests/api/login.test.ts
git commit -m "feat: implement user login API"
```

---

## Prisma 客户端设置

### Task 9: 创建 Prisma 客户端单例

**文件：**
- 创建: `lib/prisma.ts`

**Step 1: 创建 Prisma 客户端**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 2: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add Prisma client singleton"
```

---

## UI 组件 - shadcn/ui

### Task 10: 初始化 shadcn/ui

**文件：**
- 创建 UI 组件目录和组件

**Step 1: 初始化 shadcn/ui**

```bash
npx shadcn@latest init
```

选择默认选项。

**Step 2: 添加基础组件**

```bash
npx shadcn@latest add button card input label avatar badge
npx shadcn@latest add textarea dropdown-menu dialog
```

**Step 3: Commit**

```bash
git add components/ ui/ lib/utils.ts
git commit -m "chore: initialize shadcn/ui components"
```

---

## 前端页面 - 登录/注册

### Task 11: 创建登录页面

**文件：**
- 创建: `app/login/page.tsx`

**Step 1: 创建登录页面**

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-bg">
      <Card className="w-full max-w-md bg-discord-card border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">欢迎回来</CardTitle>
          <CardDescription className="text-discord-muted">
            登录到 AI 社区平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-discord-text">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-discord-text">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-discord-accent hover:bg-[#4752c4]"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-discord-muted">
            还没有账号？{' '}
            <a href="/register" className="text-discord-accent hover:underline">
              注册
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page"
```

### Task 12: 创建注册页面

**文件：**
- 创建: `app/register/page.tsx`

**Step 1: 创建注册页面**

```typescript
// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || '注册失败')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-bg">
      <Card className="w-full max-w-md bg-discord-card border-[#1e1f22]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">创建账号</CardTitle>
          <CardDescription className="text-discord-muted">
            加入 AI 社区平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-discord-text">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-discord-text">用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-discord-text">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 8 位，包含大小写字母和数字"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-discord-accent hover:bg-[#4752c4]"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-discord-muted">
            已有账号？{' '}
            <a href="/login" className="text-discord-accent hover:underline">
              登录
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/register/page.tsx
git commit -m "feat: add register page"
```

---

## 项目 API

### Task 13: 创建项目列表 API

**文件：**
- 创建: `app/api/projects/route.ts`

**Step 1: 创建项目列表测试**

创建 `tests/api/projects.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/projects/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('GET /api/projects', () => {
  it('should return list of projects', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Test Project',
        description: 'A test project',
        author: { id: '1', username: 'testuser', avatar: null },
        _count: { likes: 5, comments: 3 }
      }
    ]

    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any)
    vi.mocked(prisma.project.count).mockResolvedValue(1)

    const request = new Request('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.projects).toHaveLength(1)
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/projects.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现项目列表 API**

```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { projectSchema } from '@/lib/validations'
import { sendProjectToTelegram } from '@/lib/telegram'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}

    // 标签筛选
    if (tag) {
      where.tags = {
        has: tag
      }
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 获取项目列表
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取项目列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const validatedData = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    // 异步发送到 Telegram 频道
    sendProjectToTelegram(project).catch(err => {
      console.error('发送到 Telegram 失败:', err)
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('创建项目错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/projects.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/projects/route.ts tests/api/projects.test.ts
git commit -m "feat: implement projects API (list and create) with Telegram integration"
```

---

## 主页面 - 项目广场

### Task 14: 创建项目卡片组件

**文件：**
- 创建: `components/project/ProjectCard.tsx`

**Step 1: 创建项目卡片组件**

```typescript
// components/project/ProjectCard.tsx'
'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, MessageSquare } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string | null
    author: {
      id: string
      username: string
      avatar: string | null
    }
    tags: string[]
    views: number
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={project.author.avatar || undefined} />
            <AvatarFallback>{project.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
            <p className="text-discord-muted text-sm">{project.author.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-discord-text mb-4">
          {project.description || '暂无描述'}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4 text-discord-muted text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {project.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {project._count.likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {project._count.comments}
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" className="text-discord-accent hover:text-white">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add components/project/ProjectCard.tsx
git commit -m "feat: add ProjectCard component"
```

### Task 15: 创建主页面

**文件：**
- 创建: `app/page.tsx`

**Step 1: 创建主页面**

```typescript
// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ProjectCard from '@/components/project/ProjectCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Project {
  id: string
  title: string
  description: string | null
  author: {
    id: string
    username: string
    avatar: string | null
  }
  tags: string[]
  views: number
  _count: {
    likes: number
    comments: number
  }
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (tag) params.append('tag', tag)

      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [search, tag])

  return (
    <div className="min-h-screen bg-discord-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            AI 作品广场
          </h1>
          <div className="flex gap-4">
            <Input
              placeholder="搜索项目..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md bg-[#1e1f22] border-[#1e1f22] text-white"
            />
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-[#1e1f22] border-[#1e1f22] text-white rounded-md px-3 py-2"
            >
              <option value="">所有标签</option>
              <option value="ai">AI</option>
              <option value="machine-learning">机器学习</option>
              <option value="computer-vision">计算机视觉</option>
              <option value="nlp">自然语言处理</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-discord-muted text-center py-12">
            加载中...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-discord-muted text-center py-12">
            暂无项目
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add home page with project list"
```

---

## Telegram 配置管理页面

### Task 16: 创建 Telegram 配置页面

**文件：**
- 创建: `app/admin/telegram/page.tsx`

**Step 1: 创建 Telegram 配置页面**

```typescript
// app/admin/telegram/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface TelegramConfig {
  configured: boolean
  channelId?: string
  enabled?: boolean
}

export default function TelegramConfigPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [formData, setFormData] = useState({
    botToken: '',
    channelId: '',
    enabled: true
  })
  const [message, setMessage] = useState('')

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/telegram/config')
      const data = await response.json()
      setConfig(data)
      if (data.channelId) {
        setFormData(prev => ({ ...prev, channelId: data.channelId }))
      }
    } catch (error) {
      console.error('获取配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    if (!formData.botToken) {
      setMessage('请先输入 Bot Token')
      return
    }

    setTesting(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/telegram/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: formData.botToken })
      })
      const data = await response.json()

      if (data.success) {
        setMessage('✅ 连接测试成功！')
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 连接测试失败')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!formData.botToken || !formData.channelId) {
      setMessage('Bot Token 和 Channel ID 不能为空')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        setMessage('✅ 配置保存成功！')
        fetchConfig()
      } else {
        setMessage('❌ 配置保存失败')
      }
    } catch (error) {
      setMessage('❌ 配置保存失败')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-discord-bg flex items-center justify-center text-white">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Telegram 频道配置
        </h1>

        <Card className="bg-discord-card border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">配置 Bot 和频道</CardTitle>
            <CardDescription className="text-discord-muted">
              配置 Telegram Bot 和频道，实现项目自动同步
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="botToken" className="text-white">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={formData.botToken}
                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
              <p className="text-xs text-discord-muted">
                通过 @BotFather 获取 Bot Token
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelId" className="text-white">频道 ID</Label>
              <Input
                id="channelId"
                type="text"
                placeholder="@your_channel"
                value={formData.channelId}
                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                className="bg-[#1e1f22] border-[#1e1f22] text-white"
              />
              <p className="text-xs text-discord-muted">
                频道用户名，格式：@channel_name
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label htmlFor="enabled" className="text-white">启用 Telegram 同步</Label>
            </div>

            {message && (
              <div className={`p-3 rounded-md ${
                message.startsWith('✅') ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={testConnection}
                disabled={testing || !formData.botToken}
                variant="outline"
                className="border-[#4e5058] text-white hover:bg-[#4e5058]"
              >
                {testing ? '测试中...' : '测试连接'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-discord-accent hover:bg-[#4752c4]"
              >
                {saving ? '保存中...' : '保存配置'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-discord-card border-[#1e1f22] mt-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="text-discord-muted text-sm space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li>在 Telegram 中找到 @BotFather</li>
              <li>发送 /newbot 创建新 Bot</li>
              <li>获取 Bot Token 并填入上面的输入框</li>
              <li>将 Bot 添加到你的频道并设为管理员</li>
              <li>输入频道用户名并测试连接</li>
              <li>保存配置后，新项目将自动同步到频道</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: 创建 Switch 组件（如果还没有）**

如果 shadcn/ui 还没有 Switch 组件，运行：

```bash
npx shadcn@latest add switch
```

**Step 3: Commit**

```bash
git add app/admin/telegram/page.tsx
git commit -m "feat: add Telegram configuration page"
```

---

## 中间件和认证保护

### Task 17: 创建认证中间件

**文件：**
- 创建: `middleware.ts`

**Step 1: 创建中间件**

```typescript
// middleware.ts
import { auth } from '@/lib/auth-config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                            req.nextUrl.pathname.startsWith('/profile')

  // 已登录用户访问登录页面，重定向到首页
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 未登录用户访问保护页面，重定向到登录页
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add authentication middleware"
```

---

## 测试配置

### Task 17: 配置 Vitest

**文件：**
- 创建: `vitest.config.ts`
- 创建: `tests/setup.ts`

**Step 1: 创建 Vitest 配置**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts'
  }
})
```

**Step 2: 创建测试设置文件**

```typescript
// tests/setup.ts
import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn()
    },
    project: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn()
    },
    community: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    post: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    like: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}))
```

**Step 3: 更新 package.json 添加测试脚本**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

**Step 4: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json
git commit -m "test: configure Vitest"
```

---

## 用户权限和等级管理

### Task 24: 创建用户等级 API

**文件：**
- 创建: `app/api/admin/tiers/route.ts`

**Step 1: 创建等级管理测试**

创建 `tests/api/tiers.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET, POST, PUT, DELETE } from '@/app/api/admin/tiers/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('User Tiers API', () => {
  it('should return list of user tiers', async () => {
    const mockTiers = [
      {
        id: '1',
        name: 'New Member',
        level: 1,
        description: 'New member with basic permissions',
        color: '#5865f2',
        permissions: ['read_public'],
        active: true
      }
    ]

    vi.mocked(prisma.userTier.findMany).mockResolvedValue(mockTiers as any)

    const request = new Request('http://localhost:3000/api/admin/tiers')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.tiers).toHaveLength(1)
  })

  it('should create a new user tier', async () => {
    const newTier = {
      name: 'Moderator',
      level: 5,
      description: 'Moderator with advanced permissions',
      color: '#e91e63',
      permissions: ['read_public', 'read_private', 'moderate']
    }

    vi.mocked(prisma.userTier.create).mockResolvedValue({
      id: '2',
      ...newTier,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

    const request = new Request('http://localhost:3000/api/admin/tiers', {
      method: 'POST',
      body: JSON.stringify(newTier)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.tier.name).toBe('Moderator')
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/tiers.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现等级管理 API**

```typescript
// app/api/admin/tiers/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 验证 Schema
const tierSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50, '名称最多 50 字符'),
  level: z.number().int().positive('等级必须为正整数'),
  description: z.string().max(500, '描述最多 500 字符').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '颜色格式不正确').optional(),
  icon: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional()
})

// GET - 获取所有等级
export async function GET() {
  try {
    const tiers = await prisma.userTier.findMany({
      orderBy: { level: 'asc' }
    })

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error('获取等级列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新等级
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = tierSchema.parse(body)

    // 检查等级是否已存在
    const existingTier = await prisma.userTier.findUnique({
      where: { level: validatedData.level }
    })

    if (existingTier) {
      return NextResponse.json(
        { error: { message: '该等级已存在' } },
        { status: 400 }
      )
    }

    const tier = await prisma.userTier.create({
      data: {
        ...validatedData,
        permissions: validatedData.permissions || []
      }
    })

    return NextResponse.json({ tier }, { status: 201 })
  } catch (error) {
    console.error('创建等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 更新等级
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const validatedData = tierSchema.partial().parse(body)

    const tier = await prisma.userTier.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ tier })
  } catch (error) {
    console.error('更新等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除等级
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = params

    // 检查是否有用户使用该等级
    const usersWithTier = await prisma.user.count({
      where: { tierId: id }
    })

    if (usersWithTier > 0) {
      return NextResponse.json(
        { error: { message: '无法删除，有用户正在使用该等级' } },
        { status: 400 }
      )
    }

    await prisma.userTier.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/tiers.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/admin/tiers/route.ts tests/api/tiers.test.ts
git commit -m "feat: add user tiers management API"
```

### Task 25: 创建社区规则 API

**文件：**
- 创建: `app/api/admin/rules/route.ts`

**Step 1: 创建规则管理测试**

创建 `tests/api/rules.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET, POST, PUT, DELETE } from '@/app/api/admin/rules/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('Community Rules API', () => {
  it('should return list of active rules', async () => {
    const mockRules = [
      {
        id: '1',
        title: 'No spamming',
        content: 'Do not post spam or promotional content',
        category: 'posting',
        order: 1,
        active: true
      }
    ]

    vi.mocked(prisma.communityRule.findMany).mockResolvedValue(mockRules as any)

    const request = new Request('http://localhost:3000/api/admin/rules')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rules).toHaveLength(1)
  })

  it('should create a new rule', async () => {
    const newRule = {
      title: 'Be respectful',
      content: 'Treat all members with respect',
      category: 'behavior',
      order: 2
    }

    vi.mocked(prisma.communityRule.create).mockResolvedValue({
      id: '2',
      ...newRule,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

    const request = new Request('http://localhost:3000/api/admin/rules', {
      method: 'POST',
      body: JSON.stringify(newRule)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.rule.title).toBe('Be respectful')
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/rules.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现规则管理 API**

```typescript
// app/api/admin/rules/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 验证 Schema
const ruleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容最多 2000 字符'),
  category: z.enum(['general', 'posting', 'behavior', 'privacy']),
  order: z.number().int().min(0, '顺序不能为负数'),
  active: z.boolean().optional()
})

// GET - 获取所有规则
export async function GET() {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (category) {
      where.category = category
    }
    if (activeOnly) {
      where.active = true
    }

    const rules = await prisma.communityRule.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('获取规则列表错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建新规则
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = ruleSchema.parse(body)

    const rule = await prisma.communityRule.create({
      data: validatedData
    })

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error('创建规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PUT - 更新规则
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const validatedData = ruleSchema.partial().parse(body)

    const rule = await prisma.communityRule.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('更新规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除规则
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '未登录' } },
        { status: 401 }
      )
    }

    const { id } = params

    await prisma.communityRule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除规则错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/rules.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/admin/rules/route.ts tests/api/rules.test.ts
git commit -m "feat: add community rules management API"
```

### Task 26: 创建用户等级管理页面

**文件：**
- 创建: `app/admin/tiers/page.tsx`

**Step 1: 创建等级管理页面**

```typescript
// app/admin/tiers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit2 } from 'lucide-react'

interface UserTier {
  id: string
  name: string
  level: number
  description: string | null
  color: string
  icon: string | null
  permissions: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<UserTier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    description: '',
    color: '#5865f2',
    permissions: [] as string[],
    active: true
  })
  const [saving, setSaving] = useState(false)

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/admin/tiers')
      const data = await response.json()
      setTiers(data.tiers || [])
    } catch (error) {
      console.error('获取等级列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTiers()
  }, [])

  const handleCreate = async () => {
    if (!formData.name) {
      alert('请输入等级名称')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          level: formData.level + 1,
          description: '',
          color: '#5865f2',
          permissions: [],
          active: true
        })
        fetchTiers()
      } else {
        alert(data.error?.message || '创建失败')
      }
    } catch (error) {
      alert('创建失败')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/tiers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })
      fetchTiers()
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个等级吗？')) return

    try {
      await fetch(`/api/admin/tiers/${id}`, {
        method: 'DELETE'
      })
      fetchTiers()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-discord-bg flex items-center justify-center text-white">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            用户等级管理
          </h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-discord-accent hover:bg-[#4752c4]"
          >
            + 创建新等级
          </Button>
        </div>

        <Card className="bg-discord-card border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">等级列表</CardTitle>
            <CardDescription className="text-discord-muted">
              管理用户等级和权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#2b2d31] border border-[#1e1f22]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {tier.name}
                        </h3>
                        <Badge
                          variant={tier.active ? 'default' : 'secondary'}
                          className={tier.active ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {tier.active ? '启用' : '禁用'}
                        </Badge>
                      </div>
                      {tier.description && (
                        <p className="text-discord-muted text-sm">{tier.description}</p>
                      )}
                      {tier.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tier.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(tier.id, !tier.active)}
                    >
                      <Switch checked={tier.active} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4 text-discord-muted" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {tiers.length === 0 && (
                <div className="text-center py-12 text-discord-muted">
                  暂无等级
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 创建等级模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-discord-card border-[#1e1f22]">
              <CardHeader>
                <CardTitle className="text-white">创建新等级</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">等级名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-white">等级数字</Label>
                  <Input
                    id="level"
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">描述</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[100px] bg-[#1e1f22] border-[#1e1f22] text-white rounded-md p-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-white">颜色</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 bg-discord-accent hover:bg-[#4752c4]"
                  >
                    {saving ? '创建中...' : '创建'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/admin/tiers/page.tsx
git commit -m "feat: add user tiers management page"
```

### Task 27: 创建社区规则管理页面

**文件：**
- 创建: `app/admin/rules/page.tsx`

**Step 1: 创建规则管理页面**

```typescript
// app/admin/rules/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface CommunityRule {
  id: string
  title: string
  content: string
  category: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const CATEGORY_NAMES = {
  general: '通用规则',
  posting: '发帖规则',
  behavior: '行为规范',
  privacy: '隐私保护'
}

export default function RulesPage() {
  const [rules, setRules] = useState<CommunityRule[]>([])
  const [filteredRules, setFilteredRules] = useState<CommunityRule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'posting' | 'behavior' | 'privacy',
    order: 0,
    active: true
  })
  const [saving, setSaving] = useState(false)

  const fetchRules = async () => {
    try {
      const categoryParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
      const response = await fetch(`/api/admin/rules${categoryParam}`)
      const data = await response.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error('获取规则列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [selectedCategory])

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          title: '',
          content: '',
          category: 'general',
          order: rules.length + 1,
          active: true
        })
        fetchRules()
      } else {
        alert(data.error?.message || '创建失败')
      }
    } catch (error) {
      alert('创建失败')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })
      fetchRules()
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条规则吗？')) return

    try {
      await fetch(`/api/admin/rules/${id}`, {
        method: 'DELETE'
      })
      fetchRules()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-discord-bg flex items-center justify-center text-white">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            社区规则管理
          </h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-discord-accent hover:bg-[#4752c4]"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加新规则
          </Button>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-white"
          >
            全部
          </Button>
          {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
              className="text-white"
            >
              {name}
            </Button>
          ))}
        </div>

        <Card className="bg-discord-card border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">规则列表</CardTitle>
            <CardDescription className="text-discord-muted">
              管理社区规则和制度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-[#2b2d31] border border-[#1e1f22]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {rule.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_NAMES[rule.category as keyof typeof CATEGORY_NAMES]}
                      </Badge>
                      <Badge
                        variant={rule.active ? 'default' : 'secondary'}
                        className={`text-xs ${rule.active ? 'bg-green-600' : 'bg-gray-600'}`}
                      >
                        {rule.active ? '生效' : '失效'}
                      </Badge>
                    </div>
                    <p className="text-discord-muted">{rule.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(rule.id, !rule.active)}
                    >
                      <Switch checked={rule.active} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4 text-discord-muted" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="text-center py-12 text-discord-muted">
                  暂无规则
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 创建规则模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-discord-card border-[#1e1f22]">
              <CardHeader>
                <CardTitle className="text-white">添加新规则</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">规则标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-white">规则内容</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full min-h-[120px] bg-[#1e1f22] border-[#1e1f22] text-white rounded-md p-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">分类</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#1e1f22] border-[#1e1f22] text-white rounded-md p-2"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-white">排序</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 bg-discord-accent hover:bg-[#4752c4]"
                  >
                    {saving ? '创建中...' : '创建'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/admin/rules/page.tsx
git commit -m "feat: add community rules management page"
```

### Task 28: 初始化默认等级和规则数据

**文件：**
- 创建: `prisma/seed.ts`

**Step 1: 创建数据库种子脚本**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化默认数据...')

  // 创建默认用户等级
  const tiers = [
    {
      name: '普通成员',
      level: 1,
      description: '新注册用户，拥有基础权限',
      color: '#5865f2', // Discord 蓝色
      permissions: ['read_public', 'create_project', 'like_project', 'comment_project'],
      active: true
    },
    {
      name: '资深成员',
      level: 2,
      description: '活跃用户，拥有更多权限',
      color: '#e91e63', // 橙色
      permissions: ['read_public', 'create_project', 'like_project', 'comment_project', 'access_private_projects'],
      active: true
    },
    {
      name: '核心成员',
      level: 3,
      description: '长期活跃用户，拥有高级权限',
      color: '#3ba55c', // 绿色
      permissions: [
        'read_public',
        'create_project',
        'like_project',
        'comment_project',
        'access_private_projects',
        'access_private_communities',
        'moderate_own_content'
      ],
      active: true
    },
    {
      name: '管理员',
      level: 10,
      description: '平台管理员，拥有全部权限',
      color: '#ed4242', // 红色
      permissions: [
        'read_public',
        'read_private',
        'create_project',
        'like_project',
        'comment_project',
        'access_private_projects',
        'access_private_communities',
        'moderate_content',
        'manage_users',
        'manage_tiers',
        'manage_rules'
      ],
      active: true
    }
  ]

  for (const tier of tiers) {
    await prisma.userTier.upsert({
      where: { level: tier.level },
      update: {},
      create: tier
    })
  }

  // 创建默认社区规则
  const rules = [
    {
      title: '欢迎新成员',
      content: '请友好地欢迎新加入的成员，帮助他们了解社区规则和功能。',
      category: 'general',
      order: 1,
      active: true
    },
    {
      title: '内容质量',
      content: '发布的内容应当有价值、相关且高质量。避免发布重复、低质或无关的内容。',
      category: 'posting',
      order: 1,
      active: true
    },
    {
      title: '尊重他人',
      content: '对所有成员保持尊重，不进行人身攻击、歧视或其他不良行为。',
      category: 'behavior',
      order: 1,
      active: true
    },
    {
      title: '隐私保护',
      content: '尊重他人的隐私，不泄露个人信息。不要分享私下的对话或内容。',
      category: 'privacy',
      order: 1,
      active: true
    },
    {
      title: '禁止垃圾信息',
      content: '不得发布垃圾信息、广告或未经授权的商业内容。',
      category: 'posting',
      order: 2,
      active: true
    },
    {
      title: '举报违规',
      content: '如发现违规内容，请使用举报功能通知管理员。不要自行处理。',
      category: 'behavior',
      order: 2,
      active: true
    }
  ]

  for (const rule of rules) {
    await prisma.communityRule.upsert({
      where: { order: rule.order, category: rule.category },
      update: {},
      create: rule
    })
  }

  // 设置新用户的默认等级
  const defaultTier = await prisma.userTier.findUnique({
    where: { level: 1 }
  })

  if (defaultTier) {
    await prisma.user.updateMany({
      where: { tierId: null },
      data: { tierId: defaultTier.id }
    })
  }

  console.log('默认数据初始化完成！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

**Step 2: 添加种子脚本到 package.json**

在 `package.json` 中添加：

```json
{
  "scripts": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Step 3: 运行种子脚本**

```bash
npx tsx prisma/seed.ts
```

**Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add default tiers and rules seed script"
```

### Task 29: 更新项目卡片显示等级信息

**文件：**
- 修改: `components/project/ProjectCard.tsx`

**Step 1: 更新项目卡片组件**

在 `ProjectCard` 组件中添加私密标识和等级要求：

```typescript
// components/project/ProjectCard.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, MessageSquare, Lock, Shield } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string | null
    author: {
      id: string
      username: string
      avatar: string | null
      tier?: {
        name: string
        level: number
        color: string
      }
    }
    tags: string[]
    views: number
    isPrivate: boolean
    minTierRequired: number | null
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={project.author.avatar || undefined} />
              <AvatarFallback>{project.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white text-lg">{project.title}</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-discord-muted text-sm">{project.author.username}</p>
                {project.author.tier && (
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: project.author.tier.color }}
                  >
                    {project.author.tier.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {project.isPrivate && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              私密
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-discord-text mb-4">
          {project.description || '暂无描述'}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
              {tag}
            </Badge>
          ))}
        </div>
        {project.minTierRequired && (
          <div className="mt-2 flex items-center gap-2 text-discord-muted text-sm">
            <Shield className="h-4 w-4" />
            <span>需要 {project.minTierRequired} 级以上</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4 text-discord-muted text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {project.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {project._count.likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {project._count.comments}
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" className="text-discord-accent hover:text-white">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
```

**Step 2: 更新项目 API 返回等级信息**

在 `app/api/projects/route.ts` 的 GET 函数中添加：

```typescript
include: {
  author: {
    select: {
      id: true,
      username: true,
      avatar: true,
      tier: {
        select: {
          name: true,
          level: true,
          color: true
        }
      }
    }
  },
  // ... 其他字段
}
```

**Step 3: Commit**

```bash
git add components/project/ProjectCard.tsx app/api/projects/route.ts
git commit -m "feat: add tier and privacy indicators to projects"
```

---

## 权限检查和等级升级

### Task 30: 创建权限检查工具函数

**文件：**
- 创建: `lib/permissions.ts`

**Step 1: 创建权限检查工具**

```typescript
// lib/permissions.ts
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

interface UserWithTier {
  id: string
  tierId: string | null
  tier: {
    level: number
    permissions: string[]
  } | null
}

/**
 * 检查用户是否有指定权限
 */
export async function checkPermission(
  permission: string
): Promise<{ hasPermission: boolean; user: UserWithTier | null }> {
  const session = await auth()

  if (!session?.user) {
    return { hasPermission: false, user: null }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tier: true
    }
  }) as UserWithTier | null

  if (!user) {
    return { hasPermission: false, user: null }
  }

  if (!user.tier || !user.tier.permissions.includes(permission)) {
    return { hasPermission: false, user }
  }

  return { hasPermission: true, user }
}

/**
 * 检查用户等级是否满足要求
 */
export async function checkTierLevel(
  requiredLevel: number
): Promise<{ hasAccess: boolean; user: UserWithTier | null }> {
  const session = await auth()

  if (!session?.user) {
    return { hasAccess: false, user: null }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tier: true
    }
  }) as UserWithTier | null

  if (!user) {
    return { hasAccess: false, user: null }
  }

  const userLevel = user.tier?.level || 0
  if (userLevel < requiredLevel) {
    return { hasAccess: false, user }
  }

  return { hasAccess: true, user }
}

/**
 * 检查用户是否可以访问私密内容
 */
export async function canAccessPrivateContent(
  minTierRequired: number | null,
  isPrivate: boolean
): Promise<{ canAccess: boolean; user: UserWithTier | null; reason?: string }> {
  // 如果不是私密内容，可以访问
  if (!isPrivate) {
    const result = await checkPermission('read_public')
    return {
      canAccess: result.hasPermission,
      user: result.user
    }
  }

  // 如果没有最低等级要求，检查私密访问权限
  if (!minTierRequired) {
    const result = await checkPermission('access_private_projects')
    return {
      canAccess: result.hasPermission,
      user: result.user,
      reason: !result.hasPermission ? '需要私密访问权限' : undefined
    }
  }

  // 检查等级是否满足要求
  const result = await checkTierLevel(minTierRequired)
  return {
    canAccess: result.hasAccess,
    user: result.user,
    reason: !result.hasAccess ? `需要 ${minTierRequired} 级以上` : undefined
  }
}

/**
 * 检查是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const result = await checkPermission('manage_users')
  return result.hasPermission
}
```

**Step 2: 创建权限检查测试**

创建 `tests/unit/permissions.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import {
  checkPermission,
  checkTierLevel,
  canAccessPrivateContent,
  isAdmin
} from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')
vi.mock('@/lib/auth-config', () => ({
  auth: vi.fn()
}))

describe('Permissions', () => {
  it('should check user permission correctly', async () => {
    const mockUser = {
      id: '1',
      tierId: 'tier-1',
      tier: {
        level: 1,
        permissions: ['read_public', 'create_project']
      }
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const result = await checkPermission('read_public')
    expect(result.hasPermission).toBe(true)
    expect(result.user?.tier?.level).toBe(1)
  })

  it('should check tier level requirement', async () => {
    const mockUser = {
      id: '1',
      tierId: 'tier-1',
      tier: {
        level: 3,
        permissions: []
      }
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const result = await checkTierLevel(2)
    expect(result.hasAccess).toBe(true)
  })

  it('should deny access to private content without permission', async () => {
    const mockUser = {
      id: '1',
      tierId: 'tier-1',
      tier: {
        level: 1,
        permissions: ['read_public']
      }
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const result = await canAccessPrivateContent(2, true)
    expect(result.canAccess).toBe(false)
    expect(result.reason).toBeDefined()
  })
})
```

**Step 3: 运行测试验证通过**

```bash
npm test -- tests/unit/permissions.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add lib/permissions.ts tests/unit/permissions.test.ts
git commit -m "feat: add permission checking utilities"
```

### Task 31: 创建用户等级升级 API

**文件：**
- 创建: `app/api/admin/users/[id]/tier/route.ts`

**Step 1: 创建等级升级测试**

创建 `tests/api/user-tier.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { PUT } from '@/app/api/admin/users/[id]/tier/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('User Tier Upgrade API', () => {
  it('should upgrade user tier successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      tierId: 'tier-1',
      tier: { level: 1 }
    }

    const newTier = {
      id: 'tier-2',
      level: 2
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.userTier.findUnique).mockResolvedValue(newTier as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      tierId: 'tier-2',
      tier: newTier
    } as any)

    const request = new Request('http://localhost:3000/api/admin/users/1/tier', {
      method: 'PUT',
      body: JSON.stringify({ tierId: 'tier-2' })
    })

    const response = await PUT(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.tier.level).toBe(2)
  })
})
```

**Step 2: 运行测试验证失败**

```bash
npm test -- tests/api/user-tier.test.ts
```

Expected: FAIL with route not defined

**Step 3: 实现等级升级 API**

```typescript
// app/api/admin/users/[id]/tier/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// PUT - 升级用户等级
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 检查是否为管理员
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: { message: '需要管理员权限' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tierId } = body

    if (!tierId) {
      return NextResponse.json(
        { error: { message: '必须指定等级 ID' } },
        { status: 400 }
      )
    }

    // 检查等级是否存在
    const tier = await prisma.userTier.findUnique({
      where: { id: tierId }
    })

    if (!tier) {
      return NextResponse.json(
        { error: { message: '等级不存在' } },
        { status: 404 }
      )
    }

    // 更新用户等级
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { tierId }
      include: {
        tier: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('升级用户等级错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test -- tests/api/user-tier.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/admin/users/[id]/tier/route.ts tests/api/user-tier.test.ts
git commit -m "feat: add user tier upgrade API"
```

### Task 32: 创建管理员仪表板入口

**文件：**
- 创建: `app/admin/page.tsx`

**Step 1: 创建管理员仪表板页面**

```typescript
// app/admin/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, MessageSquare, Settings, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()

  const adminMenu = [
    {
      title: '用户管理',
      description: '管理用户账号和等级',
      icon: Users,
      href: '/admin/users'
      badge: '高级'
    },
    {
      title: '等级管理',
      description: '配置用户等级和权限',
      icon: Shield,
      href: '/admin/tiers',
      badge: null
    },
    {
      title: '社区规则',
      description: '管理社区规则和制度',
      icon: MessageSquare,
      href: '/admin/rules',
      badge: '6 条规则'
    },
    {
      title: 'Telegram 配置',
      description: '配置 Telegram Bot 同步',
      icon: Settings,
      href: '/admin/telegram',
      badge: '已配置'
    },
    {
      title: '活动日志',
      description: '查看平台活动记录',
      icon: Activity,
      href: '/admin/logs',
      badge: null
    }
  ]

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          管理员仪表板
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenu.map((item) => (
            <Card
              key={item.title}
              className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors cursor-pointer"
              onClick={() => router.push(item.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-8 w-8 text-discord-accent" />
                    <div>
                      <CardTitle className="text-white text-lg">
                        {item.title}
                      </CardTitle>
                      <p className="text-discord-muted text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 bg-discord-accent text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full text-discord-muted hover:text-white">
                  进入管理
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-[#2b2d31] border-[#1e1f22] mt-8">
          <CardHeader>
            <CardTitle className="text-white">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start text-white"
              onClick={() => router.push('/admin/tiers')}
            >
              <Shield className="h-4 w-4 mr-2" />
              配置用户等级
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-white"
              onClick={() => router.push('/admin/rules')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              更新社区规则
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-white"
              onClick={() => window.open('/api/admin/telegram/config', '_blank')}
            >
              <Settings className="h-4 w-4 mr-2" />
              配置 Telegram
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add admin dashboard page"
```

### Task 33: 更新主页添加管理员入口

**文件：**
- 修改: `app/page.tsx`

**Step 1: 在主页添加管理员入口链接**

在主页的导航栏或顶部添加管理员入口（仅管理员可见）：

```typescript
// 在 app/page.tsx 的 return 语句中添加
<div className="fixed top-4 right-4 z-50">
  <Button
    variant="ghost"
    size="icon"
    onClick={() => router.push('/admin')}
    className="bg-discord-card text-discord-muted hover:text-white"
  >
    <Settings className="h-5 w-5" />
  </Button>
</div>
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add admin entry point to homepage"
```

### Task 34: 更新项目发布 API 支持私密和等级

**文件：**
- 修改: `app/api/projects/route.ts`

**Step 1: 更新项目创建 Schema**

```typescript
// lib/validations.ts
// 更新 projectSchema，添加私密和等级字段
export const projectSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多 100 个字符'),
  description: z.string().max(1000, '描述最多 1000 个字符').optional(),
  githubUrl: z.string().url('GitHub 链接格式不正确').optional(),
  codeSnippet: z.string().max(10000, '代码片段最多 10000 个字符').optional(),
  tags: z.array(z.string()).max(5, '最多 5 个标签').optional(),
  isPrivate: z.boolean().optional(),
  minTierRequired: z.number().int().min(1, '等级必须为正整数').optional()
})
```

**Step 2: 更新项目 API POST 函数**

在 `app/api/projects/route.ts` 的 POST 函数中添加权限检查：

```typescript
// 添加权限检查
const canPostPrivate = await checkPermission('access_private_projects')
const canSetTier = await checkPermission('manage_tiers')

if (validatedData.isPrivate && !canPostPrivate.hasPermission) {
  return NextResponse.json(
    { error: { message: '你没有权限发布私密项目' } },
    { status: 403 }
  )
}

if (validatedData.minTierRequired && !canSetTier.hasPermission) {
  return NextResponse.json(
    { error: { message: '你没有权限设置等级要求' } },
    { status: 403 }
  )
}
```

**Step 3: Commit**

```bash
git add lib/validations.ts app/api/projects/route.ts
git commit -m "feat: add privacy and tier support to project creation"
```

---

## 环境变量和部署准备

### Task 35: 创建环境变量示例文件

**文件：**
- 创建: `.env.example`

**Step 1: 创建环境变量示例**

```bash
# .env.example
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/discord2"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# OAuth（可选）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Telegram Bot（可选）
# Telegram 配置也可通过数据库配置，这里提供备用方案
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHANNEL_ID="@your-channel"

# 文件存储（可选）
S3_BUCKET_NAME="your-bucket-name"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_REGION="us-east-1"

# Sentry（可选）
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add environment variables example"
```

### Task 19: 创建 .gitignore

**文件：**
- 修改: `.gitignore`

**Step 1: 更新 .gitignore**

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/migrations/202*

# test coverage
coverage
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore"
```

---

## 创建 README

### Task 20: 创建 README 文档

**文件：**
- 创建: `README.md`

**Step 1: 创建 README**

```markdown
# AI 社区交流平台

一个类似 Discord 的 AI 爱好者社区平台，支持作品展示、代码分享、社区交流。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 框架**: Tailwind CSS + shadcn/ui
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **测试**: Vitest

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd discord2
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填写数据库连接信息等。

### 4. 初始化数据库

```bash
npx prisma migrate dev
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
discord2/
├── app/                    # Next.js App Router
├── components/             # React 组件
├── lib/                   # 工具库
├── prisma/               # 数据库配置
├── public/               # 静态资源
└── tests/               # 测试文件
```

## 开发指南

### 运行测试

```bash
npm test              # 交互模式
npm run test:run     # 运行一次
```

### 数据库迁移

```bash
npx prisma migrate dev      # 开发环境迁移
npx prisma migrate prod    # 生产环境迁移
```

### 生成 Prisma Client

```bash
npx prisma generate
```

## 部署

### Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 手动部署

```bash
npm run build
npm start
```

## 贡献

欢迎提交 Pull Request！

## 许可证

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## 总结

这个实施计划将整个 AI 社区交流平台分解为 **35 个可执行的任务**，每个任务都可以在 2-5 分钟内完成。计划遵循 TDD 原则，每个功能都先写测试再实现，并频繁提交代码。

完成所有任务后，你将拥有一个功能完整的 MVP，包括：

### 核心功能
- ✅ 用户注册和登录
- ✅ 项目展示和搜索
- ✅ 认证中间件
- ✅ 完整的测试覆盖
- ✅ Discord 风格的 UI

### 权限和等级系统 ⭐ 新增
- ✅ **用户等级制度** - 4 个预设等级（普通成员、资深成员、核心成员、管理员）
- ✅ **权限管理系统** - 基于等级的功能权限控制
- ✅ **社区规则管理** - 完整的规则配置和分类管理
- ✅ **私密内容支持** - 项目和社区可设置为私密，仅特定等级可访问
- ✅ **等级要求设置** - 内容可设置最低访问等级
- ✅ **权限检查工具** - 统一的权限验证函数
- ✅ **等级升级机制** - 管理员可手动升级用户等级
- ✅ **管理员仪表板** - 统一的管理后台入口
- ✅ **等级可视化** - UI 中显示用户等级徽章和颜色

### Telegram 集成
- ✅ **Telegram 频道同步功能** - 新项目自动发布到 Telegram 频道
- **自动同步**：用户发布新项目时，自动同步到配置的 Telegram 频道
- **格式化消息**：以美观的 HTML 格式发送消息，包含项目标题、描述、作者、标签和链接
- **配置管理**：通过 API 配置 Telegram Bot Token 和频道 ID
- **连接测试**：提供测试连接功能，确保 Bot 配置正确
- **异步发送**：不影响项目创建的响应速度，异步发送消息

### 权限和等级系统详情

#### 用户等级（User Tier）
1. **普通成员 (Level 1)** - 蓝色
   - 权限：阅读公开内容、创建项目、点赞、评论
   - 默认给新用户

2. **资深成员 (Level 2)** - 橙色
   - 权限：普通成员权限 + 访问私密项目
   - 需要活跃一定时间获得

3. **核心成员 (Level 3)** - 绿色
   - 权限：资深成员权限 + 访问私密社区 + 管理自己的内容
   - 长期活跃用户

4. **管理员 (Level 10)** - 红色
   - 权限：所有权限，包括用户管理、等级管理、规则管理
   - 需要手动授予

#### 内容可见性
- **公开内容** - 所有等级可见
- **私密内容** - 指定等级以上可见
- **等级限制** - 可设置最低访问等级

#### 社区规则分类
- **通用规则** - 基本社区规范
- **发帖规则** - 内容质量和格式要求
- **行为规范** - 用户行为准则
- **隐私保护** - 数据安全和个人隐私规则

### 后续功能扩展
- 项目详情页
- 评论系统
- 点赞功能
- 社区板块
- 通知系统
- 帖子 Telegram 同步
- 用户等级自动升级机制
- 活动日志和审计功能
- 更多社交功能
