'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import Image from 'next/image'
import { Clock, Rss, Newspaper, Share2, ChevronLeft } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from '@/src/hooks/use-toast'
import MarkdownIt from 'markdown-it'
import Parser from 'rss-parser'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useNewsImageGenerator } from './news/news-image-generator'
import { API_BASE_URL } from '@/src/services/config'
import '@/src/styles/markdown.css'

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
  const { generateImage, ImageGeneratorComponent } =
    useNewsImageGenerator(shareNewsItem)

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

  // 获取新闻详情
  const fetchArticleContent = async (id: number) => {
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
  }

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

  // 初始化markdown-it实例
  const md = new MarkdownIt({
    html: true, // 允许HTML标签
    linkify: true, // 自动识别链接
    typographer: true, // 启用智能引号和其他排版功能
    breaks: true // 将换行符转换为<br>
  })

  // 渲染Markdown内容的函数
  const renderMarkdownContent = (content: string) => {
    if (!content) {
      return (
        <div className="text-slate-500 text-center py-8">
          {t('news.no.content') || '文章内容为空'}
        </div>
      )
    }

    // 使用markdown-it渲染HTML
    const htmlContent = md.render(content)

    return (
      <div
        className="markdown-content"
        // biome-ignore lint: false positive
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  }

  if (viewingArticle && currentArticle) {
    return (
      <div className="min-h-screen pb-6">
        <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-blue-600 absolute top-4 left-4"
            onClick={() => setViewingArticle(false)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('news.back') || '返回'}
          </Button>
          <h1 className="text-xl font-bold text-slate-800 mt-4">
            {currentArticle.title}
          </h1>
          <div className="flex items-center text-slate-500 text-xs mt-2">
            <span>{formatDate(currentArticle.publishDate)}</span>
            <span className="mx-2">•</span>
            <span>{formatTime(currentArticle.publishDate)}</span>
            {currentArticle.source === 'rss' && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center text-blue-500">
                  <Rss className="w-3 h-3 mr-1" />
                  RSS
                </span>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <Card className="glass-card border-white/30 overflow-hidden">
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
                      // 图片加载失败时隐藏父元素
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
                  // RSS内容通常是HTML格式，使用DOMPurify净化后再渲染
                  <div
                    className="markdown-content"
                    // biome-ignore lint: false
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(currentArticle.content || '')
                    }}
                  />
                ) : (
                  // API内容是Markdown格式
                  renderMarkdownContent(currentArticle.content || '')
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-800">
            {t('news.title') || '资讯中心'}
          </h1>
        </div>
      </div>

      <div className="px-6 mt-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            {t('news.loading') || '加载中...'}
          </div>
        ) : newsItems.length > 0 ? (
          <div className="relative space-y-3 pl-8">
            {/* 蓝线 */}
            <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-blue-400"></div>

            {newsItems.map((item, _index) => (
              <Card
                key={item.id}
                className="glass-card border-white/20 hover:border-white/40 transition-all cursor-pointer relative"
                onClick={() => fetchArticleContent(item.id)}
              >
                {/* 蓝点 */}
                <div className="absolute left-0 top-1/2 w-[10px] h-[10px] rounded-full bg-blue-400 transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

                <div className="flex p-3">
                  <div className="flex-1 pr-3">
                    <h3 className="text-slate-800 font-medium text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatDate(item.publishDate)}</span>
                        {item.source === 'rss' && (
                          <span className="flex items-center ml-2 text-blue-500">
                            <Rss className="w-3 h-3 mr-1" />
                            RSS
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(item)
                        }}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {item.imageUrl &&
                    item.imageUrl !== '/placeholder.png' &&
                    item.imageUrl.trim() !== '' && (
                      <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // 图片加载失败时隐藏父元素
                            const target = e.target as HTMLImageElement
                            const parent = target.parentElement
                            if (parent) parent.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {t('news.empty') || '暂无资讯'}
          </div>
        )}
      </div>

      {/* 新闻分享模态框 */}
      <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="分享文章"
        shareData={{
          title: shareNewsItem?.title || '',
          text: shareNewsItem?.summary || '',
          url: shareNewsItem
            ? `${window.location.origin}/news/${shareNewsItem.id}`
            : ''
        }}
        imageGenerator={generateImage}
        showImagePreview={true}
        showDefaultShareButtons={true}
      />

      {/* 图片生成器组件 */}
      <ImageGeneratorComponent />
    </div>
  )
}
