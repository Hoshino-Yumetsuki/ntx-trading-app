'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  TrendingUp,
  Zap,
  ArrowRight,
  Target,
  Award,
  GraduationCap,
  BookOpen,
  Brain
} from 'lucide-react'
import Image from 'next/image'
import { SignalCarousel } from '@/src/components/ui/signal-carousel'
import { TutorialPage } from '@/src/components/subpages/tutorial'
import { useLanguage } from '@/src/contexts/language-context'

export function HomePage() {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">NTX</h1>
            <p className="text-slate-600 text-sm">交易即挖矿</p>
          </div>
          <div className="premium-icon w-10 h-10 rounded-full">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        {/* 新手教程大横幅 */}
        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            <Image
              src="/poster1.jpg"
              alt="新手教程"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-purple-600/70" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
              <div className="mb-4">
                <GraduationCap className="w-16 h-16 text-white mx-auto mb-4" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t('home.tutorial.title')}
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-md">
                {t('home.tutorial.subtitle')}
              </p>
              <Button
                onClick={openTutorial}
                className="bg-white text-blue-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
              >
                {t('home.tutorial.button')}{' '}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SignalCarousel />

      <div className="px-6 space-y-4">
        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  {t('home.card.tutorial.title')}
                </h3>
                <p className="text-slate-600 text-sm">
                  {t('home.card.tutorial.subtitle')}
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              {t('home.card.tutorial.desc')}
            </p>
            <Button size="sm" className="diffused-button text-white border-0">
              {t('home.card.tutorial.button')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  {t('home.card.ai.title')}
                </h3>
                <p className="text-slate-600 text-sm">
                  {t('home.card.ai.subtitle')}
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              {t('home.card.ai.desc')}
            </p>
            <Button size="sm" className="diffused-button text-white border-0">
              {t('home.card.ai.button')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  {t('home.card.mining.title')}
                </h3>
                <p className="text-slate-600 text-sm">
                  {t('home.card.mining.subtitle')}
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {t('home.card.mining.desc')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  机构策略
                </h3>
                <p className="text-slate-600 text-sm">掌握机构交易思维</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              学习专业交易策略，提升交易胜率和纪律性
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  持续回报
                </h3>
                <p className="text-slate-600 text-sm">让每一笔交易永远有回报</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              建立长期收益模式，实现财富稳定增长
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
