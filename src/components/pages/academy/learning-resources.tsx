'use client'

import { useState, useEffect } from 'react'
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

export function LearningResourcesPage() {
  const [unlockedCourses, setUnlockedCourses] = useState<Course[]>([])
  const [lockedCourses, setLockedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [_isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const allCoursesData = await getAllCourses()

        // Process courses to separate unlocked and locked, filter for articles only
        const { unlockedCourses, lockedCourses } = processCourses(
          allCoursesData,
          'article'
        )

        setUnlockedCourses(unlockedCourses)
        setLockedCourses(lockedCourses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setError('获取课程失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const features = [
    {
      icon: TrendingUp,
      title: '趋势底层逻辑',
      description: '识别牛熊拐点、趋势起点、反转信号'
    },
    {
      icon: Target,
      title: '机构操盘模型',
      description: '精准制定买入点、止损点、卖出点'
    },
    {
      icon: Shield,
      title: '仓位+风控模型',
      description: '科学资金管理，建立小亏大赚概率优势'
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-blue-300 ring-offset-2 ring-offset-blue-50">
              <AvatarImage src="_nze4inj_400x400.jpg" />
              <AvatarFallback className="glass-card-strong bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold">
                DT
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-slate-800 font-bold text-lg">Donato狐总</h3>
              <p className="text-slate-600 text-sm mb-2">
                WEB3职业交易员 · 数十年量化交易经验
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                  onClick={() =>
                    window.open(
                      'https://space.bilibili.com/1992476317',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  关注
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <p className="text-slate-700 text-sm leading-relaxed">
              专注于机构级交易策略研究，擅长趋势交易和风险控制。通过系统化的交易方法论，帮助交易者建立稳定盈利的交易体系。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/50 shadow-md">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
              <GraduationCap className="w-5 h-5" />
            </span>
            核心课程体系
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
                <div className="premium-icon w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200">
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
          <span className="ml-2 text-slate-600">加载课程中...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50"
          >
            重试
          </Button>
        </div>
      ) : (
        <>
          {/* Unlocked courses section */}
          {unlockedCourses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-slate-800 text-xl font-bold flex items-center">
                <span className="bg-green-100 text-green-600 p-1 rounded-md mr-2">
                  <Play className="w-5 h-5" />
                </span>
                我的课程
              </h2>
              {unlockedCourses.map((course, index) => (
                <Card
                  key={index}
                  className="glass-card border-white/30 border-l-4 border-l-green-400"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="text-xs bg-purple-100/80 text-purple-700 border-purple-200">
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
                        <Button
                          size="sm"
                          className="glass-card text-green-600 hover:text-green-700 border-green-300 bg-green-50/50"
                          onClick={() =>
                            window.open(
                              course.videoUrl || '#',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          <Play className="w-4 h-4 mr-1" />
                          学习
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Locked courses section */}
          {lockedCourses.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-slate-800 text-xl font-bold flex items-center">
                <span className="bg-orange-100 text-orange-600 p-1 rounded-md mr-2">
                  <Lock className="w-5 h-5" />
                </span>
                待解锁课程
              </h2>
              {lockedCourses.map((course, index) => (
                <Card key={index} className="glass-card border-white/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="text-xs bg-purple-100/80 text-purple-700 border-purple-200">
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

                        {/* Display required permission groups */}
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
                          <Play className="w-4 h-4 mr-1" />
                          学习
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Show message when no courses available */}
          {unlockedCourses.length === 0 && lockedCourses.length === 0 && (
            <div className="text-center p-8">
              <p className="text-slate-600">暂无课程可显示</p>
            </div>
          )}

          {/* Login prompt removed */}
        </>
      )}

      <Card className="glass-card border-white/30">
        <CardHeader>
          <CardTitle className="text-slate-800">适用对象</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              具备技术分析基础，想落地交易系统的操盘者
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              有策略框架但执行效率低、选币耗时的交易员
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-slate-700 text-sm">
              具备趋势交易思维，想提升胜率与纪律性的进阶用户
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
