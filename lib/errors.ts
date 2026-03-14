// lib/errors.ts
import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code
        }
      },
      { status: error.statusCode }
    )
  }

  // Prisma 错误处理
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string }
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: { message: '数据已存在', code: 'DUPLICATE_ENTRY' } },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: { message: '记录不存在', code: 'NOT_FOUND' } },
          { status: 404 }
        )
    }
  }

  // 未知错误
  return NextResponse.json(
    { error: { message: '服务器内部错误', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  )
}
