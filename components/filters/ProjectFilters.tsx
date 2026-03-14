// components/filters/ProjectFilters.tsx
'use client'

import { Input } from '@/components/ui/input'

interface ProjectFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  tag: string
  onTagChange: (value: string) => void
  onCreateProject?: () => void
}

const tags = [
  { value: '', label: '所有标签' },
  { value: 'ai', label: 'AI' },
  { value: 'machine-learning', label: '机器学习' },
  { value: 'computer-vision', label: '计算机视觉' },
  { value: 'nlp', label: '自然语言处理' },
  { value: 'deep-learning', label: '深度学习' },
  { value: 'robotics', label: '机器人技术' },
  { value: 'data-science', label: '数据科学' }
]

export default function ProjectFilters({
  search,
  onSearchChange,
  tag,
  onTagChange,
  onCreateProject
}: ProjectFiltersProps) {
  return (
    <div className="bg-[#2b2d31] rounded-lg p-4 mb-8">
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#1e1f22] border-[#1e1f22] text-white"
          />
        </div>

        <select
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="bg-[#1e1f22] border-[#1e1f22] text-white rounded-md px-3 py-2"
        >
          {tags.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="bg-discord-accent hover:bg-[#5865f2] text-white px-6 py-2 rounded-md transition-colors"
          >
            创建项目
          </button>
        )}
      </div>
    </div>
  )
}
