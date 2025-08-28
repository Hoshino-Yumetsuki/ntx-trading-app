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

  // 根据 URL 中的 ?news=ID 自动打开文章
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

  const handleBackToList = () => {
    setViewingArticle(false)
    // 清理URL中的news参数，返回列表视图
    const params = new URLSearchParams(window.location.search)
    if (params.has('news')) {
      params.delete('news')
      const queryString = params.toString()
      const newUrl = queryString
        ? `?${queryString}`
        : window.location.pathname + '?tab=notifications'
      router.replace(newUrl)
    }
  }

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

  const renderMarkdownContent = (content: string) => {
    if (!content) {
      return (
        <div className="text-slate-500 text-center py-10">
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

  // ====================================================================
  // 	UI 微调后的文章详情页视图
  // ====================================================================
  if (viewingArticle && currentArticle) {
    return (
      <div className="min-h-screen bg-white pb-12">
        {/* 顶部导航区域 */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {/* 返回按钮 */}
              <Button
                variant="ghost"
                size="icon" // 使用 'icon' 尺寸，更适合单个图标按钮
                onClick={handleBackToList}
                className="mr-2" // 移除颜色相关的类名，让图片保持原样
              >
                <Image
                  src="/back.png" // 图片路径 (请确保 back.png 文件在 public 目录下)
                  alt="返回"
                  width={20} // 设置宽度为 20px
                  height={20} // 设置高度为 20px
                />
              </Button>
              {/* Logo */}
              <div className="relative w-24 h-8 md:w-28 md:h-9">
                <Image
                  src="/Frame17@3x.png"
                  alt="NTX Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* ==================== 代码修改开始 ==================== */}
            {/* 参照蓝湖UI修改了顶部分享按钮 */}
            <Button
              variant="ghost"
              onClick={() => handleShare(currentArticle)}
              // 移除了 size="icon"，使用自定义样式
              className="h-auto p-1.5 rounded-md hover:bg-blue-50/50"
            >
              <div className="flex items-center gap-x-1">
                <span className="text-xs font-medium text-[#1C55FF]">
                  分享
                </span>
                <Image
                  src="/share.png"
                  alt="分享"
                  width={16}
                  height={13}
                />
              </div>
            </Button>
            {/* ==================== 代码修改结束 ==================== */}

          </div>

          {/* 文章标题和日期 */}
          <div className="px-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              {currentArticle.title}
            </h1>
            <div className="flex items-center text-slate-500 text-xs mt-3">
              <span>{formatDate(currentArticle.publishDate)}</span>
              <span className="mx-2">•</span>
              <span>{formatTime(currentArticle.publishDate)}</span>
            </div>
          </div>
        </div>

        {/* 内容区域 (移除了Card包裹) */}
        <div className="px-4 mt-4">
          {/* 文章图片 */}
          {currentArticle.imageUrl &&
            currentArticle.imageUrl !== '/placeholder.png' &&
            currentArticle.imageUrl.trim() !== '' && (
              <div className="w-full h-48 md:h-64 overflow-hidden relative rounded-2xl mb-6">
                <Image
                  src={currentArticle.imageUrl}
                  alt={currentArticle.title}
                  className="object-cover"
                  fill
                  sizes="100vw"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.parentElement) {
                      target.parentElement.style.display = 'none'
                    }
                  }}
                />
              </div>
            )}

          {/* Markdown 正文内容 */}
          <div className="px-2 max-w-none">
            {renderMarkdownContent(currentArticle.content || '')}
          </div>
          
          {/* 新增的底部自分享按钮 */}
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
    )
  }

  // ====================================================================
  // 	新闻列表页视图 (保持不变)
  // ====================================================================
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