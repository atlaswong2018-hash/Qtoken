import { PrismaClient } from '@prisma/client'

// 检查环境变量
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

console.log('Database URL found:', databaseUrl ? 'Yes' : 'No')

// 创建 Prisma 客户端实例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default prisma