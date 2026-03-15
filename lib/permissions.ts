import prisma from './prisma'

interface UserWithTier {
  id: string
  tierId: string | null
  tier: {
    level: number
    permissions: string[]
  } | null
}

/**
 * 检查用户是否有指定权限
 */
export async function checkPermission(
  permission: string
): Promise<{ hasPermission: boolean; user: UserWithTier | null }> {
  // TODO: 这里需要从 session 中获取用户信息
  // 暂时返回 false
  return { hasPermission: false, user: null }
}

/**
 * 检查用户等级是否满足要求
 */
export async function checkTierLevel(
  requiredLevel: number
): Promise<{ hasAccess: boolean; user: UserWithTier | null }> {
  // TODO: 这里需要从 session 中获取用户信息
  // 暂时返回 false
  return { hasAccess: false, user: null }
}

/**
 * 检查用户是否可以访问私密内容
 */
export async function canAccessPrivateContent(
  minTierRequired: number | null,
  isPrivate: boolean
): Promise<{ canAccess: boolean; user: UserWithTier | null; reason?: string }> {
  // 如果不是私密内容，可以访问
  if (!isPrivate) {
    const result = await checkPermission('read_public')
    return {
      canAccess: result.hasPermission,
      user: result.user
    }
  }

  // 如果没有最低等级要求，检查私密访问权限
  if (!minTierRequired) {
    const result = await checkPermission('access_private_projects')
    return {
      canAccess: result.hasPermission,
      user: result.user,
      reason: !result.hasPermission ? '需要私密访问权限' : undefined
    }
  }

  // 检查等级是否满足要求
  const result = await checkTierLevel(minTierRequired)
  return {
    canAccess: result.hasAccess,
    user: result.user,
    reason: !result.hasAccess ? `需要 ${minTierRequired} 级以上` : undefined
  }
}

/**
 * 检查是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const result = await checkPermission('manage_users')
  return result.hasPermission
}
