'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  GraduationCap,
  Play,
  Lock,
  ExternalLink,
  TrendingUp,
  Shield,
  Target,
  Loader2
} from 'lucide-react'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses } from '@/src/utils/courseUtils'
import Image from 'next/image'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'
import { useLanguage } from '@/src/contexts/language-context'
import { processText } from '@/src/utils/apiLocaleProcessor'

export function LearningResourcesPage({
  onReadingChange,
  onNavigateTab
}: {
  onReadingChange?: (reading: boolean) => void
  onNavigateTab?: (tabId: string) => void
}) {
  const { t, language } = useLanguage()
  const [unlockedCourses, setUnlockedCourses] = useState<Course[]>([])

  // 包装 processText，绑定当前语言
  const localProcessText = useCallback(
    (text: string) => processText(text, language),
    [language]
  )
  const [lockedCourses, setLockedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)
  const [filterTab, setFilterTab] = useState<'practice' | 'advanced'>(
    'practice'
  )

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const allCoursesData = await getAllCourses()

        const { unlockedCourses, lockedCourses } = processCourses(
          allCoursesData,
          'article'
        )

        setUnlockedCourses(unlockedCourses)
        setLockedCourses(lockedCourses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setError(t('academy.error.fetchCoursesFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [t])

  const matchesFilter = (course: Course) => {
    const level = (course.level || '').toLowerCase()
    if (filterTab === 'advanced') {
      return level.includes('进阶') || level.includes('advanced')
    }
    return !(level.includes('进阶') || level.includes('advanced'))
  }

  const filteredUnlocked = unlockedCourses.filter(matchesFilter)
  const filteredLocked = lockedCourses.filter(matchesFilter)

  const formatDuration = (mins?: number) => {
    if (!mins || Number.isNaN(mins)) return ''
    const h = Math.floor(mins / 60)
    const m = Math.floor(mins % 60)
    if (h <= 0) return `${m}${t('common.time.minutes')}`
    return `${h}${t('common.time.hours')}${m}${t('common.time.minutes')}`
  }

  const features = [
    {
      icon: TrendingUp,
      title: t('academy.features.trendLogic.title'),
      description: t('academy.features.trendLogic.description')
    },
    {
      icon: Target,
      title: t('academy.features.institutionalModel.title'),
      description: t('academy.features.institutionalModel.description')
    },
    {
      icon: Shield,
      title: t('academy.features.riskControl.title'),
      description: t('academy.features.riskControl.description')
    }
  ]

  if (viewingCourse?.content) {
    return (
      <AcademyMarkdownReader
        title={localProcessText(viewingCourse.name)}
        content={viewingCourse.content}
        onBack={() => {
          setViewingCourse(null)
          onReadingChange?.(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl overflow-hidden shadow-xl bg-linear-to-br from-[#239419] to-[#025C03] text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-emerald-300 ring-offset-2 ring-offset-emerald-500/30">
              <AvatarImage src="/avatar-author.jpg" />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                DT
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {t('academy.instructor.name')}
              </h3>
              <p className="text-white/90 text-sm mb-2">
                {t('academy.instructor.title')}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/30"
                  onClick={() =>
                    window.open(
                      'https://space.bilibili.com/694170164',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t('common.follow')}
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4 border border-white/20 bg-white/10">
            <p className="text-sm leading-relaxed text-white/95">
              {t('academy.instructor.description')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="px-1">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <Button
            size="sm"
            className={
              filterTab === 'practice'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'glass-card text-slate-700'
            }
            onClick={() => setFilterTab('practice')}
          >
            {t('academy.tabs.practice')}
          </Button>
          <Button
            size="sm"
            className={
              filterTab === 'advanced'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'glass-card text-slate-700'
            }
            onClick={() => setFilterTab('advanced')}
          >
            {t('academy.tabs.advanced')}
          </Button>
        </div>
      </div>

      <Card className="glass-card border-white/50 shadow-md">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
              <GraduationCap className="w-5 h-5" />
            </span>
            {t('academy.coreCurriculum')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 glass-card rounded-lg hover:bg-blue-50/30 transition-colors"
              >
                <div className="premium-icon w-10 h-10 rounded-lg shrink-0 bg-linear-to-br from-blue-100 to-blue-200">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-slate-800 font-medium mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-slate-600">
            {t('common.loading.courses')}
          </span>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50"
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          {filteredUnlocked.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-slate-800 text-xl font-bold flex items-center">
                <span className="bg-green-100 text-green-600 p-1 rounded-md mr-2">
                  <Play className="w-5 h-5" />
                </span>
                {t('academy.myCourses')}
              </h2>
              {filteredUnlocked.map((course, index) => (
                <Card
                  key={index}
                  className="glass-card border-white/30 border-l-4 border-l-green-400"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="text-xs bg-purple-100/80 text-purple-700 border-purple-200">
                            {t(course.category || '')}
                          </Badge>
                          <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                            {t(course.level || '')}
                          </Badge>
                        </div>
                        <h3 className="text-slate-800 font-semibold text-lg mb-2">
                          {localProcessText(course.name)}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                          {localProcessText(course.description)}
                        </p>
                        {((course as any).lessonsCount ||
                          (course as any).totalDuration) && (
                          <p className="text-slate-500 text-xs">
                            {t('academy.course.lessons')}
                            {((course as any).lessonsCount as number) || '--'}{' '}
                            {t('academy.course.lessonsUnit')}
                            <span className="mx-2">|</span>
                            {t('academy.course.totalDuration')}
                            {formatDuration(
                              (course as any).totalDuration as number
                            ) || '--'}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        {course.image && (
                          <Image
                            src={course.image}
                            alt={localProcessText(course.name)}
                            width={96}
                            height={96}
                            className="rounded-md object-cover border border-white/40 mb-2"
                            unoptimized
                          />
                        )}
                        <Button
                          size="sm"
                          className="glass-card text-green-600 hover:text-green-700 border-green-300 bg-green-50/50"
                          onClick={() => {
                            if (course.link) {
                              window.open(
                                course.link,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            } else if (course.videoUrl) {
                              window.open(
                                course.videoUrl,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            } else if (course.content) {
                              setViewingCourse(course)
                              onReadingChange?.(true)
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {t('academy.course.startLearning')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredLocked.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-slate-800 text-xl font-bold flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                  <Lock className="w-5 h-5" />
                </span>
                {t('academy.lockedCourses')}
              </h2>
              {filteredLocked.map((course, index) => (
                <Card
                  key={index}
                  className="glass-card border-white/30 border-l-4 border-l-blue-400"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="text-xs bg-purple-100/80 text-purple-700 border-purple-200">
                            {t(course.category || '')}
                          </Badge>
                          <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                            {t(course.level || '')}
                          </Badge>
                        </div>
                        <h3 className="text-slate-800 font-semibold text-lg mb-2">
                          {localProcessText(course.name)}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                          {localProcessText(course.description)}
                        </p>
                        {((course as any).lessonsCount ||
                          (course as any).totalDuration) && (
                          <p className="text-slate-500 text-xs">
                            {t('academy.course.lessons')}
                            {((course as any).lessonsCount as number) || '--'}{' '}
                            {t('academy.course.lessonsUnit')}
                            <span className="mx-2">|</span>
                            {t('academy.course.totalDuration')}
                            {formatDuration(
                              (course as any).totalDuration as number
                            ) || '--'}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        {course.image && (
                          <Image
                            src={course.image}
                            alt={localProcessText(course.name)}
                            width={96}
                            height={96}
                            className="rounded-md object-cover border border-white/40 mb-2"
                            unoptimized
                          />
                        )}
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onNavigateTab?.('unlock')}
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          {t('academy.course.unlock')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {unlockedCourses.length === 0 && lockedCourses.length === 0 && (
            <div className="text-center p-8">
              <p className="text-slate-600">{t('academy.noCourses')}</p>
            </div>
          )}
        </>
      )}

      <Card className="glass-card border-white/30">
        <CardHeader>
          <CardTitle className="text-slate-800">
            {t('academy.targetAudience.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              {t('academy.targetAudience.item1')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              {t('academy.targetAudience.item2')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              {t('academy.targetAudience.item3')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
