'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { BannerCard } from '@/src/components/ui/banner-card'
import {
  TrendingUp,
  ArrowRight,
  Target,
  Award,
  BookOpen,
  Brain,
  GraduationCap
} from 'lucide-react'
import Image from 'next/image'
import { TutorialPage } from '@/src/components/pages/subpages/tutorial'
import { useLanguage } from '@/src/contexts/language-context'

interface HomePageProps {
  onNavigate?: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const [_isTutorialOpen, _setIsTutorialOpen] = useState(false)
  const [showTutorialPage, setShowTutorialPage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()

  // 从 localStorage 恢复教程页面状态
  useEffect(() => {
    const savedTutorialState = localStorage.getItem('ntx-show-tutorial')
    if (savedTutorialState === 'true') {
      setShowTutorialPage(true)
    }
    setIsInitialized(true)
  }, [])

  // 保存教程页面状态到 localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('ntx-show-tutorial', showTutorialPage.toString())
    }
  }, [showTutorialPage, isInitialized])

  const openTutorial = () => {
    setShowTutorialPage(true)
  }

  const backToHome = () => {
    setShowTutorialPage(false)
  }

  // 如果显示教程页面，渲染教程页面
  if (showTutorialPage) {
    return <TutorialPage onBack={backToHome} />
  }

  return (
    <div className="min-h-screen">
      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-0.5">NTX</h1>
          <p className="text-slate-800 text-xl font-medium">Web 3 一站式服务</p>
        </div>
        {/* 新手教程大横幅 */}
        <BannerCard
          title={t('home.tutorial.title')}
          subtitle={t('home.tutorial.subtitle')}
          buttonText={t('home.tutorial.button')}
          backgroundImage="/poster1.jpg"
          onClick={openTutorial}
        />

        {/* 立刻开赚交易所卡片 */}
        <div className="mt-6 mb-6 bg-white rounded-xl shadow-sm">
          <div className="p-6">
            {/* 居中显示的标题 */}
            <div className="text-center mb-5">
              <h3 className="text-lg font-semibold text-slate-800">已接入</h3>
            </div>

            {/* 交易所图标显示 - 只展示三个 */}
            <div className="flex justify-center pb-2 pt-1">
              {[
                { name: 'Binance', image: '/exchange/binance.png' },
                { name: 'BitGet', image: '/exchange/bitget.png' },
                { name: 'Bybit', image: '/exchange/bybit.jpg' }
              ].map((exchange) => (
                <div key={exchange.name} className="px-2 flex-1 max-w-[100px]">
                  <div className="aspect-square bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-3">
                    <div className="relative w-full h-full">
                      <Image
                        src={exchange.image}
                        alt={exchange.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 添加蓝色按钮 */}
            <div className="mt-5 text-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md"
                onClick={() => onNavigate?.('mining')}
              >
                绑定交易所，立刻开赚
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <Card className="glass-card border-white/50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="premium-icon w-14 h-14 rounded-xl mb-4">
              <BookOpen className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h3 className="text-slate-800 font-semibold text-xl mb-2">
                新手礼包
              </h3>
              <p className="text-slate-600 text-sm mb-3">学习行业基础知识</p>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              系统性学习数字货币交易知识，掌握基础概念和交易技巧
            </p>
            <Button
              onClick={openTutorial}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md w-fit"
            >
              立刻学习
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="premium-icon w-14 h-14 rounded-xl mb-4">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-slate-800 font-semibold text-xl mb-2">
                黑马学院
              </h3>
              <p className="text-slate-600 text-sm mb-3">专业技术教学</p>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              学习专业技术策略，提升分析水平与交易能力
            </p>
            <Button
              onClick={() => onNavigate?.('academy')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md w-fit"
            >
              立即进入
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* 以 2x2 方式排列四个正方形卡片 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="glass-card border-white/50 aspect-square">
            <CardContent className="p-4 flex flex-col items-center text-center justify-between h-full">
              <div className="premium-icon w-12 h-12 rounded-xl mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="mb-auto">
                <h3 className="text-slate-800 font-semibold text-lg mb-1">
                  {t('home.card.mining.title')}
                </h3>
                <p className="text-slate-600 text-xs">
                  {t('home.card.mining.subtitle')}
                </p>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed mt-2">
                {t('home.card.mining.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 aspect-square">
            <CardContent className="p-4 flex flex-col items-center text-center justify-between h-full">
              <div className="premium-icon w-12 h-12 rounded-xl mb-3">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="mb-auto">
                <h3 className="text-slate-800 font-semibold text-lg mb-1">
                  {t('home.card.ai.title')}
                </h3>
                <p className="text-slate-600 text-xs">
                  {t('home.card.ai.subtitle')}
                </p>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed mt-2">
                {t('home.card.ai.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 aspect-square">
            <CardContent className="p-4 flex flex-col items-center text-center justify-between h-full">
              <div className="premium-icon w-12 h-12 rounded-xl mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mb-auto">
                <h3 className="text-slate-800 font-semibold text-lg mb-1">
                  机构策略
                </h3>
                <p className="text-slate-600 text-xs">掌握机构交易思维</p>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed mt-2">
                学习专业交易策略，提升交易胜率
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 aspect-square">
            <CardContent className="p-4 flex flex-col items-center text-center justify-between h-full">
              <div className="premium-icon w-12 h-12 rounded-xl mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mb-auto">
                <h3 className="text-slate-800 font-semibold text-lg mb-1">
                  持续回报
                </h3>
                <p className="text-slate-600 text-xs">让每一笔交易有回报</p>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed mt-2">
                建立长期收益模式，实现财富增长
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
