// types/index.ts
// 全局类型定义

export interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  description: string | null
  repository: string | null
  website: string | null
  tags: string[]
  likes: number
  views: number
  createdAt: Date
  author: {
    id: string
    username: string
    avatar: string | null
  }
  _count?: {
    likes?: number
    comments?: number
  }
}

export interface Community {
  id: string
  name: string
  description: string | null
  slug: string
  memberCount: number
  createdAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    id: string
    username: string
    avatar: string | null
  }
  community: {
    id: string
    name: string
  }
  _count?: {
    comments?: number
  }
}

export interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    username: string
    avatar: string | null
  }
  project?: {
    id: string
    name: string
  } | null
  post?: {
    id: string
    title: string
  } | null
}

export interface Like {
  id: string
  createdAt: Date
  user: {
    id: string
    username: string
  }
  project: {
    id: string
    name: string
  }
}

export interface Notification {
  id: string
  type: 'PROJECT_CREATED' | 'POST_CREATED' | 'COMMENT_ADDED' | 'LIKE_RECEIVED'
  title: string
  content: string
  read: boolean
  createdAt: Date
  userId: string
  projectId?: string | null
  postId?: string | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

// API 请求类型
export interface CreateProjectRequest {
  name: string
  description: string
  repository?: string
  website?: string
  tags?: string[]
}

export interface CreatePostRequest {
  title: string
  content: string
  communityId: string
}

export interface CreateCommentRequest {
  content: string
  projectId?: string
  postId?: string
}

export interface UpdateProfileRequest {
  username: string
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// 筛选和搜索类型
export interface ProjectFilters {
  search?: string
  tag?: string
  page?: number
  limit?: number
}

export interface PostFilters {
  communityId?: string
  authorId?: string
  page?: number
  limit?: number
}
