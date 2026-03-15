# Qtoken AI社区平台部署指南

本指南提供完整的部署步骤和故障排除建议。

## 部署前准备

### 1. 环境变量配置

确保 `.env` 文件包含以下必要的环境变量：

```env
# 数据库连接 (必需)
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth配置 (必需)
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"  # 本地开发
# NEXTAUTH_URL="https://your-domain.com"   # 生产环境

# Telegram Bot (可选，用于自动同步)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHANNEL_ID="@your-channel-id"
```

### 2. 数据库准备

**选项A: 托管PostgreSQL (推荐新手)**
- [Supabase](https://supabase.com) - 免费层充足
- [Neon](https://neon.tech) - 无服务器PostgreSQL
- [PlanetScale](https://planetscale.com) - 全球分布式

**选项B: 自建PostgreSQL**
- AWS RDS
- Google Cloud SQL
- Azure Database

### 3. 项目文件检查

确保以下文件已创建：
- ✅ `.env` - 环境变量配置
- ✅ `vercel.json` - Vercel部署配置
- ✅ `deploy.sh` - 自动部署脚本
- ✅ `package.json` - 包含正确的脚本
- ✅ `next.config.js` - Next.js配置
- ✅ `prisma/schema.prisma` - 数据库模型

## 部署平台选择

### Vercel部署 (推荐) ⚡

**优点:**
- 零配置部署
- 自动HTTPS
- 全球CDN加速
- 边缘函数支持
- 免费额度充足

**步骤:**

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel --prod
```

4. **配置环境变量**
- 访问 Vercel Dashboard
- 进入项目设置 → Environment Variables
- 添加以下环境变量：
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `TELEGRAM_BOT_TOKEN` (可选)
  - `TELEGRAM_CHANNEL_ID` (可选)

5. **数据库迁移**
部署后，连接到数据库并运行迁移：
```bash
# 在本地连接到生产数据库
npx prisma migrate deploy
```

### Netlify部署

**优点:**
- 免费CDN
- 表单处理
- 函数支持

**步骤:**

1. **安装Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **初始化项目**
```bash
netlify init
```

3. **部署**
```bash
netlify deploy --prod
```

4. **配置环境变量**
- 访问 Netlify Dashboard
- 进入 Site settings → Environment variables
- 添加所有必需的环境变量

### Railway部署

**优点:**
- 简单易用
- GitHub集成
- 实时日志

**步骤:**

1. 访问 [Railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择 `atlaswong2018-hash/Qtoken` 仓库
4. 添加环境变量
5. 部署

### Render部署

**优点:**
- 支持Docker
- 自动SSL
- 持久存储

**步骤:**

1. 访问 [render.com](https://render.com)
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库
4. 配置构建命令和环境变量

## 自动部署脚本

使用提供的 `deploy.sh` 脚本进行自动化部署：

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

脚本会自动：
1. 检查环境变量配置
2. 构建项目
3. 提供部署平台选项
4. 引导完成部署流程

## 数据库初始化

### 运行种子脚本

```bash
# 开发环境
npm run seed

# 生产环境 (需要先设置生产数据库连接)
DATABASE_URL="postgresql://production-host/database" npm run seed
```

种子脚本会创建：
- 4个默认用户等级
- 8个默认社区规则
- 初始化权限体系

## 生产环境检查清单

### 部署前检查

- [ ] 所有环境变量已配置
- [ ] 数据库连接已测试
- [ ] `.gitignore` 包含敏感文件
- [ ] 构建可以在本地成功
- [ ] 所有依赖已安装

### 部署后检查

- [ ] 应用可以正常访问
- [ ] 用户可以注册和登录
- [ ] 数据库连接正常
- [ ] 环境变量正确加载
- [ ] Telegram配置正常（如已配置）

## 故障排除

### 常见问题

**1. 数据库连接失败**
- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库允许外部连接
- 检查防火墙设置

**2. 构建失败**
- 清除 `.next` 缓存：`rm -rf .next`
- 删除 `node_modules`：`rm -rf node_modules`
- 重新安装依赖：`npm install`

**3. 环境变量未加载**
- 检查 Vercel/Netlify Dashboard 中的变量名称
- 确认变量值格式正确
- 重新部署项目

**4. API路由404错误**
- 检查API路径是否正确
- 确认文件命名格式 `[id]/route.ts`

**5. Prisma错误**
- 运行 `npx prisma generate`
- 运行 `npx prisma migrate dev`
- 检查 `DATABASE_URL` 是否正确

## 性能优化建议

### 构建优化

- 启用 Next.js Image Optimization
- 使用动态导入减少包大小
- 配置适当的缓存策略

### 数据库优化

- 为常用查询添加索引
- 优化N+1查询
- 使用连接池配置

### 前端优化

- 使用React.lazy进行代码分割
- 启用图片懒加载
- 配置适当的缓存头

## 监控和维护

### 日志监控

- 配置 Sentry 错误跟踪
- 监控 API 响应时间
- 跟踪用户活跃度统计

### 备份策略

- 定期数据库备份
- GitHub仓库自动备份
- 环境变量版本控制

## 安全检查清单

### 部署安全

- [ ] 使用 HTTPS 连接
- [ ] 环境变量使用强密钥
- [ ] 限制数据库访问权限
- [ ] 启用速率限制

### 应用安全

- [ ] 输入验证和清理
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] CSRF保护 (NextAuth.js已包含)
- [ ] 文件上传验证

## 部署后维护

### 日常维护

- 监控服务器资源使用
- 定期检查日志
- 及时更新依赖包
- 优化数据库查询性能

### 版本更新流程

1. 在测试环境验证新功能
2. 创建功能分支
3. 合并到主分支
4. 标记版本号
5. 部署到生产环境

## 技术支持

遇到问题时可以参考：

- [Next.js文档](https://nextjs.org/docs)
- [Prisma文档](https://www.prisma.io/docs)
- [Vercel文档](https://vercel.com/docs)
- [shadcn/ui文档](https://ui.shadcn.com)
- [NextAuth.js文档](https://next-auth.js.org/)

---

**最后更新**: 2026-03-15
**维护者**: Qtoken Team
