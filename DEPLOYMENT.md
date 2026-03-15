# AI 社区交流平台 - 部署指南

本指南提供多种部署方式，帮助你将 AI 社区交流平台部署到生产环境。

## 📋 部署前检查清单

在部署前，请确保：

- [ ] 已完成所有功能开发和测试
- [ ] 所有测试通过（`npm test --run`）
- [ ] 配置环境变量（复制 `.env.example` 到 `.env.local`）
- [ ] 运行数据库迁移（`npm run prisma:migrate`）
- [ ] 生成 Prisma 客户端（`npm run prisma:generate`）
- [ ] 本地构建成功（`npm run build`）
- [ ] 准备生产数据库连接字符串

## 🚀 快速部署（推荐）

### Vercel 部署（最简单）

Vercel 是 Next.js 的推荐部署平台，提供自动部署和全球 CDN。

#### 步骤 1：准备环境变量

在 Vercel 控制台中配置以下环境变量：

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=https://your-app.vercel.app
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHANNEL_ID=@your-channel
```

#### 步骤 2：连接 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 `ai-community-platform` 项目
5. 配置环境变量（或从项目设置导入）
6. 点击 "Deploy"

#### 步骤 3：验证部署

部署完成后，访问你分配的 Vercel URL。

#### 自动部署

每次推送到 `main` 分支时，GitHub Actions 会自动触发部署到 Vercel。

## 🐳 Docker 部署

使用 Docker Compose 在本地或服务器上部署。

### 本地开发环境

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 进入应用容器
docker-compose exec app bash
```

### 服务器部署

#### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 10GB+ 磁盘空间

#### 部署步骤

1. 克隆代码到服务器：
```bash
git clone https://github.com/your-username/ai-community-platform.git
cd ai-community-platform
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际的配置
```

3. 启动服务：
```bash
docker-compose up -d
```

4. 访问应用：
```
http://your-server-ip:3000
```

5. 使用 Nginx 作为反向代理（可选）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 数据库管理

```bash
# 查看数据库日志
docker-compose logs postgres

# 进入数据库容器
docker-compose exec postgres psql -U discord2_user -d discord2_db

# 备份数据库
docker-compose exec postgres pg_dump -U discord2_user discord2_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U discord2_user -d discord2_db < backup.sql
```

## 🌐 传统服务器部署

如果你更喜欢传统的方式部署，也可以直接使用 Node.js。

### 前置要求

- Node.js 20+
- PostgreSQL 12+
- PM2（进程管理）
- Nginx（可选，反向代理）

### 部署步骤

1. 克隆代码：
```bash
git clone https://github.com/your-username/ai-community-platform.git
cd ai-community-platform
```

2. 安装依赖：
```bash
npm ci --production
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件
```

4. 运行数据库迁移：
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. 构建应用：
```bash
npm run build
```

6. 使用 PM2 启动：
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "ai-community" -- start

# 查看日志
pm2 logs ai-community

# 重启应用
pm2 restart ai-community

# 停止应用
pm2 stop ai-community
```

7. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
    }
}
```

## 🔧 环境变量配置

### 必需变量

```env
# 数据库连接
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth 配置
NEXTAUTH_SECRET=至少32个字符的随机字符串
NEXTAUTH_URL=你的应用URL（本地：http://localhost:3000）
```

### 可选变量

```env
# OAuth 提供商
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Telegram Bot（自动推送）
TELEGRAM_BOT_TOKEN=你的-Telegram-bot-token
TELEGRAM_CHANNEL_ID=@your-channel-name

# 文件存储（S3）
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1

# 错误追踪（Sentry）
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# 自定义域名
NEXT_PUBLIC_APP_NAME=AI 社区
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📊 监控和日志

### 应用日志

应用使用结构化日志，便于监控：

```javascript
// 应用内日志示例
console.log({
  timestamp: new Date().toISOString(),
  level: 'info',
  userId: session?.user?.id,
  action: 'project_created',
  metadata: { projectId: project.id }
})
```

### 性能监控

- 使用 Vercel Analytics
- 集成 Sentry 错误追踪
- 监控数据库查询性能
- 跟踪 API 响应时间

### 健康检查

应用提供健康检查端点：

```bash
# 检查应用健康状态
curl https://your-domain.com/api/health

