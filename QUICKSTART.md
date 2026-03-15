# 🚀 AI 社区交流平台 - 快速部署指南

5 分钟快速将你的 AI 社区平台部署到生产环境！

## 📋 前置条件

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 `main` 分支
- [ ] Vercel 账户（免费）

## ⚡ 超快部署（Vercel）

### 步骤 1：准备 GitHub 仓库（1 分钟）

```bash
# 如果还没有推送代码，先推送到 GitHub
git push origin main
```

### 步骤 2：连接 Vercel 和 GitHub（2 分钟）

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub 仓库
5. 选择 `ai-community-platform` 项目
6. 点击 "Import"

### 步骤 3：配置环境变量（1 分钟）

在 Vercel 项目设置中添加以下环境变量：

**必需变量：**
- `DATABASE_URL` - 你的 PostgreSQL 连接字符串
- `NEXTAUTH_SECRET` - 至少 32 个字符的随机密钥
- `NEXTAUTH_URL` - 自动设置为你的 Vercel URL

**可选变量：**
- `TELEGRAM_BOT_TOKEN` - Telegram Bot Token
- `TELEGRAM_CHANNEL_ID` - Telegram 频道 ID

### 步骤 4：一键部署（1 分钟）

点击 Vercel 中的 "Deploy" 按钮！

✅ **部署完成！** 等待 1-2 分钟，访问你的 Vercel URL。

## 🌟 获取数据库

你需要一个 PostgreSQL 数据库，有以下选项：

### 选项 A：Vercel Postgres（推荐，最简单）

1. 在 Vercel 项目中，点击 "Storage" → "Postgres"
2. 点击 "Create Database"
3. 选择免费或付费计划
4. 复制连接字符串
5. 添加到环境变量 `DATABASE_URL`

### 选项 B：Supabase（免费，功能丰富）

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 "Settings" → "Database" 获取连接字符串
4. 复制连接字符串
5. 添加到环境变量 `DATABASE_URL`

### 选项 C：Railway（简单，包含多数据库）

1. 访问 [railway.app](https://railway.app)
2. 创建新项目，选择 PostgreSQL
3. 复制连接字符串
4. 添加到环境变量 `DATABASE_URL`

### 选项 D：自托管数据库

如果你有自己的服务器：

```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres createdb discord2_db
sudo -u postgres createuser --pwprompt your_password discord2_user
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE discord2_db TO discord2_user;"

# 连接字符串格式
DATABASE_URL=postgresql://discord2_user:your_password@localhost:5432/discord2_db
```

## 🔐 生成安全的密钥

### 生成 NEXTAUTH_SECRET

**方法 1：OpenSSL（推荐）**
```bash
openssl rand -base64 32
```

**方法 2：在线工具**
访问：https://generate-secret.vercel.app/32

**方法 3：Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 生成 Telegram Bot Token

1. 在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 命令
3. 按提示设置 bot 名称和用户名
4. 复制生成的 token
5. 添加到环境变量 `TELEGRAM_BOT_TOKEN`

### 配置 Telegram Channel

1. 在 Telegram 中创建公开频道
2. 将 bot 添加为频道管理员
3. 记录频道 ID（格式：@channel_name）
4. 添加到环境变量 `TELEGRAM_CHANNEL_ID`

## 🧪 运行数据库迁移

部署前需要在本地运行迁移：

```bash
# 设置环境变量
cp .env.production.example .env.local
# 编辑 .env.local 文件，填入实际值

# 安装依赖
npm install

# 运行数据库迁移
npx prisma migrate deploy

# 或者本地开发
npm run prisma:migrate
npm run prisma:generate
```

## ✅ 验证部署

### 1. 检查应用状态

访问你的 Vercel URL，验证：
- [ ] 页面加载正常
- [ ] 可以注册和登录
- [ ] 可以创建项目
- [ ] 可以浏览项目和社区
- [ ] 响应式设计正常（移动端测试）

### 2. 检查环境变量

在 Vercel 控制台 → "Settings" → "Environment Variables" 中确认：
- [ ] 所有必需变量都已设置
- [ ] 变量值正确（无拼写错误）
- [ ] 敏感信息没有暴露

### 3. 检查日志

在 Vercel 控制台 → "Logs" 中查看：
- [ ] 没有错误日志
- [ ] 数据库连接正常
- [ ] API 请求成功

### 4. 测试关键功能

```bash
# 测试注册 API
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"TestPass123!"}'

# 测试项目创建
curl -X POST https://your-app.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"name":"Test Project","description":"A test project","tags":["react","typescript"]}'

# 测试健康检查
curl https://your-app.vercel.app/api/health
```

## 🎯 下一步

部署完成后，你可以：

1. **自定义域名**
   - 在 Vercel 中添加自定义域名
   - 配置 DNS 指向 Vercel

2. **启用 OAuth**
   - 在 GitHub OAuth Apps 中创建应用
   - 在 Google Cloud Console 中创建 OAuth 客户端
   - 配置客户端 ID 和密钥

3. **设置监控**
   - 集成 Sentry 错误追踪
   - 配置 Vercel Analytics
   - 设置 Uptime 监控

4. **优化性能**
   - 配置 CDN 缓存规则
   - 实现数据库查询优化
   - 启用图片优化

5. **自动化备份**
   - 设置数据库自动备份
   - 配置日志归档
   - 测试恢复流程

## 📞 故障排除

### 常见问题

**Q: 部署后 500 错误？**
A: 检查 `DATABASE_URL` 环境变量，运行 `npx prisma migrate deploy`

**Q: 登录功能不工作？**
A: 确认 `NEXTAUTH_URL` 正确设置为你的 Vercel URL

**Q: Telegram 通知不工作？**
A: 检查 bot 是否已添加到频道，token 是否正确

**Q: 图片无法加载？**
A: 检查 S3 配置或使用外部图片服务

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT.md)
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署](https://nextjs.org/docs/deployment)

## 💡 专业建议

1. **使用 Vercel 环境变量**而不是 `.env` 文件
2. **启用 Preview Deployments** 进行分支测试
3. **配置自动域名** 进行无缝更新
4. **使用 Vercel Analytics** 监控性能
5. **设置回滚策略** 以快速回退问题部署
6. **定期检查依赖**：`npm audit fix`
7. **监控数据库性能**，添加必要的索引
8. **实现日志聚合** 便于调试和分析

---

**🎉 恭喜！你的 AI 社区平台已经准备好上线！**

需要帮助？查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细的故障排除指南。
