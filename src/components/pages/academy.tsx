'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  BookOpen,
  Target,
  Lock,
  ArrowLeft,
  Users,
  ChevronRight,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { LearningResourcesPage } from './academy/learning-resources'
import { StrategySignalsPage } from './academy/strategy-signals'
import { OrdersPage } from './academy/orders'
import { LoopCommunitiesPage } from './academy/loop-communities'
import type { Course } from '@/src/types/course'
import { getAllCourses } from '@/src/services/courseService'
import { processCourses } from '@/src/utils/courseUtils'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'
import Image from 'next/image'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import { UnlockCoursesPage } from './academy/unlock-courses'
import { BlackHorseModelPage } from './academy/black-horse-model'

export function AcademyPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [communities, setCommunities] = useState<Course[]>([])
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const [communityError, setCommunityError] = useState('')
  const [viewingCommunity, setViewingCommunity] = useState<Course | null>(null)
  const [isReading, setIsReading] = useState(false)

  const tabs = [
    {
      id: 'model',
      title: '黑马模型',
      icon: BookOpen,
      component: LearningResourcesPage
    },
    {
      id: 'learning',
      title: '学习资源',
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
      id: 'loop',
      title: '直播',
      icon: Users,
      component: LoopCommunitiesPage
    },
    {
      id: 'unlock',
      title: '解锁课程',
      icon: Lock,
      component: UnlockCoursesPage
    },
    {
      id: 'orders',
      title: '我的订单',
      icon: Lock,
      component: OrdersPage
    }
  ]

  // 获取社区数据
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoadingCommunities(true)
        setCommunityError('')
        const data = await getAllCourses()
        const { unlockedCourses } = processCourses(data, 'loop_comm')
        setCommunities(unlockedCourses)
      } catch (error) {
        console.error('Failed to fetch communities:', error)
        setCommunityError('获取社区数据失败，请稍后再试')
      } finally {
        setLoadingCommunities(false)
      }
    }

    fetchCommunities()
  }, [])

  // 点击社区卡片：优先跳转外链；无 link 时以 Markdown 形式展示内容
  const handleCommunityClick = (community: Course) => {
    if (community.link) {
      window.open(community.link, '_blank', 'noopener,noreferrer')
    } else if (community.content) {
      setViewingCommunity(community)
    }
  }

  const handleBack = () => {
    setActiveTab(null)
    setIsReading(false)
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component
  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  // 独立阅读视图：当社区只有内容时进入
  if (viewingCommunity?.content) {
    return (
      <AcademyMarkdownReader
        title={viewingCommunity.name}
        content={viewingCommunity.content}
        onBack={() => setViewingCommunity(null)}
      />
    )
  }

  // 如果选择了某个tab，显示子页面
  if (activeTab && ActiveComponent) {
    return (
      <div className="min-h-screen pb-6">
        {!isReading && (
          <div className="px-4 pt-12 pb-8 relative z-10">
            <div className="flex flex-col mb-6">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-3 text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> 返回
                </Button>
                <div className="relative w-28 h-9 md:w-32 md:h-10">
                  <Image
                    src="/Frame17@3x.png"
                    alt="NTX Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-blue-600 mt-3">
                {activeTabData?.title}
              </h1>
              <p className="text-slate-600 text-sm">
                {activeTab === 'orders'
                  ? '查看课程购买与支付状态'
                  : '掌握机构交易思维'}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 mt-6">
          {(() => {
            const Comp: any = ActiveComponent
            return (
              <Comp
                onReadingChange={setIsReading}
                onNavigateTab={(tabId: string) => setActiveTab(tabId)}
              />
            )
          })()}
        </div>
      </div>
    )
  }

  // 主页面：显示四个正方形按钮
  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-8 pb-6">
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
              <div className="text-2xl font-bold mb-1">学习资源</div>
              <div className="opacity-90">掌握机构交易思维</div>
            </div>
          </div>
        </div>
      </div>

      {/* 学习资源入口（标题+四宫格） */}
      <div className="px-4 mt-6">
        <h2 className="text-slate-800 text-xl font-bold mb-3">交易研究院</h2>
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {tabs
            .filter(
              (tab) =>
                !['loop', 'orders', 'unlock', 'learning'].includes(tab.id)
            )
            .map((tab) => {
              const Icon = tab.icon
              return (
                <Card
                  key={tab.id}
                  className="data-card p-4 rounded-xl text-left cursor-pointer transition-shadow hover:shadow-lg group"
                  style={{
                    border: 'none',
                    aspectRatio: '4 / 3',
                    backgroundImage: 'url(/Group69@3x.png)', // 应用参考范例的背景图
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right top',
                    backgroundSize: '40%',
                    backgroundColor: 'white' // 建议添加背景色
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center space-y-2">
                    <div
                      className="premium-icon rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200 flex items-center justify-center"
                      style={{ width: '40%', aspectRatio: '1 / 1' }}
                    >
                      <Icon
                        className="text-blue-600"
                        style={{ width: '75%', height: '75%' }}
                      />
                    </div>
                    <h3
                      className="text-slate-800 font-medium group-hover:text-blue-700 transition-colors"
                      style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}
                    >
                      {tab.title}
                    </h3>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* 直播（原 LOOP 社区） */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-slate-800 text-xl font-bold">直播</h2>
            <p className="text-slate-600 text-sm mt-1">
              加入社区，一起讨论学习
            </p>
          </div>
          {communities.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 text-xs flex items-center h-6 -mt-1 px-2 py-0"
              onClick={() => setActiveTab('loop')}
            >
              更多 <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        <div className="mt-3">
          {loadingCommunities ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">加载社区中...</span>
            </div>
          ) : communityError ? (
            <div className="text-center py-6">
              <p className="text-red-500">{communityError}</p>
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600">暂无社区可显示</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-w-screen-sm mx-auto">
              {communities.slice(0, 4).map((community) => (
                <Card
                  key={community.id}
                  className="data-card rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  style={{
                    aspectRatio: '6 / 7',
                    border: 'none',
                    backgroundImage: 'url(/Group69@3x.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right top',
                    backgroundSize: '40%',
                    backgroundColor: 'white'
                  }}
                  onClick={() => handleCommunityClick(community)}
                >
                  <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                    <div className="premium-icon w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200 mb-3">
                      {community.image ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                          <Image
                            src={community.image}
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Users className="w-7 h-7 text-blue-600" />
                      )}
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
          )}
        </div>
        {/* 直播外跳提示 */}
        <p className="mt-2 text-right text-[11px] italic text-slate-500">
          *直播社区将要跳转到第三方平台
        </p>
      </div>
    </div>
  )
}

// Markdown 内容弹窗（主页面）
// 放在文件末尾不会渲染。需要在组件内部。将其插入到主页面返回的 JSX 中。
