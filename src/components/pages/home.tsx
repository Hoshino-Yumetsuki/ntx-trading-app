'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { BannerCard } from '@/src/components/ui/banner-card'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
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
import { TutorialPage } from '@/src/components/pages/tutorial'
import { useLanguage } from '@/src/contexts/language-context'
import { getRecentNews, newsItems } from '@/src/data/news-data'
import { AutoScaleBox } from '@/src/components/ui/auto-scale-box'

interface HomePageProps {
  onNavigate?: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const [_isTutorialOpen, _setIsTutorialOpen] = useState(false)
  const [showTutorialPage, setShowTutorialPage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()
  const [showAllNews, setShowAllNews] = useState(false)
  const latestNews = showAllNews ? newsItems : getRecentNews(3)
  // 首页交易所图标（用于横向无缝滚动）
  const exchanges = [
    {
      name: '1',
      image:
        '/exchange/FigmaDDSSlicePNG4dec3c6f1a0591399bbfdd0c072958f2_logo_1.png'
    },
    {
      name: '2',
      image:
        '/exchange/FigmaDDSSlicePNG4dec3c6f1a0591399bbfdd0c072958f2_logo_2.png'
    },
    {
      name: '3',
      image:
        '/exchange/FigmaDDSSlicePNG4dec3c6f1a0591399bbfdd0c072958f2_logo_3.png'
    },
    {
      name: '4',
      image:
        '/exchange/FigmaDDSSlicePNGfe92bcfcf509cf83dab07b63b5c6eb40_logo_1.png'
    },
    {
      name: '5',
      image:
        '/exchange/FigmaDDSSlicePNGfe92bcfcf509cf83dab07b63b5c6eb40_logo_2.png'
    },
    {
      name: '6',
      image:
        '/exchange/FigmaDDSSlicePNGfe92bcfcf509cf83dab07b63b5c6eb40_logo_3.png'
    }
  ]
  const half = Math.ceil(exchanges.length / 2)
  const topRow = exchanges.slice(0, half)
  const bottomRow = exchanges.slice(half)

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
    <div className="min-h-screen relative">
      {/* 背景装饰图片（平分高度，居于各自 1/3、2/3、3/3 的中心） */}
      <Image
        src="/FigmaDDSSlicePNG073d40ed32eb293f261f340b011653b3.png"
        alt=""
        aria-hidden="true"
        width={112}
        height={120}
        className="absolute -z-10 pointer-events-none select-none"
        style={{ left: -20, top: '16.6667%', transform: 'translateY(-50%)' }}
      />
      <Image
        src="/FigmaDDSSlicePNGdf68e4790d973f6ba8dd73779c028ed4.png"
        alt=""
        aria-hidden="true"
        width={174}
        height={174}
        className="absolute -z-10 pointer-events-none select-none"
        style={{ left: 282, top: '33.3333%', transform: 'translateY(-50%)' }}
      />
      <Image
        src="/FigmaDDSSlicePNG89310c4605f81ae570df5b14121e66db.png"
        alt=""
        aria-hidden="true"
        width={171}
        height={171}
        className="absolute -z-10 pointer-events-none select-none"
        style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
      />
      <div className="px-6 pt-8 pb-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex flex-col">
              <div className="relative mb-0.5 w-28 h-9 md:w-32 md:h-10">
                <Image
                  src="/Frame17@3x.png"
                  alt="NTX Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-slate-800 text-xl font-medium">
                Web3 一站式服务
              </p>
            </div>
            <LanguageSwitcher />
          </div>
          {/* 新手教程大横幅 */}
          <div className="relative z-10">
            <BannerCard
              title={t('home.tutorial.title')}
              subtitle={t('home.tutorial.subtitle')}
              buttonText={t('home.tutorial.button')}
              backgroundImage="/Group34394@3x.png"
              onClick={openTutorial}
            />
          </div>
        </div>

        {/* 立刻开赚交易所卡片 */}
        <div className="mt-6 mb-6 bg-white rounded-xl shadow-sm">
          <div className="p-6">
            {/* 居中显示的标题 */}
            <div className="text-center mb-5">
              <h3 className="text-lg font-semibold text-slate-800">已接入</h3>
            </div>

            {/* 交易所图标横向无缝滚动 */}
            <div className="marquee h-[13rem] md:h-[15rem]">
              <div
                className="marquee-track gap-8"
                style={{ animationDuration: '18s', alignItems: 'flex-start' }}
              >
                {/* 第1组：上下两行 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {topRow.map((exchange, idx) => (
                      <div
                        key={`g1-top-${exchange.name}-${idx}`}
                        className="w-24 h-24 md:w-28 md:h-28 shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-3 w-full h-full">
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
                  <div className="flex items-center gap-3">
                    {bottomRow.map((exchange, idx) => (
                      <div
                        key={`g1-bottom-${exchange.name}-${idx}`}
                        className="w-24 h-24 md:w-28 md:h-28 shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-3 w-full h-full">
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
                </div>
                {/* 第2组：镜像用于无缝循环 */}
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <div className="flex items-center gap-3">
                    {topRow.map((exchange, idx) => (
                      <div
                        key={`g2-top-${exchange.name}-${idx}`}
                        className="w-24 h-24 md:w-28 md:h-28 shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-3 w-full h-full">
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
                  <div className="flex items-center gap-3">
                    {bottomRow.map((exchange, idx) => (
                      <div
                        key={`g2-bottom-${exchange.name}-${idx}`}
                        className="w-24 h-24 md:w-28 md:h-28 shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-3 w-full h-full">
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
                </div>
              </div>
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

        {/* 四个功能卡片（长方形 2x2，所有屏幕保持两列） */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="glass-card border-white/50 h-32">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 -ml-0.5" />
                      {t('home.card.mining.title')}
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      {t('home.card.mining.subtitle')}
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      {t('home.card.mining.desc')}
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 h-32">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600 -ml-0.5" />
                      {t('home.card.ai.title')}
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      {t('home.card.ai.subtitle')}
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      {t('home.card.ai.desc')}
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 h-32">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600 -ml-0.5" />
                      机构策略
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      掌握机构交易思维
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      学习专业交易策略，提升交易胜率
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/50 h-32">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600 -ml-0.5" />
                      持续回报
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      让每一笔交易有回报
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      建立长期收益模式，实现财富增长
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>
        </div>

        {/* 最新通知 */}
        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 font-semibold text-lg">最新通知</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllNews((v) => !v)}
                className="text-slate-600 hover:text-slate-800"
              >
                {showAllNews ? '收起' : '查看更多'}
              </Button>
            </div>
            <div className="space-y-3">
              {latestNews.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm"
                >
                  <div className="text-slate-800 text-sm font-medium line-clamp-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {item.date} {item.time} · {item.category ?? '通知'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
