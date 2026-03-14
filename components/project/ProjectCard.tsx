// components/project/ProjectCard.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, MessageSquare } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
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
  return (
    <Card className="bg-discord-card border-[#1e1f22] hover:bg-[#35373c] transition-colors">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={project.author.avatar || undefined} />
            <AvatarFallback>{project.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
            {project.tags.length > 0 && (
              <div className="flex gap-2 mt-1">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-discord-text mb-4">{project.description || '暂无描述'}</p>
        <div className="flex gap-4 mt-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-discord-accent hover:underline"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">GitHub</span>
            </a>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-discord-muted">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{project.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{project._count.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{project._count.comments}</span>
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
