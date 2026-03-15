import { faker } from '@faker-js/faker'

export interface UserFactoryData {
  id?: string
  email?: string
  username?: string
  passwordHash?: string
  avatar?: string | null
  bio?: string | null
  github?: string | null
  twitter?: string | null
}

export interface ProjectFactoryData {
  id?: string
  title?: string
  description?: string | null
  githubUrl?: string | null
  codeSnippet?: string | null
  imageUrl?: string | null
  tags?: string[]
  views?: number
  authorId?: string
}

export interface CommunityFactoryData {
  id?: string
  name?: string
  description?: string | null
  slug?: string
  icon?: string | null
  memberCount?: number
}

export interface PostFactoryData {
  id?: string
  title?: string
  content?: string
  views?: number
  authorId?: string
  communityId?: string
}

export interface CommentFactoryData {
  id?: string
  content?: string
  authorId?: string
  projectId?: string | null
  postId?: string | null
}

export interface LikeFactoryData {
  id?: string
  userId?: string
  projectId?: string
}

export interface NotificationFactoryData {
  id?: string
  type?: string
  title?: string
  content?: string | null
  read?: boolean
  userId?: string
}

export const factories = {
  user: (overrides?: UserFactoryData): UserFactoryData => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    username: faker.helpers.arrayElement(['a', 'b', 'c']) + faker.string.alphanumeric(10).replace(/[^a-zA-Z0-9_]/g, '_'),
    passwordHash: '$2a$10$' + faker.string.alphanumeric(53),
    avatar: faker.image.avatar(),
    bio: faker.lorem.paragraph(),
    github: `github-${faker.string.uuid()}`,
    twitter: faker.helpers.arrayElement(['a', 'b', 'c']) + faker.string.alphanumeric(10).replace(/[^a-zA-Z0-9_]/g, '_'),
    ...overrides,
  }),

  project: (overrides?: ProjectFactoryData): ProjectFactoryData => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    githubUrl: faker.internet.url(),
    codeSnippet: 'console.log("Hello World")',
    imageUrl: faker.image.url(),
    tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
    views: faker.number.int({ min: 0, max: 1000 }),
    authorId: faker.string.uuid(),
    ...overrides,
  }),

  community: (overrides?: CommunityFactoryData): CommunityFactoryData => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.paragraph(),
    slug: faker.helpers.slugify(faker.lorem.words(2)),
    icon: faker.image.url(),
    memberCount: faker.number.int({ min: 0, max: 10000 }),
    ...overrides,
  }),

  post: (overrides?: PostFactoryData): PostFactoryData => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    content: faker.lorem.paragraphs(3),
    views: faker.number.int({ min: 0, max: 5000 }),
    authorId: faker.string.uuid(),
    communityId: faker.string.uuid(),
    ...overrides,
  }),

  comment: (overrides?: CommentFactoryData): CommentFactoryData => ({
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    projectId: faker.string.uuid(),
    postId: null,
    ...overrides,
  }),

  like: (overrides?: LikeFactoryData): LikeFactoryData => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    projectId: faker.string.uuid(),
    ...overrides,
  }),

  notification: (overrides?: NotificationFactoryData): NotificationFactoryData => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['like', 'comment', 'follow', 'mention']),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    read: faker.datatype.boolean({ probability: 0.3 }),
    userId: faker.string.uuid(),
    ...overrides,
  }),

  users: (count: number, overrides?: UserFactoryData): UserFactoryData[] => {
    return Array.from({ length: count }, () => factories.user(overrides))
  },

  projects: (count: number, overrides?: ProjectFactoryData): ProjectFactoryData[] => {
    return Array.from({ length: count }, () => factories.project(overrides))
  },

  posts: (count: number, overrides?: PostFactoryData): PostFactoryData[] => {
    return Array.from({ length: count }, () => factories.post(overrides))
  },

  notifications: (count: number, overrides?: NotificationFactoryData): NotificationFactoryData[] => {
    return Array.from({ length: count }, () => factories.notification(overrides))
  },
}

export function generateTestEmail() {
  return `test_${faker.string.uuid()}@example.com`
}

export function generateTestUsername() {
  return `testuser_${faker.string.uuid().substring(0, 8)}`
}
