// components/error/ErrorBoundary.tsx
'use client'

import { Component, ReactNode, useState } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 这里可以添加错误报告逻辑，例如发送到 Sentry
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-screen bg-discord-bg flex items-center justify-center">
          <div className="max-w-md w-full px-4">
            <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">😵</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                出错了
              </h2>
              <p className="text-discord-muted mb-6">
                很抱歉，页面遇到了一些问题。请尝试刷新页面或返回上一页。
              </p>
              <button
                onClick={this.handleReset}
                className="bg-discord-accent hover:bg-[#5865f2] text-white px-6 py-2 rounded-md transition-colors"
              >
                重新加载
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-discord-muted cursor-pointer hover:text-white mb-2">
                    错误详情 (开发模式)
                  </summary>
                  <pre className="bg-[#1e1f22] p-4 rounded overflow-auto text-xs text-red-400 mt-2">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