# 预期响应
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:00:00.000Z",
  "uptime": 3600
}
```

## 🔐 安全配置

### 生产环境安全清单

- [ ] 使用强密码和随机密钥
- [ ] 启用 HTTPS（SSL/TLS 证书）
- [ ] 配置 CORS（限制来源域名）
- [ ] 设置速率限制
- [ ] 启用请求验证
- [ ] 定期更新依赖（`npm audit fix`）
- [ ] 配置防火墙规则
- [ ] 启用数据库备份
- [ ] 敏感信息不提交到 Git

### 数据库安全

```bash
# 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'secure_password';

# 授予只读权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

# 定期备份
0 2 * * * * * * * /usr/bin/pg_dump -U postgres discord2_db | gzip > /backup/discord2_$(date +\%Y\%m\%d).sql.gz
```

## 🚦 性能优化

### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_projects_author ON "Project"(authorId);
CREATE INDEX idx_projects_views ON "Project"(views DESC);
CREATE INDEX idx_notifications_user ON "Notification"(userId, "read" DESC);

-- 查询优化
EXPLAIN ANALYZE SELECT * FROM "Project" ORDER BY views DESC LIMIT 10;
```

### 应用优化

- 启用 Edge Functions（Vercel 自动优化）
- 使用 ISR（增量静态再生成）
- 实现数据缓存策略
- 优化图片加载和压缩
- 启用 Gzip 压缩

### 缓存策略

```javascript
// Redis 缓存示例
const cacheKey = `projects:${tag}:${page}`

// 从缓存读取
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// 写入缓存
await redis.setex(cacheKey, 3600, JSON.stringify(projects))
```

## 🔄 持续集成

### GitHub Actions 工作流

项目包含自动化的 CI/CD 流程：

- ✅ 自动运行测试
- ✅ 自动构建应用
- ✅ 自动部署到 Vercel
- ✅ 上传测试覆盖率报告

工作流程：
1. Push 到 `main` 分支
2. 自动运行所有测试
3. 如果测试通过，构建应用
4. 自动部署到 Vercel 生产环境

### 本地预部署

每次推送到任何分支时，Vercel 会自动创建预部署链接：

```
https://your-app-name-username.vercel.app
```

## 📈 扩展和负载均衡

### 负载均衡

使用多个实例：

```bash
# 使用 PM2 集群模式
pm2 start ecosystem.config.js

# 配置 Nginx 负载均衡
upstream ai_community {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://ai_community;
    }
}
```

### CDN 配置

- Vercel 自动提供全球 CDN
- 配置自定义域名
- 设置缓存规则
- 配置地理位置路由

## 🔧 故障排除

### 常见部署问题

#### 1. 数据库连接失败

```bash
# 检查数据库连接
docker-compose exec postgres pg_isready

# 查看连接字符串格式
echo $DATABASE_URL
```

#### 2. 构建失败

```bash
# 清理缓存
rm -rf .next node_modules

# 重新安装
npm ci

# 检查 Node 版本
node --version  # 应该 >= 20
```

#### 3. 环境变量未生效

```bash
# 验证环境变量加载
docker-compose exec app env

# 检查 .env 文件权限
ls -la .env.local
```

#### 4. 部署后功能异常

```bash
# 检查日志
docker-compose logs app

# 重启服务
docker-compose restart app

# 检查健康状态
curl http://localhost:3000/api/health
```

### 监控和告警

设置监控告警：

- CPU 使用率 > 80%
- 内存使用率 > 85%
- 错误率 > 5%
- 响应时间 > 2s
- 数据库连接失败

## 📚 参考资源

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署指南](https://vercel.com/docs)
- [Docker 部署最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/performance-tips/)

## 🆘 支持和故障恢复

### 备份策略

- 数据库每日自动备份
- 保留 30 天的备份
- 跨区域备份存储
- 测试恢复流程

### 灾难恢复

1. 准备新的服务器环境
2. 从备份恢复数据库
3. 重新部署应用
4. 验证所有功能
5. 切换 DNS 指向新服务器

---

**部署成功后，请访问你的应用并测试所有功能！** 🎉

如有问题，请查看：
- 应用日志
- Vercel 控制台
- GitHub Actions 运行日志
- 数据库监控
