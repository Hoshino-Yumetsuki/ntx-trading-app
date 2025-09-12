'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import Image from 'next/image'
import { Clock, Rss, Share2, AlertTriangle, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import DOMPurify from 'dompurify'
import Parser from 'rss-parser'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useNewsImageGenerator } from './news/news-image-generator'
import '@/src/styles/markdown.css'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

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

// 将数据获取逻辑移到组件外部
const fetchRssNews = async (): Promise<NewsItem[]> => {
  const response = await fetch('https://rss.ntxdao.com/rss/clist')
  if (!response.ok) {
    throw new Error('网络响应错误，无法获取RSS源')
  }

  const xmlText = await response.text()
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'contentEncoded'],
        ['media:content', 'mediaContent'],
        ['media:thumbnail', 'mediaThumbnail']
      ]
    }
  })
  const feed = await parser.parseString(xmlText)

  const extractFirstImageSrc = (html: string): string | null => {
    if (!html) return null
    const match = html.match(/<img[^>]+src=["']?([^"'>\s]+)["']?[^>]*>/i)
    return match ? match[1] : null
  }

  return feed.items.map(
    (item: any, index: number) => {
      const contentEncoded: string =
        item?.contentEncoded || item?.['content:encoded'] || ''
      const firstImg = extractFirstImageSrc(contentEncoded)
      const imageUrl =
        item?.enclosure?.url ||
        item?.mediaContent?.url ||
        item?.mediaThumbnail?.url ||
        firstImg ||
        '/placeholder.png'

      return {
        id: -1000 - index,
        title: item?.title || '',
        summary: item?.contentSnippet || '',
        imageUrl,
        publishDate: item?.pubDate || new Date().toISOString(),
        modifyDate: item?.isoDate || new Date().toISOString(),
        isDisplayed: true,
        content: contentEncoded || item?.content || '',
        source: 'rss'
      }
    }
  ).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
}

