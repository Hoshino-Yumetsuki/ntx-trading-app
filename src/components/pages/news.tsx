'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import Image from 'next/image'
import { Clock, Rss, Share2 } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from '@/src/hooks/use-toast'
import { UserService } from '@/src/services/user'
import { API_BASE_URL } from '@/src/services/config'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import DOMPurify from 'dompurify'
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

  // 生成分享链接
  const getShareUrl = useCallback(
    (item: NewsItem | null) => {
      if (!item) return ''
      if (userInviteCode) {
        return `${window.location.origin}/register?invite=${userInviteCode}`
      }
      return `${window.location.origin}/?tab=news&news=${item.id}`
    },
    [userInviteCode]
  )

  const { generateImage, ImageGeneratorComponent, setOverrideQrText } =
    useNewsImageGenerator(shareNewsItem, getShareUrl(shareNewsItem))

  // 从RSS获取新闻
  const fetchRssNews = useCallback(async () => {
    try {
      const response = await fetch('https://rss.ntxdao.com/rss/clist')
      if (response.ok) {
        const xmlText = await response.text()
        const parser = new Parser({
          // 将 content:encoded 等自定义字段映射出来
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

        const rssItems: NewsItem[] = feed.items.map(
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
              // 正文优先使用 content:encoded，退化到 content/description
              content: contentEncoded || item?.content || '',
              source: 'rss'
            }
          }
        )
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
    setLoading(true)

    async function fetchApiNews() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          apiNews = data.map((item: NewsItem) => ({ ...item, source: 'api' }))
          apiNewsFetched = true
          if (rssNewsFetched) {
            setNewsItems(mergeAndSortNews(apiNews, rssNews))
            setLoading(false)
          } else {
            setNewsItems(apiNews)
          }
        } else {
          console.error('获取API新闻失败:', response.statusText)
          apiNewsFetched = true
          if (rssNewsFetched) {
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
          setNewsItems(rssNews)
          setLoading(false)
        }
      }
    }

    async function fetchRssNewsAndUpdate() {
      try {
        const fetchedRssNews = await fetchRssNews()
        rssNews = fetchedRssNews
        rssNewsFetched = true
        if (apiNewsFetched) {
          setNewsItems(mergeAndSortNews(apiNews, rssNews))
          setLoading(false)
        } else {
          setNewsItems(rssNews)
        }
      } catch (error) {
        console.error('获取RSS新闻出错:', error)
        rssNewsFetched = true
        if (apiNewsFetched) {
          setNewsItems(apiNews)
          setLoading(false)
        }
      }
    }

    fetchApiNews()
    fetchRssNewsAndUpdate()

    const timeoutId = setTimeout(() => {
      if (!apiNewsFetched && !rssNewsFetched) {
        setLoading(false)
        toast({
          title: '获取新闻超时',
          description: '请检查您的网络连接或稍后再试',
          variant: 'destructive'
        })
      } else if (!apiNewsFetched && rssNewsFetched) {
        setNewsItems(rssNews)
        setLoading(false)
      } else if (apiNewsFetched && !rssNewsFetched) {
        setNewsItems(apiNews)
        setLoading(false)
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [fetchRssNews, mergeAndSortNews])

  // 获取新闻详情
  const fetchArticleContent = useCallback(
    async (id: number) => {
      try {
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

  // URL参数处理
  useEffect(() => {
    const idStr = searchParams?.get('news')
    if (!idStr) return
    const id = Number(idStr)
    if (Number.isNaN(id) || consumedNewsId === id) return
    setConsumedNewsId(id)
    if (id >= 0) {
      fetchArticleContent(id)
    }
  }, [searchParams, consumedNewsId, fetchArticleContent])

  useEffect(() => {
    if (consumedNewsId !== null && consumedNewsId < 0 && !viewingArticle) {
      const rssArticle = newsItems.find((n) => n.id === consumedNewsId)
      if (rssArticle) {
        setCurrentArticle(rssArticle)
        setViewingArticle(true)
      }
    }
  }, [newsItems, consumedNewsId, viewingArticle])

  const handleShare = (newsItem: NewsItem) => {
    setShareNewsItem(newsItem)
    setShowShareModal(true)
  }

  // 新增的返回列表处理函数
  const handleBackToList = useCallback(() => {
    setViewingArticle(false)
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.has('news')) {
        params.delete('news')
        const qs = params.toString()
        const url = qs ? `?${qs}` : '?tab=news' // 保持在 news tab
        router.replace(url)
      }
    } catch {}
  }, [router])

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
    // RSS 文章通常是 HTML：使用 DOMPurify 清洗后以 HTML 渲染
    if (currentArticle?.source === 'rss') {
      const html = currentArticle.content || ''
      const safe = DOMPurify.sanitize(html)
      return (
        <div
          className="markdown-content"
          // 安全地注入已清洗的 HTML
          // biome-ignore lint/security/noDangerouslySetInnerHtml: RSS HTML 已通过 DOMPurify 清洗
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      )
    }

    // API 文章维持 Markdown 渲染
    return (
      <div className="markdown-content">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  // ====================================================================
  // 	文章详情页视图 (已按要求重构)
  // ====================================================================
  if (viewingArticle && currentArticle) {
    return (
      <>
        <div className="min-h-screen bg-white pb-12">
          {/* 顶部导航区域 */}
          <div className="px-4 pt-12 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {/* 返回按钮 (样式修改) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="mr-2"
                >
                  <Image src="/back.png" alt="返回" width={20} height={20} />
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

              {/* 分享按钮 (样式修改) */}
              <Button
                variant="ghost"
                onClick={() => handleShare(currentArticle)}
                className="h-auto p-1.5 rounded-md hover:bg-blue-50/50"
              >
                <div className="flex items-center gap-x-1">
                  <span className="text-xs font-medium text-[#1C55FF]">
                    分享
                  </span>
                  <Image src="/share.png" alt="分享" width={16} height={13} />
                </div>
              </Button>
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
                {currentArticle.source === 'rss' && (
                  <span className="flex items-center ml-2 text-blue-500">
                    <Rss className="w-3 h-3 mr-1" /> RSS
                  </span>
                )}
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

        {/* 分享模态框保持不变 */}
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
      </>
    )
  }

  // ====================================================================
  // 	新闻列表页视图 (保持不变)
  // ====================================================================
  return (
    <div className="min-h-screen bg-white pb-6">
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
                      {item.source === 'rss' && (
                        <span className="flex items-center ml-2 text-blue-500">
                          <Rss className="w-3 h-3 mr-1" />
                          <span>RSS</span>
                        </span>
                      )}
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
            {t('news.empty') || '暂无资讯'}
          </div>
        )}
      </div>
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
