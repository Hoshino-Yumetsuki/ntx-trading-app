'use client'

import { useEffect, useState, useId } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import { UnlockCoursesPage } from '@/src/components/pages/academy/unlock-courses'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses } from '@/src/utils/courseUtils'
import { useRouter } from 'next/navigation'

export function BrokerPage() {
  const router = useRouter()
  const packagesAnchorId = useId()
  const [unlocked, setUnlocked] = useState<Course[]>([])
  const [locked, setLocked] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState<Course | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllCourses()
        const { unlockedCourses, lockedCourses } = processCourses(
          data,
          'broker'
        )
        setUnlocked(unlockedCourses)
        setLocked(lockedCourses)
      } catch (e: any) {
        setError(e.message || '加载经纪商内容失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const featured = unlocked[0] || locked[0]

  const handleClick = (c: Course) => {
    if (c.link) {
      window.open(c.link, '_blank', 'noopener,noreferrer')
      return
    }
    if (!c.isUnlocked) {
      // 未解锁的提示，引导下滑购买
      const anchor = document.getElementById(packagesAnchorId)
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (c.content) setViewing(c)
  }

  if (viewing?.content) {
    return (
      <AcademyMarkdownReader
        title={viewing.name}
        content={viewing.content}
        onBack={() => setViewing(null)}
      />
    )
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative mb-0.5 w-28 h-9 md:w-32 md:h-10">
            <Image
              src="/Frame17@3x.png"
              alt="NTX Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <LanguageSwitcher />
        </div>

        {/* 顶部 Banner */}
        <div
          className="relative overflow-hidden rounded-2xl h-32 p-5 text-white"
          style={{
            backgroundImage: "url('/Group81@3x.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="flex items-center h-full">
            <div>
              <div className="text-2xl font-bold mb-1">经纪商</div>
              <div className="opacity-90">专属合作与权益</div>
            </div>
          </div>
        </div>
      </div>

      {/* 购买经纪商套餐（只显示隐藏分组） */}
      <div id={packagesAnchorId} className="px-6 mt-6">
        <UnlockCoursesPage
          showHiddenOnly
          hideInfoCards
          hideDescription
          onNavigateTab={(tabId) => {
            if (tabId === 'orders') {
              // 跳转到独立的订单页面
              router.push('/orders')
            }
          }}
        />
      </div>

      {/* Markdown 资料入口 - 移动到下方 */}
      <div className="px-6 mt-6">
        <Card className="glass-card border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              经纪商资料
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {loading ? (
              <div className="text-center text-slate-600 py-10">加载中...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
              featured && (
                <Card className="glass-card border-white/30 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-slate-800 font-semibold mb-1 line-clamp-1">
                          {featured.name}
                        </div>
                        <div className="text-slate-600 text-sm line-clamp-2">
                          {featured.description}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleClick(featured)}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        查看
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
