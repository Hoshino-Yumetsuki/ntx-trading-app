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
  Star,
  TrendingUp,
  Shield,
  Target
} from 'lucide-react'
import Image from 'next/image' // Import Image component

export function AcademyPage() {
  const courses = [
    {
      title: '机构交易1/3：下跌中何时上涨？',
      description: '识别牛熊拐点、趋势起点、反转信号的底层逻辑',
      duration: '45分钟',
      level: '进阶',
      locked: false,
      category: '趋势分析'
    },
    {
      title: '机构交易2/3：上涨中何时下跌？',
      description: '理解机构视角的行情空间结构转换思维',
      duration: '52分钟',
      level: '进阶',
      locked: false,
      category: '空间转换'
    },
    {
      title: '机构交易3/3：突破点确认与行情延续',
      description: '精准制定买入点、止损点、卖出点，避免追涨杀跌',
      duration: '38分钟',
      level: '高级',
      locked: true,
      category: '操盘模型'
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

  const signalExamples = [
    {
      title: '上涨1+3策略',
      image: '/placeholder.svg?height=150&width=300',
      alt: '上涨1+3策略K线图'
    },
    {
      title: '下跌1+3策略',
      image: '/placeholder.svg?height=150&width=300',
      alt: '下跌1+3策略K线图'
    },
    {
      title: '黑马出世模型',
      image: '/placeholder.svg?height=150&width=300',
      alt: '黑马出世模型K线图'
    },
    {
      title: '强势定价模型',
      image: '/placeholder.svg?height=150&width=300',
      alt: '强势定价模型K线图'
    }
  ]

  return (
    <div className="min-h-screen pb-6">
      {/* Header - Applied rounded-t-full for semi-circular effect */}
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl rounded-t-[999px] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">黑马学院</h1>
            <p className="text-slate-600 text-sm">掌握机构交易思维</p>
          </div>
          <div className="premium-icon w-8 h-8 rounded-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Instructor */}
        <Card className="glass-card border-white/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="glass-card-strong text-slate-700 font-bold">
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
                    className="glass-card text-blue-600 hover:text-blue-700 border-blue-300 bg-blue-50/50"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    @wuk_Bitcoin
                  </Button>
                  <div className="flex items-center text-yellow-600">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              运用机构思维与庄家操盘策略，帮助用户掌握止损止盈、降低交易成本，建立系统化交易决策体系。
            </p>
          </CardContent>
        </Card>

        {/* Core Features */}
        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800">核心课程体系</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 glass-card rounded-lg"
                >
                  <div className="premium-icon w-10 h-10 rounded-lg flex-shrink-0">
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

        {/* Courses */}
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

        {/* Target Audience */}
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

        {/* Institutional Trading Strategy Signal System */}
        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <div className="premium-icon w-8 h-8 rounded-lg mr-3">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              机构操盘策略信号系统
            </CardTitle>
            <p className="text-slate-600 text-sm ml-11">
              基于机构行为的趋势系统+程序化工具，清晰捕捉中期趋势
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <h4 className="text-slate-800 font-semibold mb-3 flex items-center">
              <div className="premium-icon w-6 h-6 rounded mr-2">
                <Star className="w-3 h-3 text-yellow-600" />
              </div>
              信号实例展示
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {signalExamples.map((example, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl overflow-hidden border-white/50"
                >
                  <Image
                    src={example.image || '/placeholder.svg'}
                    alt={example.alt}
                    width={300}
                    height={150}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-4">
                    <h5 className="text-slate-800 font-semibold text-base mb-2">
                      {example.title}
                    </h5>
                    <Badge className="bg-red-100/80 text-red-700 border-red-300">
                      需要学员权限
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="glass-card-strong border-white/50">
          <CardContent className="p-6 text-center">
            <h3 className="gradient-text font-bold text-lg mb-2">
              解锁完整课程
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              程序化辅助工具：学员专属【筛选系统】，落地模型应用
            </p>
            <Button className="diffused-button text-white font-semibold border-0">
              获得机构级策略
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
