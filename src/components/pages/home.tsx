'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import { TrendingUp, ArrowRight, Target, Award, Brain } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { TutorialPage } from '@/src/components/pages/tutorial'
import { useLanguage } from '@/src/contexts/language-context'
import { AutoScaleBox } from '@/src/components/ui/auto-scale-box'
import { API_BASE_URL } from '@/src/services/config'
import { useAuth } from '@/src/contexts/AuthContext'
import { getUserExchanges } from '@/src/services/mining'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'

interface NewsItem {
  id: number
  title: string
}

interface HomePageProps {
  onNavigate?: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const [_isTutorialOpen, _setIsTutorialOpen] = useState(false)
  const [showTutorialPage, setShowTutorialPage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()
  const { token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [recentNews, setRecentNews] = useState<NewsItem[]>([])
  const [hasBindedExchange, setHasBindedExchange] = useState<boolean | null>(
    null
  )
  const [showBindDialog, setShowBindDialog] = useState(false)

  useEffect(() => {
    const fetchApiNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          setRecentNews(data.slice(0, 3))
        } else {
          console.error('Failed to fetch API news')
        }
      } catch (error) {
        console.error('Error fetching API news:', error)
      }
    }

    fetchApiNews()
  }, [])

  // 检查用户是否已绑定交易所
  useEffect(() => {
    const checkUserExchanges = async () => {
      if (!token || !isAuthenticated) {
        setHasBindedExchange(false)
        return
      }

      try {
        const userExchanges = await getUserExchanges(token)
        setHasBindedExchange(userExchanges && userExchanges.length > 0)
      } catch (error) {
        console.error('获取用户交易所绑定状态失败:', error)
        setHasBindedExchange(false)
      }
    }

    checkUserExchanges()
  }, [token, isAuthenticated])

  const exchanges = [
    {
      name: '1',
      image: '/exchange/binance.png'
    },
    {
      name: '2',
      image: '/exchange/htx.jpg'
    },
    {
      name: '3',
      image: '/exchange/bybit.jpg'
    },
    {
      name: '4',
      image: '/exchange/gate.png'
    },
    {
      name: '5',
      image: '/exchange/bitget.png'
    },
    {
      name: '6',
      image: '/exchange/okex.png'
    }
    ,{
      name: '7',
      image: '/exchange/okx.png'
    },{
      name: '8',
      image: '/exchange/hotcoin.png'
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

  // 双横幅（仅图片，可滚动）
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
  const goBroker = () => onNavigate?.('broker')
  const banners = [
    { src: '/p01.png', alt: '新手教程', onClick: () => openTutorial() },
    { src: '/p00.png', alt: '成为经济商', onClick: goBroker }
  ]

  // 指示点与自动轮播
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      try {
        emblaApi.off?.('select', onSelect)
      } catch {}
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const id = setInterval(() => {
      if (!paused) emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(id)
  }, [emblaApi, paused])

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
          {/* 大横幅（可滚动，整图点击） */}
          <div className="relative z-10">
            <section
              className="overflow-hidden"
              ref={emblaRef}
              aria-label="首页横幅轮播"
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
            >
              <div className="flex">
                {banners.map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={b.onClick}
                    className="relative flex-[0_0_100%] min-w-0 w-full rounded-2xl overflow-hidden"
                    style={{ aspectRatio: '702 / 350' }}
                  >
                    <Image
                      src={b.src}
                      alt={b.alt}
                      fill
                      className="object-contain"
                      priority={i === 0}
                    />
                  </button>
                ))}
              </div>
            </section>
            {/* 指示点 */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`切换到横幅 ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    selectedIndex === i
                      ? 'w-6 bg-blue-600'
                      : 'w-2.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 立刻开赚交易所卡片 */}
        <div className="mt-6 mb-6 bg-white rounded-xl shadow-sm">
          <div className="p-4">
            {/* 居中显示的标题 */}
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold text-slate-800">已接入</h3>
            </div>

            {/* 交易所图标横向无缝滚动 */}
            <div className="marquee h-[7.5rem] md:h-[8.5rem]">
              <div
                className="marquee-track gap-0"
                style={{ animationDuration: '18s' }}
              >
                {/* 第1组：上下两行 */}
                <div className="flex flex-col gap-1 flex-none">
                  <div className="flex items-center gap-1">
                    {[...topRow, ...topRow, ...topRow].map((exchange, idx) => (
                      <div
                        key={`g1-top-${exchange.name}-${idx}`}
                        className="w-[3.25rem] h-[3.25rem] md:w-[3.5rem] md:h-[3.5rem] shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-1 w-full h-full">
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
                  <div className="flex items-center gap-1">
                    {[...bottomRow, ...bottomRow, ...bottomRow].map(
                      (exchange, idx) => (
                        <div
                          key={`g1-bottom-${exchange.name}-${idx}`}
                          className="w-[3.25rem] h-[3.25rem] md:w-[3.5rem] md:h-[3.5rem] shrink-0"
                        >
                          <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-1 w-full h-full">
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
                      )
                    )}
                  </div>
                </div>
                {/* 第2组：镜像用于无缝循环 */}
                <div
                  className="flex flex-col gap-1 flex-none"
                  aria-hidden="true"
                >
                  <div className="flex items-center gap-1">
                    {[...topRow, ...topRow, ...topRow].map((exchange, idx) => (
                      <div
                        key={`g2-top-${exchange.name}-${idx}`}
                        className="w-[3.25rem] h-[3.25rem] md:w-[3.5rem] md:h-[3.5rem] shrink-0"
                      >
                        <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-1 w-full h-full">
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
                  <div className="flex items-center gap-1">
                    {[...bottomRow, ...bottomRow, ...bottomRow].map(
                      (exchange, idx) => (
                        <div
                          key={`g2-bottom-${exchange.name}-${idx}`}
                          className="w-[3.25rem] h-[3.25rem] md:w-[3.5rem] md:h-[3.5rem] shrink-0"
                        >
                          <div className="bg-white/40 rounded-lg shadow-sm flex items-center justify-center p-1 w-full h-full">
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
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 添加蓝色按钮 */}
            <div className="mt-5 text-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('请先登录')
                    return
                  }

                  if (hasBindedExchange === false) {
                    setShowBindDialog(true)
                  } else {
                    onNavigate?.('mining')
                  }
                }}
              >
                绑定交易所，立刻开赚
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-x-2 mb-3">
              <Image
                src="/tur.png"
                alt="新手礼包图标"
                width={15}
                height={15}
                className="w-[15px] h-[15px]"
              />
              <h3 className="text-slate-800 font-semibold text-base">
                {t('home.card.tutorial.title')}
              </h3>
            </div>

            <p className="text-slate-500 text-sm mb-3">
              {t('home.card.tutorial.subtitle')}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-[244px]">
              {t('home.card.tutorial.desc')}
            </p>
            <Button
              onClick={() =>
                window.open(
                  'https://gcnyd94jf9o6.feishu.cn/wiki/VPSwwv9nNiia7ikbMUNcbFkRnah',
                  '_blank'
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-md h-8"
            >
              {t('home.card.tutorial.button')}
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-x-2 mb-3">
              <Image
                src="/dh.png"
                alt="学习资源图标"
                width={15}
                height={15}
                className="w-[15px] h-[15px]"
              />
              <h3 className="text-slate-800 font-semibold text-base">
                {t('home.card.dark_horse.title')}
              </h3>
            </div>

            <p className="text-slate-500 text-sm mb-3">
              {t('home.card.dark_horse.subtitle')}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-[244px]">
              {t('home.card.dark_horse.desc')}
            </p>
            <Button
              onClick={() => onNavigate?.('academy')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-md h-8"
            >
              {t('home.card.dark_horse.button')}
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 四个功能卡片（长方形 2x2，所有屏幕保持两列） */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
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

          <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600 -ml-0.5" />
                      {t('home.card.yinliu.title')}
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      {t('home.card.yinliu.subtitle')}
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      {t('home.card.yinliu.desc')}
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
            <CardContent className="p-4 h-full">
              <AutoScaleBox className="h-full w-full">
                <div className="flex flex-row items-center text-left h-full gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-lg mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600 -ml-0.5" />
                      {t('home.card.huibao.title')}
                    </h3>
                    <p className="text-slate-600 text-xs break-words">
                      {t('home.card.huibao.subtitle')}
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed mt-1 break-words">
                      {t('home.card.huibao.desc')}
                    </p>
                  </div>
                </div>
              </AutoScaleBox>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
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
        </div>

        {/* 最近通知 */}
        <Card className="rounded-[20px] bg-white/80 shadow-lg w-full">
          <CardContent className="p-4">
            <h3 className="text-slate-800 font-semibold text-base mb-3">
              {t('ui.notifications.title')}
            </h3>
            <ul className="space-y-2">
              {recentNews.map((item) => (
                <li key={item.id} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                  <button
                    type="button"
                    aria-label={`查看文章 ${item.title}`}
                    className="text-slate-700 text-sm text-left truncate hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    onClick={() => {
                      router.push(`/?tab=notifications&news=${item.id}`)
                      onNavigate?.('notifications')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/?tab=notifications&news=${item.id}`)
                        onNavigate?.('notifications')
                      }
                    }}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 mt-3"
              onClick={() => onNavigate?.('notifications')}
            >
              {t('ui.notifications.viewMore')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 未绑定交易所提示对话框 */}
      <Dialog open={showBindDialog} onOpenChange={setShowBindDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>需要绑定交易所</DialogTitle>
            <DialogDescription>
              您需要先绑定交易所 UID 才能开始挖矿。请前往挖矿页面完成绑定。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBindDialog(false)}>
              稍后再说
            </Button>
            <Button
              onClick={() => {
                setShowBindDialog(false)
                onNavigate?.('mining')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              前往绑定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
