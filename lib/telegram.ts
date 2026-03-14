// lib/telegram.ts
import TelegramBot from 'node-telegram-bot-api'
import { prisma } from '@/lib/prisma'

interface ProjectData {
  id: string
  title: string
  description: string | null
  author: {
    username: string
  }
  tags: string[]
  githubUrl: string | null
}

interface PostData {
  id: string
  title: string
  content: string
  author: {
    username: string
  }
  community: {
    name: string
  }
}

/**
 * 获取启用的 Telegram 配置
 */
async function getEnabledConfig() {
  const config = await prisma.telegramConfig.findFirst({
    where: { enabled: true }
  })
  return config
}

/**
 * 发送项目到 Telegram 频道
 */
export async function sendProjectToTelegram(project: ProjectData): Promise<boolean> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      console.log('Telegram 配置未启用')
      return false
    }

    const bot = new TelegramBot(config.botToken)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const projectUrl = `${baseUrl}/projects/${project.id}`

    // 构建消息
    const tags = project.tags.length > 0 ? project.tags.map(t => `#${t}`).join(' ') : ''

    let message = `🚀 <b>新项目发布</b>\n\n`
    message += `📝 <b>${project.title}</b>\n\n`
    if (project.description) {
      message += `${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}\n\n`
    }
    message += `👤 作者: @${project.author.username}\n`
    if (tags) {
      message += `🏷️ ${tags}\n`
    }
    message += `\n🔗 <a href="${projectUrl}">查看详情</a>`

    await bot.sendMessage(config.channelId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })

    console.log('项目已发送到 Telegram 频道')
    return true
  } catch (error) {
    console.error('发送到 Telegram 失败:', error)
    return false
  }
}

/**
 * 发送帖子到 Telegram 频道
 */
export async function sendPostToTelegram(post: PostData): Promise<boolean> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      console.log('Telegram 配置未启用')
      return false
    }

    const bot = new TelegramBot(config.botToken)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const postUrl = `${baseUrl}/posts/${post.id}`

    // 构建消息
    let message = `💬 <b>新帖子发布</b>\n\n`
    message += `📝 <b>${post.title}</b>\n\n`
    message += `${post.content.substring(0, 300)}${post.content.length > 300 ? '...' : ''}\n\n`
    message += `👤 作者: @${post.author.username}\n`
    message += `🏠 社区: ${post.community.name}\n`
    message += `\n🔗 <a href="${postUrl}">查看详情</a>`

    await bot.sendMessage(config.channelId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })

    console.log('帖子已发送到 Telegram 频道')
    return true
  } catch (error) {
    console.error('发送到 Telegram 失败:', error)
    return false
  }
}

/**
 * 测试 Telegram Bot 连接
 */
export async function testTelegramConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getEnabledConfig()
    if (!config) {
      return { success: false, message: '未找到启用的 Telegram 配置' }
    }

    const bot = new TelegramBot(config.botToken)
    await bot.getMe()

    return { success: true, message: 'Telegram Bot 连接成功' }
  } catch (error) {
    console.error('Telegram 连接测试失败:', error)
    return { success: false, message: 'Telegram Bot 连接失败' }
  }
}
