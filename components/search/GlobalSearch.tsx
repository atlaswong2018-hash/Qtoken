// components/search/GlobalSearch.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchResult {
  type: 'project' | 'community' | 'post'
  id: string
  title: string
  description?: string | null
  url: string
}

export default function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // 并行搜索项目和社区
        const [projectsRes, communitiesRes] = await Promise.all([
          fetch(`/api/projects?search=${encodeURIComponent(query)}`),
          fetch(`/api/communities?search=${encodeURIComponent(query)}`)
        ])

        const projectsData = await projectsRes.json()
        const communitiesData = await communitiesRes.json()

        const projectResults = (projectsData.projects || []).map((p: any) => ({
          type: 'project' as const,
          id: p.id,
          title: p.name || p.title,
          description: p.description,
          url: `/projects/${p.id}`
        }))

        const communityResults = (communitiesData.communities || []).map((c: any) => ({
          type: 'community' as const,
          id: c.id,
          title: c.name,
          description: c.description,
          url: `/communities/${c.slug}`
        }))

        const combinedResults = [...projectResults, ...communityResults].slice(0, 10)
        setResults(combinedResults)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleSearch = (value: string) => {
    setQuery(value)
    setIsOpen(value.length >= 2)
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    router.push(result.url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '🚀'
      case 'community':
        return '👥'
      case 'post':
        return '💬'
      default:
        return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return '项目'
      case 'community':
        return '社区'
      case 'post':
        return '帖子'
      default:
        return type
    }
  }

  return (
    <div className="relative max-w-xl mx-auto" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="全局搜索..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-discord-muted"
          onFocus={() => setIsOpen(query.length >= 2)}
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-discord-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2b2d31] border border-[#1e1f22] rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
          {loading ? (
            <div className="p-4 text-center text-discord-muted">
              <div className="animate-spin inline-block">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 0 8 0 0001 4 4 0 00-8 0z"></path>
                </svg>
              </div>
              <div className="mt-2">搜索中...</div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-discord-muted">
              没有找到结果
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-[#35373c] transition-colors border-b border-[#1e1f22] last:border-0 flex items-start gap-3"
                >
                  <div className="text-lg flex-shrink-0">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-discord-accent bg-[#5865f2]/20 px-2 py-0.5 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                      <span className="text-white font-medium truncate">
                        {result.title}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-sm text-discord-muted line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
