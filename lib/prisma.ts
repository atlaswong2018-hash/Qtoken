import { PrismaClient } from '@prisma/client'

// 创建 Prisma 客户端实例，不检查环境变量以避免模块评估错误
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default prisma