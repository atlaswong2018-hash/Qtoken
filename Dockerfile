# 阶段 1：依赖安装
FROM node:20-alpine AS deps
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY package-lock.json* ./

# 安装所有依赖
RUN npm ci

# 阶段 2：构建
FROM node:20-alpine AS builder
WORKDIR /app

# 从 deps 阶段复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# 安装开发依赖
RUN npm install

# 复制源代码
COPY . .

# 设置 Next.js 配置
ENV NEXT_TELEMETRY_DISABLED 1

# 构建应用
RUN npm run build

# 阶段 3：生产运行时
FROM node:20-alpine AS runner
WORKDIR /app

# 创建非 root 用户以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --gid 1001 nodejs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# 启动应用
CMD ["node", "server.js"]
