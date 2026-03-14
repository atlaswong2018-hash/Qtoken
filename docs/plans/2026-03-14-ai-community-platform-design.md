# AI 社区交流平台 - 设计文档

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**创建日期：** 2026-03-14
**设计者：** Claude Code
**版本：** 1.0

---

## 目标

构建一个类似 Discord 的 AI 爱好者社区平台，支持作品展示、代码分享、社区交流、寻找灵感和组队开发。

---

## 架构概述

### 整体架构

现代 Next.js 全栈应用，采用 App Router 架构模式。前端使用 React Server Components (RSC) 提升性能，后端通过 Next.js API Routes 处理业务逻辑，数据层使用 PostgreSQL + Prisma ORM。

### 技术栈

- **前端框架：** Next.js 14 (App Router) + React + TypeScript
- **UI 框架：** Tailwind CSS + shadcn/ui（Discord 风格组件）
- **数据库：** PostgreSQL + Prisma ORM
- **认证：** NextAuth.js（支持邮箱/密码登录）
- **部署：** Vercel（自动部署 + CDN）
- **测试：** Vitest + Testing Library

### 设计原则

1. **开发速度优先** - 1-2 个月完成 MVP
2. **参考 Discord 风格** - UI/UX 完全参考 Discord
3. **异步交流为主** - 评论、私信、通知，无需 WebSocket
4. **个人项目友好** - 简单维护，低成本

---

## 目录结构

```
discord2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关路由组
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # 主界面路由组
│   │   ├── home/                 # 作品广场
│   │   ├── projects/             # 项目详情
│   │   ├── communities/          # 社区板块
│   │   ├── profile/              # 个人主页
│   │   └── notifications/        # 通知中心
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── comments/
│   │   └── users/
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── layout/                   # 布局组件（侧边栏、导航栏）
│   ├── project/                  # 项目相关组件
│   └── community/                # 社区相关组件
├── lib/                         # 工具库
│   ├── prisma.ts                # Prisma 客户端
│   ├── auth.ts                  # 认证逻辑
│   ├── errors.ts                # 错误处理
│   └── validations.ts           # 输入验证
├── prisma/
│   ├── schema.prisma            # 数据库模型
│   └── migrations/              # 数据库迁移
├── tests/                       # 测试文件
├── public/                      # 静态资源
└── types/                       # TypeScript 类型定义
```

---

## 数据库设计

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  avatar        String?
  bio           String?   @db.Text
  github        String?   @unique
  twitter       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]
  comments      Comment[]
  likes         Like[]
  posts         Post[]
  notifications Notification[]
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
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  likes       Like[]

  @@index([authorId])
  @@index([createdAt])
  @@index([tags])
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?  @db.Text
  slug        String   @unique
  icon        String?
  memberCount Int      @default(0)
  createdAt   DateTime @default(now())

  posts       Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  views     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  communityId String
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  comments    Comment[]
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
```

### 数据库设计说明

1. **用户系统**：支持邮箱/密码登录，可选绑定 GitHub 账号
2. **项目系统**：主要展示 GitHub 项目链接和代码片段，支持标签分类
3. **社区系统**：类似 Discord 频道的社区板块，支持发帖讨论
4. **互动系统**：点赞、评论、关注等社交功能
5. **通知系统**：异步通知，记录用户的所有互动

---

## API 设计

### API 结构

```
app/api/
├── auth/
│   ├── register/route.ts       # 用户注册
│   ├── login/route.ts         # 用户登录
│   └── logout/route.ts        # 用户登出
├── projects/
│   ├── route.ts               # GET 列表, POST 创建
│   ├── [id]/route.ts          # GET 详情, PUT 更新, DELETE 删除
│   ├── [id]/like/route.ts     # POST 点赞/取消点赞
│   └── [id]/comments/route.ts # GET 评论列表, POST 发表评论
├── communities/
│   ├── route.ts               # GET 列表, POST 创建
│   └── [id]/route.ts          # GET 详情, PUT 更新, DELETE 删除
├── posts/
│   ├── route.ts               # GET 列表, POST 创建
│   ├── [id]/route.ts          # GET 详情, PUT 更新, DELETE 删除
│   └── [id]/comments/route.ts # GET 评论列表, POST 发表评论
├── users/
│   ├── [id]/route.ts          # GET 用户详情
│   ├── [id]/follow/route.ts   # POST 关注/取消关注
│   └── [id]/projects/route.ts # GET 用户的项目列表
└── notifications/
    └── route.ts               # GET 通知列表, PUT 标记已读
