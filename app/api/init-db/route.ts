import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 检查数据库初始化状态
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const check = searchParams.get('check') === 'true'

    // 检查用户等级是否存在
    const tiersCount = await prisma.userTier.count()
    const rulesCount = await prisma.communityRule.count()
    const isInitialized = tiersCount > 0 && rulesCount > 0

    return NextResponse.json({
      initialized: isInitialized,
      tiersCount,
      rulesCount,
      message: isInitialized ? '数据库已初始化' : '数据库未初始化'
    })
  } catch (error) {
    console.error('检查数据库状态错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 初始化数据库
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '需要管理员权限' } },
        { status: 403 }
      )
    }

    // 检查权限
    const isAdmin = await prisma.userTier.findFirst({
      where: {
        userId: session.user.id,
        tier: {
          permissions: {
            has: 'configure_system'
          }
        }
      }
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: { message: '需要管理员权限' } },
        { status: 403 }
      )
    }

    // 检查数据库是否已初始化
    const tiersCount = await prisma.userTier.count()
    if (tiersCount > 0) {
      return NextResponse.json({
        message: '数据库已经初始化过了',
        initialized: true,
        tiersCount
      })
    }

    // 检查规则
    const rulesCount = await prisma.communityRule.count()
    if (rulesCount > 0) {
      return NextResponse.json({
        message: '社区规则已经创建过了',
        initialized: true,
        rulesCount
      })
    }

    // 创建默认用户等级
    const defaultTiers = [
      {
        name: '新成员',
        level: 1,
        description: '刚刚加入平台的新用户，拥有基础权限',
        color: '#5865F2',
        permissions: ['view_public_content', 'create_posts'],
        active: true
      },
      {
        name: '老成员',
        level: 2,
        description: '活跃的社区成员，拥有增强权限',
        color: '#3BA55C',
        permissions: [
          'view_public_content',
          'create_posts',
          'join_communities',
          'comment_and_like'
        ],
        active: true
      },
      {
        name: '核心成员',
        level: 3,
        description: '社区的核心贡献者，拥有高级权限',
        color: '#FAA61A',
        permissions: [
          'view_public_content',
          'create_posts',
          'join_communities',
          'comment_and_like',
          'create_communities',
          'view_private_content'
        ],
        active: true
      },
      {
        name: '管理员',
        level: 10,
        description: '系统管理员，拥有完全管理权限',
        color: '#ED4245',
        permissions: [
          'view_public_content',
          'view_private_content',
          'create_posts',
          'join_communities',
          'comment_and_like',
          'create_communities',
          'manage_users',
          'manage_content',
          'manage_communities',
          'configure_system'
        ],
        active: true
      }
    ]

    console.log('开始创建默认用户等级...')
    for (const tier of defaultTiers) {
      await prisma.userTier.upsert({
        where: { level: tier.level },
        update: {},
        create: tier
      })
      console.log(`✅ 创建等级: ${tier.name}`)
    }

    // 创建默认社区规则
    const defaultRules = [
      {
        title: '尊重他人',
        content: '请尊重所有社区成员，不进行人身攻击、恶意诋毁或歧视性言论。',
        category: 'behavior',
        order: 1,
        active: true
      },
      {
        title: '发布高质量内容',
        content: '请发布有价值的AI项目、见解或讨论内容。避免发布无意义的内容或垃圾信息。',
        category: 'posting',
        order: 2,
        active: true
      },
      {
        title: '保护知识产权',
        content: '尊重他人的知识产权，不要发布盗版内容或未经授权使用他人代码。',
        category: 'privacy',
        order: 3,
        active: true
      },
      {
        title: '遵守法律法规',
        content: '所有内容和行为必须符合当地法律法规，禁止发布违法或有害信息。',
        category: 'general',
        order: 4,
        active: true
      },
      {
        title: '建设性讨论',
        content: '鼓励建设性的讨论和意见交流。对于不同观点，请理性讨论，避免争吵。',
        category: 'behavior',
        order: 5,
        active: true
      },
      {
        title: '内容标签规范',
        content: '发布内容时请选择准确的标签，方便其他用户发现和检索。',
        category: 'posting',
        order: 6,
        active: true
      },
      {
        title: '隐私保护',
        content: '不要在未经允许的情况下发布他人个人信息，保护自己和他人的隐私。',
        category: 'privacy',
        order: 7,
        active: true
      },
      {
        title: 'AI伦理规范',
        content: '讨论AI技术时，请遵守AI伦理规范，不分享有害或不当的AI应用。',
        category: 'general',
        order: 8,
        active: true
      }
    ]

    console.log('开始创建默认社区规则...')
    for (const rule of defaultRules) {
      await prisma.communityRule.upsert({
        where: { title: rule.title },
        update: {},
        create: rule
      })
      console.log(`✅ 创建规则: ${rule.title}`)
    }

    const results = {
      tiersCreated: defaultTiers.length,
      rulesCreated: defaultRules.length,
      message: '数据库初始化完成'
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('初始化数据库错误:', error)
    return NextResponse.json(
      { error: { message: '服务器错误' } },
      { status: 500 }
    )
  }
}
