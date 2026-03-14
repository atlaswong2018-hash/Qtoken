// lib/validations.ts
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
  tags: z.array(z.string()).max(5, '最多 5 个标签').optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInput = z.infer<typeof projectSchema>
