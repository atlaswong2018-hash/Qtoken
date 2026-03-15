# Qtoken - AI社区平台

一个类似Discord的AI开发者社区平台，支持项目分享、发帖互动、社区管理和Telegram同步功能。

## 功能特性

- 🎨 **Discord风格UI** - 采用Discord的配色和设计语言
- 👥 **用户系统** - 注册、登录、用户等级和权限管理
- 💻 **项目管理** - 发布AI项目、代码片段、GitHub链接分享
- 📝 **社区发帖** - 在社区中发布内容、评论和点赞
- 👥 **社区系统** - 创建和管理AI相关社区
- 🔔 **通知系统** - 实时通知和消息提醒
- 🤖 **Telegram同步** - 自动同步项目和帖子到Telegram频道
- 🛡️ **权限控制** - 基于用户等级的权限管理
- 🔒 **私密内容** - 支持私密项目和等级限制内容

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js (JWT)
- **验证**: Zod
- **图标**: Lucide React
- **Telegram集成**: node-telegram-bot-api

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/atlaswong2018-hash/Qtoken.git
cd Qtoken
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env` 并填写配置：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/qtoken"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Telegram Bot (可选)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHANNEL_ID="your-channel-id"
```

4. **初始化数据库**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
Qtoken/
├── app/                    # Next.js应用目录
│   ├── api/             # API路由
│   ├── admin/            # 管理员页面
│   ├── communities/       # 社区相关页面
│   ├── profile/          # 用户资料页面
│   └── projects/         # 项目相关页面
├── components/           # React组件
│   ├── ui/              # shadcn/ui基础组件
│   └── project/         # 项目相关组件
├── lib/                 # 工具函数和配置
│   ├── auth.ts          # 密码加密工具
│   ├── auth-config.ts    # NextAuth配置
│   ├── permissions.ts    # 权限检查工具
│   ├── telegram.ts       # Telegram集成
│   ├── validations.ts    # 数据验证
│   └── prisma.ts        # Prisma客户端
├── prisma/              # 数据库相关
│   ├── schema.prisma    # 数据模型定义
│   └── config.ts        # Prisma配置
└── public/              # 静态资源
```

## 用户等级系统

平台使用4级用户等级系统：

### 等级定义

1. **L1: 新成员** (New Member)
   - 基础用户权限
   - 可以浏览公开内容
   - 可以发布项目和帖子

2. **L2: 老成员** (Veteran Member)
   - 增强的用户权限
   - 可以参与社区讨论
   - 可以评论和点赞

3. **L3: 核心成员** (Core Member)
   - 高级用户权限
   - 可以创建私密社区
   - 可以访问部分受限内容

4. **L10: 管理员** (Admin)
   - 完全管理权限
   - 可以管理用户和等级
   - 可以管理社区规则
   - 可以配置系统设置

### 权限列表

- `view_private_content` - 查看私密内容
- `create_communities` - 创建社区
- `manage_users` - 管理用户
- `manage_content` - 管理内容
- `manage_communities` - 管理社区
- `configure_system` - 系统配置

## Telegram集成

### 配置步骤

1. 创建Telegram Bot:
   - 在Telegram中搜索 @BotFather
   - 发送 `/newbot` 创建新Bot
   - 获取Bot Token

2. 将Bot添加到频道:
   - 将Bot添加为频道管理员
   - 获取频道ID（使用 @MyIdBot）

3. 在管理员后台配置:
   - 访问 `/admin/telegram`
   - 输入Bot Token和Channel ID
   - 测试连接并保存

### 自动同步功能

- 📤 **项目发布** - 自动发送项目详情到Telegram频道
- 📝 **发帖互动** - 自动同步帖子内容和互动
- 🔔 **通知推送** - 重要事件自动通知

## API文档

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 项目相关

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/[id]` - 获取项目详情
- `DELETE /api/projects/[id]` - 删除项目
- `POST /api/projects/[id]/like` - 点赞项目

### 社区相关

- `GET /api/communities` - 获取社区列表
- `POST /api/communities` - 创建社区
- `GET /api/communities/[id]` - 获取社区详情
- `POST /api/communities/[id]/members` - 加入社区

### 通知相关

- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/[id]/read` - 标记通知为已读
- `PUT /api/notifications/mark-all-read` - 标记所有通知为已读

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 运行数据库迁移
npx prisma migrate dev

# 生成Prisma客户端
npx prisma generate

# 打开Prisma Studio（数据库管理界面）
npx prisma studio
```

## 部署

### Vercel部署

1. 将项目推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目可以部署到任何支持Next.js的平台：
- Vercel（推荐）
- Netlify
- Railway
- Render

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址: [https://github.com/atlaswong2018-hash/Qtoken](https://github.com/atlaswong2018-hash/Qtoken)
- 问题反馈: [Issues](https://github.com/atlaswong2018-hash/Qtoken/issues)

## 更新日志

### v1.0.0 (2026-03-15)

- 🎉 初始版本发布
- ✅ 完整的用户认证系统
- ✅ 项目管理和分享功能
- ✅ 社区和发帖功能
- ✅ Telegram自动同步
- ✅ 用户等级和权限系统
- ✅ 管理员后台界面
- ✅ 通知系统
- ✅ Discord风格UI设计

---

**Qtoken** - 让AI开发者更好地交流和协作！ 🚀
