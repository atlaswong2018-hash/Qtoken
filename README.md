# AI 社区交流平台

一个类似 Discord 的 AI 爱好者社区平台，支持项目分享、社区讨论和实时通知。

## 功能特性

### 核心功能
- **用户认证**：注册、登录、会话管理
- **项目管理**：创建、浏览、搜索、筛选 AI 项目
- **社区系统**：创建社区、发布帖子、查看帖子列表
- **评论系统**：对项目和帖子进行评论
- **点赞功能**：为喜欢的项目点赞
- **个人主页**：查看自己的项目和帖子
- **通知中心**：实时接收评论、点赞等互动通知
- **账户设置**：修改个人资料、更新密码
- **Telegram 集成**：新项目和帖子自动推送到 Telegram 频道

### 技术特性
- **响应式设计**：适配桌面和移动设备
- **主题定制**：Discord 风格的深色主题
- **类型安全**：完整的 TypeScript 类型定义
- **API 验证**：使用 Zod 进行输入验证
- **测试覆盖**：单元测试和 API 测试
- **分页功能**：智能分页导航，优化大数据量显示
- **加载状态**：统一的加载状态和骨架屏
- **错误处理**：错误边界和自定义错误页面
- **动画效果**：流畅的过渡动画和滚动条

## 技术栈

### 前端
- **Next.js 14**：App Router、Server Components
- **React 18**：Hooks、Context API
- **TypeScript**：类型安全
- **Tailwind CSS**：样式
- **shadcn/ui**：UI 组件库

### 后端
- **Next.js API Routes**：RESTful API
- **Prisma ORM**：数据库访问
- **NextAuth.js**：认证和会话管理
- **bcryptjs**：密码加密

### 数据库
- **PostgreSQL**：主数据库

### 第三方集成
- **Telegram Bot API**：消息推送
- **可选 OAuth**：GitHub、Google 等

### 开发工具
- **Vitest**：测试框架
- **React Testing Library**：组件测试
- **ESLint**：代码检查

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/discord2"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# OAuth（可选）
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"

# Telegram Bot（可选）
# TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
# TELEGRAM_CHANNEL_ID="@your-channel"

# 文件存储（可选）
# S3_BUCKET_NAME="your-bucket-name"
# S3_ACCESS_KEY="your-access-key"
# S3_SECRET_KEY="your-secret-key"
# S3_REGION="us-east-1"

# Sentry（可选）
# NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# （可选）填充示例数据
npm run prisma:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── auth/            # 认证相关 API
│   │   ├── comments/         # 评论 API
│   │   ├── communities/      # 社区 API
│   │   ├── notifications/     # 通知 API
│   │   ├── posts/            # 帖子 API
│   │   ├── projects/         # 项目 API
│   │   ├── settings/         # 设置 API
│   │   └── admin/           # 管理功能 API
│   ├── about/               # 关于页面
│   ├── communities/          # 社区页面
│   ├── login/               # 登录页面
│   ├── notifications/        # 通知中心
│   ├── posts/               # 帖子详情页面
│   ├── profile/             # 用户主页
│   ├── projects/            # 项目页面
│   ├── register/            # 注册页面
│   ├── settings/            # 账户设置
│   ├── error.tsx           # 全局错误处理
│   ├── not-found.tsx       # 404 页面
│   └── page.tsx            # 首页
├── components/               # React 组件
│   ├── error/             # 错误处理组件
│   ├── filters/            # 筛选和搜索组件
│   ├── loading/           # 加载状态组件
│   ├── navigation/         # 导航组件
│   ├── pagination/        # 分页组件
│   ├── project/           # 项目相关组件
│   ├── providers/         # Context Providers
│   ├── states/            # 空状态组件
│   └── ui/                # shadcn/ui 组件
├── lib/                     # 工具库
│   ├── auth-config.ts       # NextAuth 配置
│   ├── auth.ts             # 认证工具
│   ├── errors.ts           # 错误处理
│   ├── prisma.ts           # Prisma 客户端
│   ├── telegram.ts         # Telegram 集成
│   ├── utils.ts            # 工具函数
│   └── validations.ts      # Zod 验证模式
├── types/                   # TypeScript 类型定义
├── prisma/                  # Prisma 相关
│   ├── schema.prisma       # 数据库模型
│   └── migrations/         # 数据库迁移
├── tests/                   # 测试文件
│   ├── unit/               # 单元测试
│   └── api/                # API 测试
└── public/                  # 静态资源
```

## 数据库模型

### User（用户）
- id, username, email, password, avatar, createdAt

### Project（项目）
- id, name, description, repository, website, tags, likes, views, createdAt
- 关联：author（用户）、likes（点赞）、comments（评论）

### Community（社区）
- id, name, description, slug, memberCount, createdAt
- 关联：posts（帖子）

### Post（帖子）
- id, title, content, createdAt
- 关联：author（用户）、community（社区）、comments（评论）

### Comment（评论）
- id, content, createdAt
- 关联：author（用户）、project（项目，可选）、post（帖子，可选）

### Like（点赞）
- id, createdAt
- 关联：user（用户）、project（项目）

### TelegramConfig（Telegram 配置）
- id, botToken, channelId

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET/POST /api/auth/[...nextauth]` - NextAuth 回调

### 项目
- `GET /api/projects` - 获取项目列表（支持分页、搜索、筛选）
- `POST /api/projects` - 创建项目
- `GET /api/projects/[id]` - 获取项目详情
- `GET /api/projects/[id]/comments` - 获取项目评论
- `GET/POST /api/projects/[id]/like` - 点赞/取消点赞

### 社区
- `GET /api/communities` - 获取社区列表
- `POST /api/communities` - 创建社区
- `GET /api/communities/[id]` - 获取社区详情

### 帖子
- `GET /api/posts` - 获取帖子列表（支持分页、筛选）
- `POST /api/posts` - 创建帖子
- `GET /api/posts/[id]` - 获取帖子详情
- `GET /api/posts/[id]/comments` - 获取帖子评论

### 评论
- `POST /api/comments` - 创建评论

### 管理
- `GET/PUT /api/admin/telegram/config` - Telegram 配置

### 设置
- `PATCH /api/settings/profile` - 更新个人资料
- `POST /api/settings/password` - 修改密码

### 通知
- `GET /api/notifications` - 获取通知列表
- `POST /api/notifications` - 全部标记为已读
- `POST /api/notifications/mark-all` - 全部标记为已读
- `POST /api/notifications/[id]/read` - 标记单条通知为已读
- `DELETE /api/notifications/[id]` - 删除通知

## 测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 开发指南

### 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npm run prisma:migrate` 创建数据库迁移
3. 在 `app/api/` 中创建 API 路由
4. 在 `tests/api/` 中添加测试
5. 在 `app/` 中创建页面组件
6. 在 `components/` 中创建可复用组件

### 代码风格

- 使用 TypeScript 类型注解
- 遵循 React Hooks 最佳实践
- 组件使用函数式组件
- API 路由使用 async/await
- 错误使用统一的错误处理格式

### 提交规范

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或工具变动

## 部署

### 使用 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 使用 Docker

```bash
# 构建镜像
docker build -t ai-community-platform .

# 运行容器
docker run -p 3000:3000 --env-file .env.local ai-community-platform
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮箱：contact@example.com
