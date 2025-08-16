'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Target, ExternalLink, Loader2 } from 'lucide-react'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses, extractUrlFromContent } from '@/src/utils/courseUtils'

export function StrategySignalsPage() {
  const [unlockedCourses, setUnlockedCourses] = useState<Course[]>([])
  const [lockedCourses, setLockedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const allCoursesData = await getAllCourses()

        // Process courses to separate unlocked and locked, filter for signal only
        const { unlockedCourses, lockedCourses } = processCourses(
          allCoursesData,
          'signal'
        )

        setUnlockedCourses(unlockedCourses)
        setLockedCourses(lockedCourses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setError('获取策略信号数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            策略信号
          </CardTitle>
          <p className="text-slate-600 text-sm ml-11">
            基于机构行为的趋势系统+程序化工具，清晰捕捉中期趋势
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">加载策略信号中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-slate-600">请稍后刷新页面重试</p>
            </div>
          ) : unlockedCourses.length === 0 && lockedCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">暂无策略信号可显示</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 已解锁的策略信号 */}
              {unlockedCourses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 mr-3 rounded"></div>
                    已解锁策略信号
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {unlockedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="glass-card border-l-4 border-l-green-500 border-y-0 border-r-0 shadow hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 flex">
                          <div className="flex-grow">
                            <div className="flex items-center mb-2 space-x-2">
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {course.category}
                              </Badge>
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {course.level}
                              </Badge>
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg mb-2">
                              {course.name}
                            </h3>
                            <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                          <div className="ml-4">
                            {course.content && (
                              <Button
                                size="sm"
                                className="glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50 flex items-center"
                                onClick={() => {
                                  const url = extractUrlFromContent(
                                    course.content || ''
                                  )
                                  if (url)
                                    window.open(
                                      url,
                                      '_blank',
                                      'noopener,noreferrer'
                                    )
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 待解锁的策略信号 */}
              {lockedCourses.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-slate-400 mr-3 rounded"></div>
                    待解锁信号
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {lockedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="glass-card border-white/30 shadow hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 flex">
                          <div className="flex-grow">
                            <div className="flex items-center mb-2 space-x-2">
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {course.category}
                              </Badge>
                              <Badge className="text-xs bg-blue-100/80 text-blue-700 border-blue-200">
                                {course.level}
                              </Badge>
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg mb-2">
                              {course.name}
                            </h3>
                            <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                              {course.description}
                            </p>

                            {/* 显示需要的权限组 */}
                            {course.required_groups &&
                              course.required_groups.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-slate-500">
                                    需要：
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
                              className="bg-gray-300 text-gray-600 cursor-not-allowed border-0"
                              disabled
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              查看
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

      {/* 显示没有课程的提示 */}
      {unlockedCourses.length === 0 &&
        lockedCourses.length === 0 &&
        !loading &&
        !error && (
          <Card className="glass-card border-white/30 shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-slate-700 font-medium mb-2">
                  暂无可用信号策略
                </h3>
                <p className="text-slate-500 text-sm">
                  请稍后再来查看，或联系客服了解详情
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
