'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, MessageSquare } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    author: {
      id: string
      username: string
      avatar: string | null
    }
    tags: string[]
    views: number
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project._count.likes)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!session?.user || loading) return

    try {
      setLoading(true)

      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setLiked(data.liked)
        setLikeCount(data.likes)
      }
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={project.author.avatar || undefined} />
              <AvatarFallback>{project.author.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white text-lg">{project.name}</CardTitle>
              <p className="text-discord-muted text-sm">{project.author.username}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-discord-muted mb-4">
          {project.description || '暂无描述'}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4 text-discord-muted text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {project.views}
          </div>
          <button
            onClick={handleLike}
            disabled={!session?.user || loading}
            className={`flex items-center gap-1 transition-colors ${
              liked
                ? 'text-red-400 hover:text-red-500'
                : 'text-discord-muted hover:text-white'
            } disabled:opacity-50`}
          >
            <Heart
              className="h-4 w-4"
              fill={liked ? 'currentColor' : 'none'}
            />
            {likeCount}
          </button>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {project._count.comments}
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" className="text-discord-accent hover:text-white">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
