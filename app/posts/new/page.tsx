'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Send,
  ArrowLeft,
  Lock,
  Shield,
  X
} from 'lucide-react'

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [communities, setCommunities] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    communityId: '',
    isPrivate: false,
    minTierRequired: 0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // 加载社区列表
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities')
      const data = await response.json()
      setCommunities(data.communities || [])
    } catch (err) {
      console.error('获取社区列表失败:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('标题和内容不能为空')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/posts/${data.post.id}`)
      } else {
        const data = await response.json()
        setError(data.error?.message || '发帖失败')
      }
    } catch (err) {
      console.error('发帖错误:', err)
      setError('发帖失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#313338]">
      {/* 顶部导航 */}
      <div className="bg-[#2b2d31] border-b border-[#1e1f22] p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 text-[#b5bac1]" />
          </Button>
          <h1 className="text-2xl font-bold text-[#f2f3f5]">发布帖子</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">创建新帖子</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-[#ed4245]/20 border border-[#ed4245] rounded-md">
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-[#ed4245]" />
                  <span className="text-[#ed4245]">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="请输入帖子标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
                  required
                />
              </div>

              {/* 社区选择 */}
              <div>
                <Label htmlFor="communityId">选择社区（可选）</Label>
                <select
                  id="communityId"
                  className="flex h-10 w-full rounded-md border border-[#1e1f22] bg-[#1e1f22] text-[#dbdee1] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                >
                  <option value="">不选择社区</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.isPrivate && '🔒 '}{community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 内容 */}
              <div>
                <Label htmlFor="content">内容 *</Label>
                <textarea
                  id="content"
                  className="flex min-h-[200px] w-full rounded-md border border-[#1e1f22] bg-[#1e1f22] text-[#dbdee1] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="分享你的想法、见解或问题..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              {/* 私密选项 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  />
                  <Label htmlFor="isPrivate" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#b5bac1]" />
                    <span>私密帖子</span>
                  </Label>
                </div>

                {formData.isPrivate && (
                  <div>
                    <Label htmlFor="minTierRequired">最低等级要求</Label>
                    <div className="flex items-center gap-4">
                      <Shield className="h-4 w-4 text-[#b5bac1]" />
                      <Input
                        id="minTierRequired"
                        type="number"
                        placeholder="0 表示不限制"
                        value={formData.minTierRequired}
                        onChange={(e) => setFormData({ ...formData, minTierRequired: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="w-32 bg-[#1e1f22] border-[#1e1f22] text-[#dbdee1]"
                      />
                      <Badge variant="outline">需要 {formData.minTierRequired} 级以上</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#5865F2] hover:bg-[#4752C4] flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#5865F2] border-t-transparent mr-2"></div>
                      发布中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      发布帖子
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={loading}
                >
                  取消
                </Button>
              </div>
            </form>

            {/* 发帖提示 */}
            <div className="mt-6 pt-6 border-t border-[#1e1f22]">
              <div className="flex items-start gap-3 text-[#b5bac1]">
                <FileText className="h-5 w-5 text-[#5865F2]" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#f2f3f5] mb-2">发帖建议</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 选择合适的社区发布内容，提高可见度</li>
                    <li>• 标题要简洁明了，方便其他用户了解内容主题</li>
                    <li>• 内容要清晰具体，避免过短或过于冗长</li>
                    <li>• 合理使用私密功能，保护重要或敏感内容</li>
                    <li>• 选择适当的等级要求，控制内容访问权限</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