export function NewsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentArticle, setCurrentArticle] = useState<NewsItem | null>(null)
  const [viewingArticle, setViewingArticle] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null)

  // 使用 useQuery 来获取和管理RSS数据
  const { data: newsItems = [], isLoading, isError, refetch } = useQuery<NewsItem[]>({
    queryKey: ['rssNews'],
    queryFn: fetchRssNews,
    staleTime: 1000 * 60 * 5, // 5分钟内数据被认为是新鲜的，不会重新获取
    refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
  })

  // Share Modal Logic
  const getShareUrl = useCallback((item: NewsItem | null) =>
    item ? `${window.location.origin}/?tab=news&news=${item.id}&direct=true` : '',
    []
  )
  const { generateImage, ImageGeneratorComponent, setOverrideQrText } =
    useNewsImageGenerator(shareNewsItem, getShareUrl(shareNewsItem))

  const handleShare = (newsItem: NewsItem) => {
    setShareNewsItem(newsItem)
    setShowShareModal(true)
  }

  const viewArticleDetail = (article: NewsItem) => {
    setCurrentArticle(article)
    setViewingArticle(true)
  }

  const handleBackToList = useCallback(() => {
    setViewingArticle(false)
    setCurrentArticle(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('news')
    params.delete('direct')
    params.set('tab', 'news')
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router])

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const renderMarkdownContent = (content: string) => {
    const safeHtml = DOMPurify.sanitize(content)
    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }

  // 文章详情页
  if (viewingArticle && currentArticle) {
    // (详情页代码保持不变)
    return (
        <>
        <div className="min-h-screen bg-white pb-12">
          {/* ... 详情页顶部导航和标题 ... */}
          <div className="px-4 pt-12 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2">
                  <Image src="/back.png" alt="返回" width={20} height={20} />
                </Button>
                <div className="relative w-24 h-8 md:w-28 md:h-9">
                  <Image src="/Frame17@3x.png" alt="NTX Logo" fill className="object-contain" priority />
                </div>
              </div>
              <Button variant="ghost" onClick={() => handleShare(currentArticle)} className="h-auto p-1.5 rounded-md hover:bg-blue-50/50">
                <div className="flex items-center gap-x-1">
                  <span className="text-xs font-medium text-[#1C55FF]">分享</span>
                  <Image src="/share.png" alt="分享" width={16} height={13} />
                </div>
              </Button>
            </div>
            <div className="px-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{currentArticle.title}</h1>
              <div className="flex items-center text-slate-500 text-xs mt-3">
                <span>{formatDate(currentArticle.publishDate)}</span>
                <span className="mx-2">•</span>
                <span>{formatTime(currentArticle.publishDate)}</span>
                <span className="flex items-center ml-2 text-blue-500"><Rss className="w-3 h-3 mr-1" /> RSS</span>
              </div>
            </div>
          </div>
          
          <div className="px-4 mt-4">
            {currentArticle.imageUrl && currentArticle.imageUrl !== '/placeholder.png' && (
              <div className="w-full h-48 md:h-64 overflow-hidden relative rounded-2xl mb-6">
                <Image src={currentArticle.imageUrl} alt={currentArticle.title} className="object-cover" fill sizes="100vw" priority onError={(e) => { e.currentTarget.style.display = 'none' }}/>
              </div>
            )}
            <div className="px-2 max-w-none">
              {renderMarkdownContent(currentArticle.content || '')}
            </div>
            <div className="mt-10 flex justify-center">
              <Button className="bg-[#5EC16A] hover:bg-[#5EC16A]/90 text-white rounded-lg px-8 py-3" onClick={() => handleShare(currentArticle)}>
                <span className="mr-2 font-semibold">分享</span>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <UniversalShareModal
          isOpen={showShareModal}
          onClose={() => { setShowShareModal(false); setOverrideQrText?.('') }}
          title="分享文章"
          shareData={{
            title: shareNewsItem?.title || '',
            text: shareNewsItem?.summary || '',
            url: getShareUrl(shareNewsItem)
          }}
          imageGenerator={generateImage}
          showImagePreview={true}
          showDefaultShareButtons={true}
          onQrOverride={(text) => setOverrideQrText?.(text)}
        />
        <ImageGeneratorComponent />
      </>
    )
  }

  // 列表页
  return (
    <div className="min-h-screen bg-white pb-6">
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <div className="relative mb-0.5 w-28 h-9 md:w-32 md:h-10">
              <Image src="/Frame17@3x.png" alt="NTX Logo" fill className="object-contain" priority/>
            </div>
            <p className="text-slate-800 text-xl font-medium">WEB3 一站式服务</p>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="relative overflow-hidden rounded-2xl h-32 flex items-center p-6"
             style={{ backgroundImage: "url('/Group35@3x.png')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover', backgroundColor: '#1C55FF' }}>
          <h2 className="text-white text-2xl md:text-3xl font-tektur-semibold drop-shadow-md z-10">{t('news.title') || '最新资讯'}</h2>
        </div>
      </div>
      <div className="px-6">
        {isLoading ? ( // 加载状态：显示骨架屏
          <div className="space-y-8 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
              </div>
            ))}
          </div>
        ) : isError ? ( // 错误状态：显示提示和重试按钮
          <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <p className="text-red-600">加载资讯失败</p>
            <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2"/>
                点击重试
            </Button>
          </div>
        ) : newsItems.length > 0 ? ( // 成功状态
          <div className="relative">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#EBF0FF]"></div>
            <div className="flex flex-col gap-y-8">
              {newsItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="relative pl-6 cursor-pointer text-left w-full"
                  onClick={() => viewArticleDetail(item)}
                >
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#1C55FF] border-2 border-white"></div>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#1B254D] leading-tight">{item.title}</h3>
                        <div className="flex items-center text-xs text-[#AAB7CF] mt-1">
                          <Clock className="w-3 h-3 mr-1.5" />
                          <span>{formatDate(item.publishDate)}</span>
                           <span className="flex items-center ml-2 text-blue-500">
                              <Rss className="w-3 h-3 mr-1" />
                              <span>RSS</span>
                            </span>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 flex-shrink-0 mt-1" onClick={(e) => { e.stopPropagation(); handleShare(item); }}>
                        <span><Share2 className="w-4 h-4" /></span>
                      </Button>
                    </div>
                    <p className="text-xs text-[#4D576A] leading-normal line-clamp-3">{item.summary}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">{t('news.empty') || '暂无新闻'}</div>
        )}
      </div>
       <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => { setShowShareModal(false); setOverrideQrText?.('') }}
        title="分享文章"
        shareData={{
          title: shareNewsItem?.title || '',
          text: shareNewsItem?.summary || '',
          url: getShareUrl(shareNewsItem)
        }}
        imageGenerator={generateImage}
        showImagePreview={true}
        showDefaultShareButtons={true}
        onQrOverride={(text) => setOverrideQrText?.(text)}
      />
      <ImageGeneratorComponent />
    </div>
  )
}