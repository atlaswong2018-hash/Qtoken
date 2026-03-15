'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, MessageSquare, Lock, Shield } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string | null
    author: {
      id: string
      username: string
      avatar: string | null
      tier?: {
        name: string
        level: number
        color: string
      }
    }
    tags: string[]
    views: number
    isPrivate: boolean
    minTierRequired: number | null
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={project.author.avatar || undefined} />
              <AvatarFallback>{project.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white text-lg">{project.title}</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-[#b5bac1] text-sm">{project.author.username}</p>
                {project.author.tier && (
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: project.author.tier.color }}
                  >
                    {project.author.tier.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {project.isPrivate && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              私密
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#dbdee1] mb-4">
          {project.description || '暂无描述'}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#4e5058] text-white">
              {tag}
            </Badge>
          ))}
        </div>
        {project.minTierRequired && (
          <div className="mt-2 flex items-center gap-2 text-[#b5bac1] text-sm">
            <Shield className="h-4 w-4" />
            <span>需要 {project.minTierRequired} 级以上</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4 text-[#b5bac1] text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {project.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {project._count.likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {project._count.comments}
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" className="text-[#00a8fc] hover:text-white">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
