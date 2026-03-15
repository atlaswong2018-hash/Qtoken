'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle, AlertCircle, Settings } from 'lucide-react'

interface TelegramConfig {
  configured: boolean
  channelId: string | null
  enabled: boolean
}

interface TestResult {
  success: boolean
  message: string
}

export default function TelegramConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<TelegramConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [formData, setFormData] = useState({
    botToken: '',
    channelId: '',
    enabled: true
  })

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/telegram/config')
      const data = await response.json()
      setConfig(data)
      if (data.channelId) {
        setFormData({
          botToken: '•••••••••••••••••',
          channelId: data.channelId,
          enabled: data.enabled
        })
      }
    } catch (error) {
      console.error('获取配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const response = await fetch('/api/admin/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setConfig({
          configured: true,
          channelId: data.config.channelId,
          enabled: data.config.enabled
        })
        alert('配置保存成功')
      } else {
        const data = await response.json()
        alert(data.error?.message || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      setTesting(true)
      setTestResult(null)

      const response = await fetch('/api/admin/telegram/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: formData.botToken })
      })

      const data = await response.json()
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? '连接成功' : '连接失败')
      })
    } catch (error) {
      console.error('测试失败:', error)
      setTestResult({
        success: false,
        message: '测试失败'
      })
    } finally {
      setTesting(false)
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-8 w-8 text-[#5865F2]" />
          <h1 className="text-3xl font-bold text-[#f2f3f5]">Telegram 配置</h1>
        </div>

        <Card className="bg-[#2b2d31] border-[#1e1f22] mb-6">
          <CardHeader>
            <CardTitle className="text-white">当前状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#b5bac1]">配置状态:</span>
                {config?.configured ? (
                  <Badge variant="default" className="bg-[#23a559]">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已配置
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    未配置
                  </Badge>
                )}
              </div>
              {config?.configured && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[#b5bac1]">Channel ID:</span>
                    <Badge variant="outline">{config.channelId}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#b5bac1]">启用状态:</span>
                    <Badge
                      variant={config.enabled ? "default" : "secondary"}
                      style={{ backgroundColor: config.enabled ? '#23a559' : undefined }}
                    >
                      {config.enabled ? '启用' : '禁用'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader>
            <CardTitle className="text-white">配置 Telegram Bot</CardTitle>
            <CardDescription>
              配置后，项目发布和发帖会自动同步到指定的 Telegram 频道
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="请输入 Telegram Bot Token"
                  value={formData.botToken}
                  onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                  required
                />
                <CardDescription className="mt-1 text-xs">
                  从 @BotFather 获取 Bot Token
                </CardDescription>
              </div>
              <div>
                <Label htmlFor="channelId">Channel ID</Label>
                <Input
                  id="channelId"
                  type="text"
                  placeholder="请输入 Telegram Channel ID"
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  required
                />
                <CardDescription className="mt-1 text-xs">
                  例如：-1001234567890（注意：必须是频道ID，不是用户名）
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                <Label htmlFor="enabled">启用自动同步</Label>
              </div>

              {/* 测试结果 */}
              {testResult && (
                <div className={`p-4 rounded-md ${
                  testResult.success
                    ? 'bg-[#23a559]/20 border border-[#23a559]'
                    : 'bg-[#ed4245]/20 border border-[#ed4245]'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-[#23a559]" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-[#ed4245]" />
                    )}
                    <span className={testResult.success ? 'text-[#23a559]' : 'text-[#ed4245]'}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing}
                  className="flex-1"
                >
                  {testing ? '测试中...' : '测试连接'}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#5865F2] hover:bg-[#4752C4] flex-1"
                >
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#2b2d31] border-[#1e1f22] mt-6">
          <CardHeader>
            <CardTitle className="text-white">使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-[#dbdee1]">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <p className="font-medium">创建 Telegram Bot</p>
                  <p className="text-sm text-[#b5bac1]">在 Telegram 中搜索 @BotFather，创建新 Bot 并获取 Token</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <p className="font-medium">添加 Bot 到频道</p>
                  <p className="text-sm text-[#b5bac1]">将 Bot 添加为频道管理员，获取频道权限</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <p className="font-medium">获取频道 ID</p>
                  <p className="text-sm text-[#b5bac1]">使用 @MyIdBot 获取频道 ID（格式：-1001234567890）</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <p className="font-medium">配置并测试</p>
                  <p className="text-sm text-[#b5bac1]">在上方输入 Bot Token 和 Channel ID，点击测试连接</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
