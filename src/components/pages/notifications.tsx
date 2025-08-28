'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import Image from 'next/image'
import { Clock, Share2, ChevronLeft } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from '@/src/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useNewsImageGenerator } from '@/src/components/pages/news/news-image-generator'
import { API_BASE_URL } from '@/src/services/config'
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
}

export function NotificationsPage() {
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

  const getShareUrl = useCallback(
    (item: NewsItem | null) =>
      item
        ? `${window.location.origin}/?tab=notifications&news=${item.id}`
        : '',
    []
  )
  const { generateImage, ImageGeneratorComponent, setOverrideQrText } =
    useNewsImageGenerator(shareNewsItem, getShareUrl(shareNewsItem))

  // 获取 API 新闻列表
  useEffect(() => {
    let cancelled = false
    async function fetchApiNews() {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setNewsItems(data)
          }
        } else {
          toast({
            title: '获取最新通知失败',
            description: '请稍后再试',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('获取API新闻出错:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchApiNews()
    return () => {
      cancelled = true
    }
  }, [])

  // 稳定的文章详情获取
  const fetchArticleContent = useCallback(async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/academy/articles/${id}`
      )
      if (response.ok) {
        const data = await response.json()
        setCurrentArticle(data)
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
  }, [])

  // 根据 URL 中的 ?news=ID 自动打开文章（仅 API）
  useEffect(() => {
    const idStr = searchParams?.get('news')
    if (!idStr) return
    const id = Number(idStr)
    if (Number.isNaN(id)) return
    if (consumedNewsId === id) return
    setConsumedNewsId(id)
    fetchArticleContent(id)
  }, [searchParams, consumedNewsId, fetchArticleContent])

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
        {/* 顶部 Hero 区域 */}
        <div className="px-6 pt-12 pb-8 relative z-10">
          <div className="flex flex-col mb-6">
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
                      const url = qs ? `?${qs}` : '?tab=notifications'
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
            <h1 className="text-2xl font-bold text-slate-800 mt-3">
              {currentArticle.title}
            </h1>
            <div className="flex items-center text-slate-500 text-xs mt-2">
              <span>{formatDate(currentArticle.publishDate)}</span>
              <span className="mx-2">•</span>
              <span>{formatTime(currentArticle.publishDate)}</span>
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
                      // 图片加载失败时，不隐藏整个容器，而是显示一个占位图
                      const target = e.target as HTMLImageElement
                      // 设置为透明度0，保持布局不变
                      target.style.opacity = '0'
                      // 添加一个背景色，避免空白
                      if (target.parentElement) {
                        target.parentElement.style.backgroundColor = '#f0f4f8'
                      }
                    }}
                  />
                </div>
              )}
            <CardContent className="p-6">
              <div className="max-w-none">
                {renderMarkdownContent(currentArticle.content || '')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* 顶部 Hero 区域 */}
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

        {/* 顶部 Banner */}
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div
            className="h-32 w-full bg-cover bg-center"
            style={{ backgroundImage: 'url(/Group35@3x.png)' }}
          />
          <div className="absolute left-6 top-8 md:left-8 md:top-10 z-10">
            <h2 className="text-white text-2xl md:text-3xl font-tektur-semibold drop-shadow-md">
              {t('ui.notifications.title') || '最新通知'}
            </h2>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="px-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            {t('news.loading') || '加载中...'}
          </div>
        ) : newsItems.length > 0 ? (
          <div className="relative">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#EBF0FF]"></div>
            <div className="flex flex-col gap-y-8">
              {newsItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="relative pl-6 cursor-pointer text-left w-full"
                  onClick={() => fetchArticleContent(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fetchArticleContent(item.id)
                    }
                  }}
                  aria-label={`阅读文章: ${item.title}`}
                >
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#1C55FF] border-2 border-white"></div>
                  <div className="flex flex-col gap-y-2">
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
                          e.stopPropagation()
                          handleShare(item)
                        }}
                      >
                        <span>
                          <Share2 className="w-4 h-4" />
                        </span>
                      </Button>
                    </div>
                    <div className="flex items-center text-xs text-[#AAB7CF]">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span>{formatDate(item.publishDate)}</span>
                    </div>
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
            {t('news.empty') || '暂无通知'}
          </div>
        )}
      </div>

      {/* 分享模态框 */}
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
