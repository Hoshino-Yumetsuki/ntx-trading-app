'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import Image from 'next/image'
import { Clock, Share2, Search, X } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from '@/src/hooks/use-toast'
import MarkdownIt from 'markdown-it'
import multimdTable from 'markdown-it-multimd-table'
import DOMPurify from 'dompurify'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useNewsImageGenerator } from '@/src/components/pages/news/news-image-generator'
import { API_BASE_URL } from '@/src/services/config'
import '@/src/styles/markdown.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/src/components/ui/input'
import { ShareCard } from '@/src/components/ui/share-card'
import { processLocaleString } from '@/src/utils/apiLocaleProcessor'

/**
 * 清除文本中的控制标记 [Sort:数字]、[Link:...] 和 [Show]
 */
function cleanControlTags(text: string): string {
  if (!text) return ''
  return text
    .replace(/\[Sort:\d+\]/g, '')
    .replace(/\[Link:[^\]]+\]/g, '')
    .replace(/\[Show\]/gi, '')
}

interface NewsItem {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  modifyDate: string
  isDisplayed: boolean
  content?: string
  source?: string
}

export function NotificationsPage() {
  const { t, language } = useLanguage()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentArticle, setCurrentArticle] = useState<NewsItem | null>(null)
  const [viewingArticle, setViewingArticle] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [consumedNewsId, setConsumedNewsId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const posterRef = useRef<HTMLDivElement>(null)

  const getShareUrl = useCallback(
    (item: NewsItem | null) =>
      item
        ? `${window.location.origin}/?tab=notifications&news=${item.id}&direct=true`
        : '',
    []
  )

  const { generateImage, setOverrideQrText, qrCodeDataUrl, fullContent } =
    useNewsImageGenerator(shareNewsItem, getShareUrl(shareNewsItem))

  useEffect(() => {
    let cancelled = false
    async function fetchApiNews() {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            const sortedData = data.sort(
              (a: NewsItem, b: NewsItem) =>
                new Date(b.publishDate).getTime() -
                new Date(a.publishDate).getTime()
            )
            setNewsItems(sortedData)
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

  const filteredNewsItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return newsItems
    }
    return newsItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
    )
  }, [searchQuery, newsItems])

  const clearSearch = () => {
    setSearchQuery('')
  }

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

  useEffect(() => {
    const currentTab = searchParams?.get('tab')
    if (currentTab !== 'notifications' && currentTab !== null) return

    const idStr = searchParams?.get('news')
    if (!idStr) return
    const id = Number(idStr)
    if (Number.isNaN(id) || consumedNewsId === id) return

    if (newsItems.length > 0) {
      setConsumedNewsId(id)
      fetchArticleContent(id)
    }
  }, [searchParams, consumedNewsId, fetchArticleContent, newsItems])

  const handleShare = (newsItem: NewsItem) => {
    setShareNewsItem(newsItem)
    setShowShareModal(true)
  }

  const handleBackToList = useCallback(() => {
    setViewingArticle(false)
    setCurrentArticle(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('news')
    params.delete('direct')
    params.set('tab', 'notifications')
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * 处理文本：先清除控制标记，再处理多语言标记
   */
  const processText = useCallback(
    (text: string) => {
      const cleaned = cleanControlTags(text)
      return processLocaleString(cleaned, language)
    },
    [language]
  )

  const renderMarkdownContent = (content: string) => {
    if (!content) {
      return (
        <div className="text-slate-500 text-center py-10">
          {t('news.no.content') || '文章内容为空'}
        </div>
      )
    }

    // 先处理控制标记和多语言标记
    const processedContent = processText(content)

    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true
    }).use(multimdTable, {
      multiline: true,
      rowspan: true,
      headerless: true
    })

    const html = md.render(processedContent)
    const safe = DOMPurify.sanitize(html)

    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    )
  }

  if (viewingArticle && currentArticle) {
    return (
      <>
        <div className="min-h-screen bg-white pb-12">
          <div className="px-4 pt-12 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="mr-2"
                >
                  <Image
                    src="/icon-back.png"
                    alt="返回"
                    width={20}
                    height={20}
                  />
                </Button>
                <div className="relative w-24 h-8 md:w-28 md:h-9">
                  <Image
                    src="/logo.png"
                    alt="NTX Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleShare(currentArticle)}
                className="h-auto p-1.5 rounded-md hover:bg-blue-50/50"
              >
                <div className="flex items-center gap-x-1">
                  <span className="text-xs font-medium text-[#1C55FF]">
                    分享
                  </span>
                  <Image
                    src="/icon-share.png"
                    alt="分享"
                    width={16}
                    height={13}
                  />
                </div>
              </Button>
            </div>
            <div className="px-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                {processText(currentArticle.title)}
              </h1>
              <div className="flex items-center text-slate-500 text-xs mt-3">
                <span>{formatDate(currentArticle.publishDate)}</span>
                <span className="mx-2">•</span>
                <span>{formatTime(currentArticle.publishDate)}</span>
              </div>
            </div>
          </div>
          <div className="px-4 mt-4">
            {currentArticle.imageUrl &&
              currentArticle.imageUrl !== '/placeholder.png' && (
                <div className="w-full h-48 md:h-64 overflow-hidden relative rounded-2xl mb-6">
                  <Image
                    src={currentArticle.imageUrl}
                    alt={currentArticle.title}
                    className="object-cover"
                    fill
                    sizes="100vw"
                    priority
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            <div className="px-2 max-w-none">
              {renderMarkdownContent(currentArticle.content || '')}
            </div>
            <div className="mt-10 flex justify-center">
              <Button
                className="bg-[#5EC16A] hover:bg-[#5EC16A]/90 text-white rounded-lg px-8 py-3"
                onClick={() => handleShare(currentArticle)}
              >
                <span className="mr-2 font-semibold">分享</span>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <UniversalShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setOverrideQrText('')
          }}
          title="分享文章"
          shareData={{
            title: processText(shareNewsItem?.title || ''),
            text: processText(shareNewsItem?.summary || ''),
            fullText: processText(fullContent),
            url: getShareUrl(shareNewsItem)
          }}
          imageGenerator={(node) => generateImage(node)}
          posterComponent={
            <ShareCard
              ref={posterRef}
              title={processText(shareNewsItem?.title || '')}
              content={processText(fullContent || shareNewsItem?.content || '')}
              summary={processText(shareNewsItem?.summary || '')}
              publishDate={shareNewsItem?.publishDate || ''}
              qrCodeDataUrl={qrCodeDataUrl}
              source={shareNewsItem?.source}
            />
          }
          onQrOverride={setOverrideQrText}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <div className="relative mb-0.5 w-28 h-9 md:w-32 md:h-10">
              <Image
                src="/logo.png"
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
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div
            className="h-32 w-full bg-cover bg-center flex items-center p-6"
            style={{
              backgroundImage: 'url(/news-bg.png)',
              backgroundColor: '#0262f4',
              borderRadius: '16px'
            }}
          >
            <h2 className="text-white text-2xl md:text-3xl font-tektur-semibold drop-shadow-md z-10">
              {t('ui.notifications.title') || '最新通知'}
            </h2>
          </div>
        </div>
      </div>
      <div className="px-6">
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('notifications.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">
            {t('news.loading') || '加载中...'}
          </div>
        ) : filteredNewsItems.length > 0 ? (
          <div className="relative">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#EBF0FF]"></div>
            <div className="flex flex-col gap-y-8">
              {filteredNewsItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="relative pl-6 cursor-pointer text-left w-full"
                  onClick={() => fetchArticleContent(item.id)}
                >
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#1C55FF] border-2 border-white"></div>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold text-[#1B254D] leading-tight">
                        {processText(item.title)}
                      </h3>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 shrink-0"
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
                      {processText(item.summary)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {searchQuery
              ? `没有找到与 "${searchQuery}" 相关的通知`
              : t('news.empty') || '暂无通知'}
          </div>
        )}
      </div>
      <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setOverrideQrText('')
        }}
        title="分享文章"
        shareData={{
          title: processText(shareNewsItem?.title || ''),
          text: processText(shareNewsItem?.summary || ''),
          fullText: processText(fullContent),
          url: getShareUrl(shareNewsItem)
        }}
        imageGenerator={(node) => generateImage(node)}
        posterComponent={
          <ShareCard
            ref={posterRef}
            title={processText(shareNewsItem?.title || '')}
            content={processText(fullContent || shareNewsItem?.content || '')}
            summary={processText(shareNewsItem?.summary || '')}
            publishDate={shareNewsItem?.publishDate || ''}
            qrCodeDataUrl={qrCodeDataUrl}
            source={shareNewsItem?.source}
          />
        }
        onQrOverride={setOverrideQrText}
      />
    </div>
  )
}
