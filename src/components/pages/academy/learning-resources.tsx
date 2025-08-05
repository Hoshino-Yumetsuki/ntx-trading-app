'use client'

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
  Target
} from 'lucide-react'

export function LearningResourcesPage() {
  const courses = [
    {
      title: 'K线形态与多周期信号综合系统',
      description:
        '掌握机构操盘信号识别方法，学习三种顶级K线形态判断和最佳入场时机把握，配合多周期统一判断方法形成完整交易体系。',
      duration: '课时：12课时 | 总时长：3小时15分钟',
      level: '进阶',
      locked: false,
      category: '技术分析',
      videoUrl: 'https://www.bilibili.com/video/BV14gycYwEVT/'
    },
    {
      title: '波段交易完整实战指南',
      description:
        '从实战角度讲解如何利用高低点序列确认趋势周期，掌握适合市场不同阶段的交易策略，建立规范化的风控和资金管理系统。',
      duration: '课时：16课时 | 总时长：4小时40分钟',
      level: '进阶',
      locked: false,
      category: '交易策略',
      videoUrl: 'https://www.bilibili.com/video/BV1quNbzqEuE/'
    },
    {
      title: '交易心理学与行为金融',
      description:
        '分析交易者常见心理偏差，教您控制恐惧与贪婪情绪，建立科学交易日志系统，实现交易心态与技术的良性循环。',
      duration: '课时：8课时 | 总时长：2小时20分钟',
      level: '基础',
      locked: false,
      category: '心理建设',
      videoUrl: 'https://www.bilibili.com/video/BV1UFNqz1E9a/'
    }
  ]

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

      <div className="space-y-4">
        <h2 className="text-slate-800 text-xl font-bold">学习资源</h2>
        {courses.map((course, index) => (
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
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-slate-500 text-xs">{course.duration}</p>
                </div>
                <div className="ml-4">
                  {course.locked ? (
                    <Button
                      size="sm"
                      className="diffused-button text-white border-0"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      解锁
                    </Button>
                  ) : (
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
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
