// 数据库连接测试脚本

const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('测试数据库连接...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL)

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    console.log('Prisma客户端创建成功')

    // 测试连接
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('连接测试成功:', result)

    console.log('数据库连接正常！')
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

testConnection()