```

### API 设计原则

1. **RESTful 风格**：遵循 REST API 设计规范
2. **统一错误处理**：所有 API 返回一致的错误格式
3. **分页支持**：列表类 API 支持分页
4. **认证中间件**：保护需要登录的 API
5. **数据验证**：使用 Zod 进行输入验证
6. **类型安全**：完全使用 TypeScript

---

## 认证和安全

### 认证架构

使用 NextAuth.js（Auth.js）作为认证解决方案，支持邮箱/密码登录。

### 密码加密

使用 bcryptjs 进行密码加密，Salt Rounds 设为 10。

### 中间件保护路由

使用 Next.js Middleware 保护需要登录的路由。

### 安全措施

1. **输入验证**：使用 Zod 进行严格的输入验证
2. **CSRF 防护**：NextAuth.js 内置 CSRF 保护
3. **XSS 防护**：React 自动转义，配合 DOMPurify 处理用户内容
4. **SQL 注入防护**：Prisma ORM 自动参数化查询
5. **速率限制**：防止暴力破解
6. **HTTPS 强制**：生产环境强制使用 HTTPS

---

## 错误处理和测试

### 统一错误处理

使用自定义 ApiError 类和 handleApiError 函数处理所有 API 错误。

### 输入验证

使用 Zod Schema 验证所有输入数据。

### 测试策略

1. **单元测试**：使用 Vitest 测试纯函数
2. **集成测试**：测试 API 端点
3. **E2E 测试**：使用 Playwright 测试用户流程

---

## 部署和监控

### 部署架构

```
┌─────────────────────────────────────┐
│        Vercel (CDN + Edge)          │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│    Neon PostgreSQL (托管数据库)     │
└─────────────────────────────────────┘
```

### 环境变量配置

配置数据库连接、NextAuth 密钥、OAuth 凭证等。

### 监控和日志

1. **错误追踪**：使用 Sentry
2. **性能监控**：集成 Google Analytics 或 Plausible
3. **健康检查**：提供 /api/health 端点

### 备份策略

- 自动备份脚本（每天凌晨 2 点）
- 备份文件存储到 S3 兼容对象存储

---

## MVP 功能清单

### 第一阶段（核心功能）

- [ ] 用户注册/登录
- [ ] 项目发布和展示
- [ ] 项目评论和点赞
- [ ] 社区板块和帖子
- [ ] 基本的用户资料
- [ ] 响应式 UI（Discord 风格）

### 第二阶段（增强功能）

- [ ] 通知系统
- [ ] 搜索功能
- [ ] 标签和分类
- [ ] 用户关注
- [ ] 项目收藏

### 第三阶段（优化）

- [ ] 性能优化
- [ ] SEO 优化
- [ ] 监控和分析
- [ ] 自动化测试

---

## 成本估算

### 开发成本

- 开发时间：1-2 个月
- 开发者时间：个人项目

### 运营成本

| 服务 | 月成本 | 说明 |
|------|--------|------|
| Vercel | $0-20 | 免费额度足够 MVP |
| Neon PostgreSQL | $0-25 | 免费计划支持 3GB |
| 域名 | $1-10 | 可选 |
| 合计 | $1-55/月 | 非常低廉 |

---

## 技术决策记录

### 为什么选择 Next.js？

- 开发速度快，适合 MVP
- SEO 友好
- 自动部署和优化
- 丰富的生态系统

### 为什么选择 PostgreSQL？

- 关系型数据适合论坛场景
- 强大的全文搜索能力
- 优秀的扩展性
- 托管服务成熟

### 为什么不使用 Elixir/Phoenix？

- MVP 不需要实时通信
- 学习曲线陡峭
- 增加开发周期
- 个人项目维护复杂

---

## 未来扩展路线图

### 短期（3-6 个月）

- 增加实时通知（WebSocket/SSE）
- 集成 Meilisearch 提升搜索体验
- 优化移动端体验

### 中期（6-12 个月）

- 迁移部分服务到 Elixir/Phoenix
- 引入 Redis 缓存
- 支持更多内容类型

### 长期（1 年以上）

- 参考 Discord 架构进行重构
- 引入 ScyllaDB 处理海量消息
- 多地区部署

---

## 总结

这个设计文档为一个 AI 社区交流平台提供了完整的架构方案。核心思路是：

1. **快速 MVP**：使用成熟的技术栈，1-2 个月完成
2. **参考 Discord**：UI/UX 完全参考 Discord，提供熟悉的使用体验
3. **务实选择**：不追求过度设计，专注于核心功能
4. **可扩展性**：架构设计考虑未来扩展，可以平滑升级

这个方案适合个人开发者快速上线一个功能完整的 AI 社区平台。
