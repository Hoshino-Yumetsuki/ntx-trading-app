'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import Image from 'next/image'
import { Clock, Rss, Share2, ChevronLeft } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from '@/src/hooks/use-toast'
import { UserService } from '@/src/services/user'
import { API_BASE_URL } from '@/src/services/config'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import Parser from 'rss-parser'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useNewsImageGenerator } from './news/news-image-generator'
import '@/src/styles/markdown.css'
import { useRouter, useSearchParams } from 'next/navigation'

interface NewsItem {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  modifyDate: string
  isDisplayed: boolean
  content?: string
  source?: string // 添加来源标识，区分API和RSS
}

export function NewsPage() {
  const { t } = useLanguage()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentArticle, setCurrentArticle] = useState<NewsItem | null>(null)
  const [viewingArticle, setViewingArticle] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [consumedNewsId, setConsumedNewsId] = useState<number | null>(null)
  const [userInviteCode, setUserInviteCode] = useState<string>('')

  // 获取用户邀请码
  useEffect(() => {
    const fetchUserInviteCode = async () => {
      try {
        const userInfo = await UserService.getUserInfo()
        if (userInfo?.myInviteCode) {
          setUserInviteCode(userInfo.myInviteCode)
        }
      } catch (error) {
        console.error('获取用户邀请码失败:', error)
      }
    }

    fetchUserInviteCode()
  }, [])

  // 生成分享链接，优先使用带邀请码的个人资料页分享链接
  const getShareUrl = useCallback(
    (item: NewsItem | null) => {
      if (!item) return ''

      // 如果有邀请码，使用带邀请码的个人资料页分享链接
      if (userInviteCode) {
        return `${window.location.origin}/register?invite=${userInviteCode}`
      }

      // 否则使用原来的新闻分享链接
      return `${window.location.origin}/?tab=news&news=${item.id}`
    },
    [userInviteCode]
  )

  const { generateImage, ImageGeneratorComponent, setOverrideQrText } =
    useNewsImageGenerator(shareNewsItem, getShareUrl(shareNewsItem))

  // 从RSS获取新闻
  const fetchRssNews = useCallback(async () => {
    try {
      // 由于浏览器的跨域限制，使用代理或CORS友好的API
      const response = await fetch('https://rss.ntxdao.com/rss/clist')

      if (response.ok) {
        // 直接获取XML内容而不是尝试解析为JSON
        const xmlText = await response.text()
        const parser = new Parser()
        const feed = await parser.parseString(xmlText)

        // 将RSS项转换为NewsItem格式
        const rssItems: NewsItem[] = feed.items.map((item, index) => ({
          id: -1000 - index, // 使用负数ID避免与API文章ID冲突
          title: item.title || '',
          summary: item.contentSnippet || '',
          imageUrl: item.enclosure?.url || '/placeholder.png', // 使用文章图片或占位图
          publishDate: item.pubDate || new Date().toISOString(),
          modifyDate: item.isoDate || new Date().toISOString(),
          isDisplayed: true,
          content: item.content || '',
          source: 'rss'
        }))

        return rssItems
      }
      return []
    } catch (error) {
      console.error('获取RSS新闻出错:', error)
      return []
    }
  }, [])

  // 合并和排序新闻项
  const mergeAndSortNews = useCallback(
    (apiNews: NewsItem[], rssNews: NewsItem[]) => {
      return [...apiNews, ...rssNews].sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      )
    },
    []
  )

  // 获取新闻列表（API和RSS）
  useEffect(() => {
    let apiNewsFetched = false
    let rssNewsFetched = false
    let apiNews: NewsItem[] = []
    let rssNews: NewsItem[] = []

    // 显示加载状态
    setLoading(true)

    // 异步获取API文章
    async function fetchApiNews() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          apiNews = data.map((item: NewsItem) => ({ ...item, source: 'api' }))
          apiNewsFetched = true

          // 如果RSS文章也已获取，则合并和排序
          if (rssNewsFetched) {
            setNewsItems(mergeAndSortNews(apiNews, rssNews))
            setLoading(false)
          } else {
            // 仅显示API文章（如果有）
            setNewsItems(apiNews)
            // 保持加载状态，因为RSS还在加载
          }
        } else {
          console.error('获取API新闻失败:', response.statusText)
          apiNewsFetched = true
          if (rssNewsFetched) {
            // 如果RSS已获取，至少显示RSS内容
            setNewsItems(rssNews)
            setLoading(false)
          }

          toast({
            title: '获取部分新闻失败',
            description: 'API新闻获取失败，仍在尝试获取RSS文章',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('获取API新闻出错:', error)
        apiNewsFetched = true
        if (rssNewsFetched) {
          // 如果RSS已获取，至少显示RSS内容
          setNewsItems(rssNews)
          setLoading(false)
        }
      }
    }

    // 异步获取RSS文章
    async function fetchRssNewsAndUpdate() {
      try {
        const fetchedRssNews = await fetchRssNews()
        rssNews = fetchedRssNews
        rssNewsFetched = true

        // 如果API文章已获取，则合并和排序
        if (apiNewsFetched) {
          setNewsItems(mergeAndSortNews(apiNews, rssNews))
          setLoading(false)
        } else {
          // 仅显示RSS文章（如果有）
          setNewsItems(rssNews)
          // 保持加载状态，因为API还在加载
        }
      } catch (error) {
        console.error('获取RSS新闻出错:', error)
        rssNewsFetched = true
        if (apiNewsFetched) {
          // 如果API已获取，至少显示API内容
          setNewsItems(apiNews)
          setLoading(false)
        }
      }
    }

    // 并行启动两个获取过程
    fetchApiNews()
    fetchRssNewsAndUpdate()

    // 设置超时，确保即使有一个源未响应，UI也会更新
    const timeoutId = setTimeout(() => {
      if (!apiNewsFetched && !rssNewsFetched) {
        // 两个源都未响应
        setLoading(false)
        toast({
          title: '获取新闻超时',
          description: '请检查您的网络连接或稍后再试',
          variant: 'destructive'
        })
      } else if (!apiNewsFetched && rssNewsFetched) {
        // 只有RSS响应了
        setNewsItems(rssNews)
        setLoading(false)
      } else if (apiNewsFetched && !rssNewsFetched) {
        // 只有API响应了
        setNewsItems(apiNews)
        setLoading(false)
      }
      // 如果两者都响应了，那么在各自的获取函数中已处理
    }, 10000) // 10秒超时

    // 清理函数
    return () => clearTimeout(timeoutId)
  }, [fetchRssNews, mergeAndSortNews])

  // 获取新闻详情（稳定引用）
  const fetchArticleContent = useCallback(
    async (id: number) => {
      try {
        // 如果是RSS文章(负数ID)，直接从现有数据中获取
        if (id < 0) {
          const rssArticle = newsItems.find((item) => item.id === id)
          if (rssArticle) {
            setCurrentArticle(rssArticle)
            setViewingArticle(true)
          } else {
            throw new Error('找不到对应的RSS文章')
          }
          return
        }

        // 如果是API文章，从服务器获取详情
        const response = await fetch(
          `${API_BASE_URL}/user/academy/articles/${id}`
        )
        if (response.ok) {
          const data = await response.json()
          setCurrentArticle({ ...data, source: 'api' })
          setViewingArticle(true)
        } else {
          toast({
            title: '获取文章详情失败',
            description: '请稍后再试',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('获取文章出错:', error)
        toast({
          title: '获取文章详情失败',
          description: '请检查您的网络连接',
          variant: 'destructive'
        })
      }
    },
    [newsItems]
  )

  // 根据 URL 中的 ?news=ID 自动打开文章（API：直接拉取；RSS：等待列表就绪）
  useEffect(() => {
    const idStr = searchParams?.get('news')
    if (!idStr) return
    const id = Number(idStr)
    if (Number.isNaN(id)) return
    if (consumedNewsId === id) return
    setConsumedNewsId(id)

    if (id >= 0) {
      // API 文章：直接请求详情
      fetchArticleContent(id)
    }
  }, [searchParams, consumedNewsId, fetchArticleContent])

  // 当等待中的 RSS 文章出现在列表中时再打开
  useEffect(() => {
    if (consumedNewsId !== null && consumedNewsId < 0 && !viewingArticle) {
      const rssArticle = newsItems.find((n) => n.id === consumedNewsId)
      if (rssArticle) {
        setCurrentArticle(rssArticle)
        setViewingArticle(true)
      }
    }
  }, [newsItems, consumedNewsId, viewingArticle])

  // 获取新闻详情 - 已上移并使用 useCallback 包裹

  const handleShare = (newsItem: NewsItem) => {
    setShareNewsItem(newsItem)
    setShowShareModal(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 渲染Markdown内容的函数
  const renderMarkdownContent = (content: string) => {
    if (!content) {
      return (
        <div className="text-slate-500 text-center py-8">
          {t('news.no.content') || '文章内容为空'}
        </div>
      )
    }

    return (
      <div className="markdown-content">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  if (viewingArticle && currentArticle) {
    return (
      <div className="min-h-screen pb-6">
        {/* 顶部 Hero 区域，与学院页一致结构 */}
        <div className="px-6 pt-12 pb-8 relative z-10">
          <div className="flex flex-col mb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewingArticle(false)
                    try {
                      const params = new URLSearchParams(window.location.search)
                      if (params.has('news')) {
                        params.delete('news')
                        const qs = params.toString()
                        // 保持停留在新闻页
                        const url = qs ? `?${qs}` : '?tab=news'
                        router.replace(url)
                      }
                    } catch {}
                  }}
                  className="mr-3 text-slate-600 hover:text-slate-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  {t('news.back') || '返回'}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(currentArticle)}
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-3">
              {currentArticle.title}
            </h1>
            <div className="flex items-center text-slate-500 text-xs mt-2">
              <span>{formatDate(currentArticle.publishDate)}</span>
              <span className="mx-2">•</span>
              <span>{formatTime(currentArticle.publishDate)}</span>
              {currentArticle.source === 'rss' && (
                <span className="flex items-center ml-2 text-blue-500">
                  <Rss className="w-3 h-3 mr-1" /> RSS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域卡片 */}
        <div className="px-6 mt-6">
          <Card className="glass-card border-white/30 shadow-lg rounded-3xl overflow-hidden">
            {currentArticle.imageUrl &&
              currentArticle.imageUrl !== '/placeholder.png' &&
              currentArticle.imageUrl.trim() !== '' && (
                <div className="w-full h-48 overflow-hidden relative">
                  <Image
                    src={currentArticle.imageUrl}
                    alt={currentArticle.title}
                    className="object-cover"
                    fill
                    sizes="100vw"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const parent = target.parentElement?.parentElement
                      if (parent) parent.style.display = 'none'
                    }}
                  />
                </div>
              )}
            <CardContent className="p-6">
              <div className="max-w-none">
                {currentArticle.source === 'rss' ? (
                  <div className="markdown-content">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {currentArticle.content || ''}
                    </ReactMarkdown>
                  </div>
                ) : (
                  renderMarkdownContent(currentArticle.content || '')
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 分享模态框 - 在阅读界面也需要包含 */}
        <UniversalShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setOverrideQrText?.('')
          }}
          title="分享文章"
          shareData={{
            title: shareNewsItem?.title || '',
            text: shareNewsItem?.summary || '',
            url: getShareUrl(shareNewsItem)
          }}
          imageGenerator={generateImage}
          showImagePreview={true}
          showDefaultShareButtons={true}
          onQrOverride={(text) => {
            setOverrideQrText?.(text)
          }}
        />
        <ImageGeneratorComponent />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      {' '}
      {/* 更改背景为白色 */}
      {/* 顶部 Hero 区域，保持不变 */}
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
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
              WEB3 一站式服务
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* 顶部 Banner，参考学院页面的实现方式 */}
        <div
          className="relative overflow-hidden rounded-2xl h-32 p-5 text-white"
          style={{
            backgroundImage: "url('/Group35@3x.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="flex items-center h-full">
            <h2 className="text-white text-2xl md:text-3xl font-tektur-semibold drop-shadow-md">
              {t('news.title') || '最新资讯'}
            </h2>
          </div>
        </div>
      </div>
      {/* --- 内容区域重构开始 --- */}
      <div className="px-6">
        {' '}
        {/* 原来这里是 mt-6 和 Card，现在简化 */}
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            {t('news.loading') || '加载中...'}
          </div>
        ) : newsItems.length > 0 ? (
          // 蓝湖时间线布局容器
          <div className="relative">
            {/* 蓝色竖线，贯穿始终 */}
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#EBF0FF]"></div>

            <div className="flex flex-col gap-y-8">
              {' '}
              {/* 控制每个新闻项的垂直间距 */}
              {newsItems.map((item) => (
                // 每个新闻项的容器（语义化 button，配合内层 asChild 避免嵌套 button）
                <button
                  type="button"
                  key={item.id}
                  className="relative pl-6 cursor-pointer text-left w-full" // 左内边距给圆点和竖线留出空间
                  onClick={() => fetchArticleContent(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fetchArticleContent(item.id)
                    }
                  }}
                  aria-label={`阅读文章: ${item.title}`}
                >
                  {/* 蓝点 */}
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#1C55FF] border-2 border-white"></div>

                  {/* 内容垂直堆叠 */}
                  <div className="flex flex-col gap-y-2">
                    {' '}
                    {/* 内容内部的间距 */}
                    {/* 标题 - 对应 text_5, text_8 等 */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold text-[#1B254D] leading-tight">
                        {item.title}
                      </h3>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation() // 防止点击分享时触发进入详情页的事件
                          handleShare(item)
                        }}
                      >
                        <span>
                          <Share2 className="w-4 h-4" />
                        </span>
                      </Button>
                    </div>
                    {/* 日期和来源 - 对应 group_5, text_6 */}
                    <div className="flex items-center text-xs text-[#AAB7CF]">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span>{formatDate(item.publishDate)}</span>
                      {item.source === 'rss' && (
                        <span className="flex items-center ml-2 text-blue-500">
                          <Rss className="w-3 h-3 mr-1" />
                          <span>RSS</span>
                        </span>
                      )}
                    </div>
                    {/* 摘要 - 对应 text_7 */}
                    <p className="text-xs text-[#4D576A] leading-normal line-clamp-3">
                      {item.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {t('news.empty') || '暂无资讯'}
          </div>
        )}
      </div>
      {/* --- 内容区域重构结束 --- */}
      {/* 新闻分享模态框和图片生成器，保持不变 */}
      <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setOverrideQrText?.('')
        }}
        title="分享文章"
        shareData={{
          title: shareNewsItem?.title || '',
          text: shareNewsItem?.summary || '',
          url: getShareUrl(shareNewsItem)
        }}
        imageGenerator={generateImage}
        showImagePreview={true}
        showDefaultShareButtons={true}
        onQrOverride={(text) => {
          setOverrideQrText?.(text)
        }}
      />
      <ImageGeneratorComponent />
    </div>
  )
}
