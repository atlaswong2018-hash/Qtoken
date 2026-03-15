# 测试套件文档

## 测试概览

本项目采用 Vitest 作为测试框架，实现了全面的系统化测试。

### 测试统计
- **测试文件**: 10 个
- **测试用例**: 134 个
- **通过率**: 100%
- **执行时间**: ~2.70 秒

## 测试文件结构

```
tests/
├── factories.ts              # 测试数据工厂
├── factories.test.ts         # 工厂测试 (29 个测试)
├── integration.test.ts       # 集成测试场景 (15 个测试)
├── security.test.ts          # 安全测试 (23 个测试)
├── seed-data.test.ts         # 种子数据测试 (15 个测试)
├── setup.ts                  # 测试环境配置
└── api/
    ├── login.test.ts         # 登录 API 测试 (7 个测试)
    ├── register.test.ts      # 注册 API 测试 (9 个测试)
    ├── projects.test.ts      # 项目 API 测试 (8 个测试)
    └── notifications.test.ts # 通知系统测试 (23 个测试)
└── unit/
    ├── auth.test.ts          # 认证单元测试 (3 个测试)
    └── telegram.test.ts      # Telegram 机器人测试 (2 个测试)
```

## 测试数据工厂

### 支持的工厂类型

1. **User Factory** - 用户数据生成
   - 生成唯一 ID、邮箱、用户名
   - 支持批量生成
   - 支持自定义字段

2. **Project Factory** - 项目数据生成
   - 生成标题、描述、标签
   - 关联作者 ID
   - 生成浏览量统计

3. **Community Factory** - 社区数据生成
   - 生成社区名称、slug
   - 成员数量统计

4. **Post Factory** - 帖子数据生成
   - 生成标题、内容
   - 关联作者和社区
   - 浏览量统计

5. **Comment Factory** - 评论数据生成
   - 生成评论内容
   - 关联作者、项目或帖子

6. **Like Factory** - 点赞数据生成
   - 关联用户和项目

7. **Notification Factory** - 通知数据生成
   - 支持多种类型：like, comment, follow, mention
   - 已读/未读状态

## 测试覆盖范围

### API 测试
- ✅ 用户注册（验证、重复检查、批量注册）
- ✅ 用户登录（成功/失败场景）
- ✅ 项目管理（查询、过滤、搜索、分页）
- ✅ 通知系统（类型、状态、统计、批量操作）

### 单元测试
- ✅ 密码加密/验证
- ✅ Telegram 消息发送
- ✅ 数据验证逻辑

### 工厂测试
- ✅ 数据有效性验证
- ✅ 数据唯一性验证
- ✅ 批量生成性能
- ✅ 数据关联关系
- ✅ 边界条件处理

## 运行测试

### 运行所有测试
```bash
npm run test:run
```

### 监听模式运行
```bash
npm test
```

### 运行特定测试文件
```bash
npm test -- tests/api/register.test.ts
```

### 运行匹配的测试
```bash
npm test -- -t "应该成功注册"
```

## 测试示例

### 使用工厂生成测试数据

```typescript
import { factories } from './factories'

// 生成单个用户
const user = factories.user({
  username: 'custom_username',
  email: 'custom@example.com'
})

// 批量生成项目
const projects = factories.projects(10, {
  tags: ['react', 'typescript']
})

// 生成通知
const notifications = factories.notifications(15, {
  type: 'like',
  read: false
})
```

### 创建 API 测试

```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'
import { factories } from '../../factories'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('POST /api/auth/register', () => {
  it('应该成功注册新用户', async () => {
    const userData = factories.user()
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: userData.id,
      email: userData.email,
      username: userData.username,
    } as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        password: 'TestPass123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe(userData.email)
  })
})
```

## 测试最佳实践

1. **使用工厂生成数据**
   - 避免硬编码测试数据
   - 确保数据格式正确
   - 提高测试可维护性

2. **Mock 外部依赖**
   - Mock 数据库操作
   - Mock 认证服务
   - Mock 第三方 API

3. **测试边界条件**
   - 空数据
   - 重复数据
   - 无效数据
   - 大量数据

4. **保持测试独立**
   - 每个测试独立运行
   - 使用 `beforeEach` 清理状态
   - 避免测试间依赖

5. **有意义的测试名称**
   - 清晰描述测试意图
   - 使用中文或英文保持一致
   - 遵循 "应该..." 格式

## 持续集成

测试已配置为在 CI/CD 流程中自动运行，确保代码质量。

### 覆盖率报告
```bash
npm run test:coverage
```

### 预提交检查
测试会在每次提交前自动运行，确保代码质量。

## 依赖项

- **Vitest**: 测试框架
- **@faker-js/faker**: 测试数据生成
- **@testing-library/react**: React 组件测试（可选）
- **jsdom**: DOM 环境模拟

## 贡献指南

添加新测试时，请遵循以下流程：

1. 确定测试类型（单元测试、集成测试、API 测试）
2. 使用工厂生成测试数据
3. Mock 外部依赖
4. 编写清晰的测试用例
5. 运行测试确保通过
6. 更新本文档

## 常见问题

**Q: 如何调试失败的测试？**
A: 使用 `console.log` 或在 IDE 中使用调试器运行测试。

**Q: 测试运行缓慢怎么办？**
A: 使用 `-t` 参数运行特定测试，或检查是否有过多的 `beforeEach` 操作。

**Q: 如何测试异步操作？**
A: 使用 `async/await` 确保异步操作完成后再进行断言。

## 更新日志

- **2026-03-15**: 扩展测试套件至 134 个测试用例
  - 添加安全测试套件 (23 个测试)
  - 添加数据库种子数据测试 (15 个测试)
  - 包含 SQL 注入、XSS 攻击防护测试
  - 添加密码安全、数据隐私测试
  - 添加性能安全和数据验证测试
  - 添加压力测试数据集

- **2026-03-15**: 扩展测试套件至 96 个测试用例
  - 添加集成测试场景 (15 个测试)
  - 扩展登录测试 (7 个测试)
  - 添加完整的用户旅程测试
  - 添加性能测试场景
  - 添加数据一致性测试

- **2026-03-14**: 初始测试套件，包含 76 个测试用例
  - 添加测试数据工厂
  - 实现 API 测试
  - 实现单元测试
  - 添加通知系统测试
