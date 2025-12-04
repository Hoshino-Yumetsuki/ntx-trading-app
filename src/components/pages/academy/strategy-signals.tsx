'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Target, ExternalLink, Loader2, Lock } from 'lucide-react'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses } from '@/src/utils/courseUtils'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'
import { useLanguage } from '@/src/contexts/language-context'
import { processLocaleString } from '@/src/utils/apiLocaleProcessor'

/**
 * 清除文本中的控制标记 [Sort:数字]、[Link:...] 和 [Show]
 */
function cleanControlTags(text: string): string {
  if (!text) return ''
  return text
    .replace(/\[Sort:\d+\]/g, '')
    .replace(/\[Link:[^\]]+\]/g, '')
    .replace(/\[Show\]/gi, '')
}

export function StrategySignalsPage({
  onReadingChange,
  onNavigateTab
}: {
  onReadingChange?: (reading: boolean) => void
  onNavigateTab?: (tabId: string) => void
}) {
  const { t, language } = useLanguage()
  const [unlockedCourses, setUnlockedCourses] = useState<Course[]>([])

  /**
   * 处理文本：先清除控制标记，再处理多语言标记
   */
  const processText = useCallback(
    (text: string) => {
      const cleaned = cleanControlTags(text)
      return processLocaleString(cleaned, language)
    },
    [language]
  )
  const [lockedCourses, setLockedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const allCoursesData = await getAllCourses()

        const { unlockedCourses, lockedCourses } = processCourses(
          allCoursesData,
          'signal'
        )

        setUnlockedCourses(unlockedCourses)
        setLockedCourses(lockedCourses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setError(t('signals.error.fetchFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [t])

  if (viewingCourse?.content) {
    return (
      <AcademyMarkdownReader
        title={processText(viewingCourse.name)}
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
      <Card className="glass-card border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            {t('signals.title')}
          </CardTitle>
          <p className="text-slate-600 text-sm ml-11">
            {t('signals.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">
                {t('signals.loading')}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-slate-600">{t('common.retry')}</p>
            </div>
          ) : unlockedCourses.length === 0 && lockedCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">{t('signals.noSignals')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {unlockedCourses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 mr-3 rounded"></div>
                    {t('signals.unlockedSignals')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {unlockedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="glass-card border-l-4 border-l-green-500 border-y-0 border-r-0 shadow hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 flex">
                          <div className="grow">
                            <div className="flex items-center mb-2 space-x-2">
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {t(course.category || '')}
                              </Badge>
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {t(course.level || '')}
                              </Badge>
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg mb-2">
                              {processText(course.name)}
                            </h3>
                            <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                              {processText(course.description)}
                            </p>
                          </div>
                          <div className="ml-4">
                            {(course.link || course.content) && (
                              <Button
                                size="sm"
                                className="glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50 flex items-center"
                                onClick={() => {
                                  if (course.link) {
                                    window.open(
                                      course.link,
                                      '_blank',
                                      'noopener,noreferrer'
                                    )
                                  } else if (course.content) {
                                    setViewingCourse(course)
                                    onReadingChange?.(true)
                                  }
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {t('common.view')}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {lockedCourses.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-slate-400 mr-3 rounded"></div>
                    {t('signals.lockedSignals')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {lockedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="glass-card border-white/30 shadow hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 flex">
                          <div className="grow">
                            <div className="flex items-center mb-2 space-x-2">
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {t(course.category || '')}
                              </Badge>
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {t(course.level || '')}
                              </Badge>
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg mb-2">
                              {processText(course.name)}
                            </h3>
                            <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                              {processText(course.description)}
                            </p>

                            {course.required_groups &&
                              course.required_groups.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-slate-500">
                                    {t('common.requires')}
                                    {course.required_groups.map((group, i) => (
                                      <span
                                        key={group.id}
                                        className="inline-flex items-center ml-1"
                                      >
                                        <span className="text-blue-600">
                                          {group.name}
                                        </span>
                                        {i < course.required_groups.length - 1
                                          ? '，'
                                          : ''}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                              )}
                          </div>
                          <div className="ml-4">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onNavigateTab?.('unlock')}
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              {t('common.unlock')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {unlockedCourses.length === 0 &&
        lockedCourses.length === 0 &&
        !loading &&
        !error && (
          <Card className="glass-card border-white/30 shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-slate-700 font-medium mb-2">
                  {t('signals.noAvailable')}
                </h3>
                <p className="text-slate-500 text-sm">
                  {t('signals.contactSupport')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
