import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字')
})

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
})

export const projectSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多 100 个字符'),
  description: z.string().max(1000, '描述最多 1000 个字符').optional(),
  githubUrl: z.string().url('GitHub 链接格式不正确').optional(),
  codeSnippet: z.string().max(10000, '代码片段最多 10000 个字符').optional(),
  tags: z.array(z.string()).max(5, '最多 5 个标签').optional(),
  isPrivate: z.boolean().optional(),
  minTierRequired: z.number().int().min(1, '等级必须为正整数').optional()
})

export const tierSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50, '名称最多 50 字符'),
  level: z.number().int().positive('等级必须为正整数'),
  description: z.string().max(500, '描述最多 500 字符').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '颜色格式不正确').optional(),
  icon: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional()
})

export const ruleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容最多 2000 字符'),
  category: z.enum(['general', 'posting', 'behavior', 'privacy']),
  order: z.number().int().min(0, '顺序不能为负数'),
  active: z.boolean().optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type TierInput = z.infer<typeof tierSchema>
export type RuleInput = z.infer<typeof ruleSchema>
