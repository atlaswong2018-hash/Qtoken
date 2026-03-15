'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, ShieldAlert } from 'lucide-react'

interface Rule {
  id: string
  title: string
  content: string
  category: 'general' | 'posting' | 'behavior' | 'privacy'
  order: number
  active: boolean
}

const CATEGORY_NAMES = {
  general: '通用规则',
  posting: '发帖规则',
  behavior: '行为规范',
  privacy: '隐私保护'
}

export default function RulesManagementPage() {
  const router = useRouter()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Rule['category'],
    order: 0,
    active: true
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/rules')
      const data = await response.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error('获取规则列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingRule ? `/api/admin/rules/${editingRule.id}` : '/api/admin/rules'
      const method = editingRule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        setEditingRule(null)
        setFormData({
          title: '',
          content: '',
          category: 'general',
          order: 0,
          active: true
        })
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error?.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule)
    setFormData({
      title: rule.title,
      content: rule.content,
      category: rule.category,
      order: rule.order,
      active: rule.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条规则吗？')) return

    try {
      const response = await fetch(`/api/admin/rules/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  const filteredRules = selectedCategory
    ? rules.filter(rule => rule.category === selectedCategory)
    : rules

  if (loading) {
    return (
      <div className="min-h-screen bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#313338] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f2f3f5]">社区规则管理</h1>
          <Button onClick={() => setShowModal(true)} className="bg-[#5865F2] hover:bg-[#4752C4]">
            <Plus className="h-4 w-4 mr-2" />
            添加规则
          </Button>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="bg-[#5865F2] hover:bg-[#4752C4]"
          >
            全部
          </Button>
          {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
              className="bg-[#5865F2] hover:bg-[#4752C4]"
            >
              {name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredRules.map((rule) => (
            <Card key={rule.id} className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-[#ed4245]" />
                    <CardTitle className="text-white">{rule.title}</CardTitle>
                    <Badge variant="secondary">
                      {CATEGORY_NAMES[rule.category]}
                    </Badge>
                    <Badge
                      variant={rule.active ? "default" : "secondary"}
                      style={{ backgroundColor: rule.active ? '#23a559' : undefined }}
                    >
                      {rule.active ? '启用' : '禁用'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#b5bac1] text-sm">
                    <span>顺序:</span>
                    <Badge variant="outline">{rule.order}</Badge>
                  </div>
                  <CardDescription className="mt-3 whitespace-pre-wrap">
                    {rule.content}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 添加/编辑规则模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-[#2b2d31] border-[#1e1f22] w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingRule ? '编辑规则' : '添加规则'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">标题</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">分类</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Rule['category'] })}
                      required
                    >
                      {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="order">顺序</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">内容</Label>
                    <textarea
                      id="content"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <Label htmlFor="active">启用</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#5865F2] hover:bg-[#4752C4]">
                      {editingRule ? '更新' : '添加'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false)
                        setEditingRule(null)
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
