'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import {
  BookOpen,
  TrendingUp,
  Target,
  Lock,
  ArrowLeft
} from 'lucide-react'
import { LearningResourcesPage } from './academy/learning-resources'
import { BlackHorseModelPage } from './academy/black-horse-model'
import { StrategySignalsPage } from './academy/strategy-signals'
import { UnlockCoursesPage } from './academy/unlock-courses'

export function AcademyPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const tabs = [
    {
      id: 'learning',
      title: '学习资源',
      icon: BookOpen,
      component: LearningResourcesPage
    },
    {
      id: 'model',
      title: '黑马模型',
      icon: TrendingUp,
      component: BlackHorseModelPage
    },
    {
      id: 'signals',
      title: '策略信号',
      icon: Target,
      component: StrategySignalsPage
    },
    {
      id: 'unlock',
      title: '解锁课程',
      icon: Lock,
      component: UnlockCoursesPage
    }
  ]

  const handleBack = () => {
    setActiveTab(null)
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component
  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  // 如果选择了某个tab，显示子页面
  if (activeTab && ActiveComponent) {
    return (
      <div className="min-h-screen pb-6">
        <div className="px-6 pt-12 pb-8 relative z-10">
          <div className="flex items-start mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-3 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <div className="flex-1">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {activeTabData?.title}
                </h1>
                <p className="text-slate-600 text-sm">掌握机构交易思维</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <ActiveComponent />
        </div>
      </div>
    )
  }

  // 主页面：显示四个正方形按钮
  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">黑马学院</h1>
            <p className="text-slate-600 text-sm">掌握机构交易思维</p>
          </div>
        </div>
      </div>

      {/* 学习资源卡片 */}
      <div className="px-6 mt-6">
        <Card className="glass-card border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              学习资源
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Card
                    key={tab.id}
                    className="glass-card border-white/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <CardContent className="p-4 aspect-square flex flex-col items-center justify-center text-center space-y-2">
                      <div className="premium-icon w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-slate-800 font-medium text-sm group-hover:text-blue-700 transition-colors">
                        {tab.title}
                      </h3>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* LOOP 社区卡片 */}
        <Card className="glass-card border-white/30 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              LOOP 社区
            </CardTitle>
            <p className="text-slate-600 text-sm mt-1">频道列表</p>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {/* 四个空的频道卡片 */}
              {[1, 2, 3, 4].map((index) => (
                <Card
                  key={index}
                  className="glass-card border-white/30 hover:shadow-lg transition-all duration-200 cursor-pointer group opacity-50"
                >
                  <CardContent className="p-4 aspect-square flex flex-col items-center justify-center text-center space-y-2">
                    <div className="premium-icon w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="w-5 h-5 bg-gray-400 rounded"></div>
                    </div>
                    <h3 className="text-slate-400 font-medium text-sm">
                      频道 {index}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
