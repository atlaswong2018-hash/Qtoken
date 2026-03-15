'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Shield } from 'lucide-react'

interface Tier {
  id: string
  name: string
  level: number
  description: string | null
  color: string
  permissions: string[]
  active: boolean
  _count: {
    users: number
  }
}

export default function TiersManagementPage() {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTier, setEditingTier] = useState<Tier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    description: '',
    color: '#5865F2',
    permissions: [] as string[],
    active: true
  })

  const fetchTiers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tiers')
      const data = await response.json()
      setTiers(data.tiers || [])
    } catch (error) {
      console.error('获取等级列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTiers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTier ? `/api/admin/tiers/${editingTier.id}` : '/api/admin/tiers'
      const method = editingTier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        setEditingTier(null)
        setFormData({
          name: '',
          level: 1,
          description: '',
          color: '#5865F2',
          permissions: [],
          active: true
        })
        fetchTiers()
      } else {
        const data = await response.json()
        alert(data.error?.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  const handleEdit = (tier: Tier) => {
    setEditingTier(tier)
    setFormData({
      name: tier.name,
      level: tier.level,
      description: tier.description || '',
      color: tier.color,
      permissions: tier.permissions,
      active: tier.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个等级吗？')) return

    try {
      const response = await fetch(`/api/admin/tiers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTiers()
      } else {
        const data = await response.json()
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

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
          <h1 className="text-3xl font-bold text-[#f2f3f5]">用户等级管理</h1>
          <Button onClick={() => setShowModal(true)} className="bg-[#5865F2] hover:bg-[#4752C4]">
            <Plus className="h-4 w-4 mr-2" />
            添加等级
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield
                      className="h-6 w-6"
                      style={{ color: tier.color }}
                    />
                    <CardTitle className="text-white">{tier.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tier.id)}
                      disabled={tier._count.users > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5bac1]">等级:</span>
                    <Badge variant="secondary">{tier.level}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5bac1]">用户数:</span>
                    <Badge variant="secondary">{tier._count.users}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5bac1]">状态:</span>
                    <Badge
                      variant={tier.active ? "default" : "secondary"}
                      style={{ backgroundColor: tier.active ? '#23a559' : undefined }}
                    >
                      {tier.active ? '启用' : '禁用'}
                    </Badge>
                  </div>
                  {tier.description && (
                    <CardDescription className="mt-2">
                      {tier.description}
                    </CardDescription>
                  )}
                  {tier.permissions.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-[#b5bac1]">权限:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tier.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 添加/编辑等级模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-[#2b2d31] border-[#1e1f22] w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingTier ? '编辑等级' : '添加等级'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">名称</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">等级</Label>
                    <Input
                      id="level"
                      type="number"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">颜色</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#5865F2] hover:bg-[#4752C4]">
                      {editingTier ? '更新' : '添加'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false)
                        setEditingTier(null)
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
