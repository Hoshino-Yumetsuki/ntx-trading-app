'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Loader2, Users } from 'lucide-react'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses } from '@/src/utils/courseUtils'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'

export function LoopCommunitiesPage({
  onReadingChange
}: {
  onReadingChange?: (reading: boolean) => void
}) {
  const [communities, setCommunities] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewingCommunity, setViewingCommunity] = useState<Course | null>(null)

  // 获取社区数据
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllCourses()
        const { unlockedCourses } = processCourses(data, 'loop_comm')
        setCommunities(unlockedCourses)
      } catch (error) {
        console.error('Failed to fetch communities:', error)
        setError('获取社区数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  // 点击社区卡片：优先跳转外链，无 link 时以 Markdown 形式展示内容
  const handleCommunityClick = (community: Course) => {
    if (community.link) {
      window.open(community.link, '_blank', 'noopener,noreferrer')
    } else if (community.content) {
      setViewingCommunity(community)
      onReadingChange?.(true)
    }
  }

  if (viewingCommunity?.content) {
    return (
      <AcademyMarkdownReader
        title={viewingCommunity.name}
        content={viewingCommunity.content}
        onBack={() => {
          setViewingCommunity(null)
          onReadingChange?.(false)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-slate-600">加载社区中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-600">暂无社区可显示</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {communities.map((community) => (
        <Card
          key={community.id}
          className="glass-card border-white/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => handleCommunityClick(community)}
        >
          <CardContent className="p-4 aspect-square flex flex-col items-center justify-center text-center">
            <div className="premium-icon w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200 mb-3">
              {/* 使用Users图标作为默认图标 */}
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-800 font-medium text-sm group-hover:text-blue-700 transition-colors">
                {community.name}
              </h3>
              <p className="text-slate-600 text-xs line-clamp-2">
                {community.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
