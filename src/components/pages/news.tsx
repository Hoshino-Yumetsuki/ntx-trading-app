'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Newspaper, Share2, Clock, ChevronLeft } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast'
import { useLanguage } from '@/src/contexts/language-context'
import { API_BASE_URL } from '@/src/services/config'
import Image from 'next/image'
import MarkdownIt from 'markdown-it'
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
}

export function NewsPage() {
  const { t } = useLanguage()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentArticle, setCurrentArticle] = useState<NewsItem | null>(null)
  const [viewingArticle, setViewingArticle] = useState(false)

  // 获取新闻列表
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data = await response.json()
          setNewsItems(data)
        } else {
          console.error('获取新闻失败:', response.statusText)
        }
      } catch (error) {
        console.error('获取新闻出错:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // 获取新闻详情
  const fetchArticleContent = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/academy/articles/${id}`
      )
      if (response.ok) {
        const data = await response.json()
        console.log('Article content received:', data)
        setCurrentArticle(data)
        setViewingArticle(true)
      } else {
        toast({
          title: t('news.error.title') || '获取失败',
          description: t('news.error.description') || '无法获取文章内容',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('获取文章详情失败:', error)
      toast({
        title: t('news.error.title') || '获取失败',
        description: t('news.error.description') || '无法获取文章内容',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async (newsItem: NewsItem) => {
    const shareData = {
      title: newsItem.title,
      text: newsItem.summary,
      url: `${window.location.origin}/news/${newsItem.id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        )
        toast({
          title: t('news.share.success') || '分享成功',
          description: t('news.share.success.desc') || '链接已复制到剪贴板'
        })
      }
    } catch (error) {
      console.error('分享失败:', error)
      toast({
        title: t('news.share.failed') || '分享失败',
        description: t('news.share.failed.desc') || '无法分享此文章',
        variant: 'destructive'
      })
    }
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
          </div>
        </div>

        <div className="px-6 py-4">
          <Card className="glass-card border-white/30 overflow-hidden">
            {currentArticle.imageUrl && (
              <div className="w-full h-48 overflow-hidden relative">
                <Image
                  src={currentArticle.imageUrl}
                  alt={currentArticle.title}
                  className="object-cover"
                  fill
                  sizes="100vw"
                  priority
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="max-w-none">
                {renderMarkdownContent(currentArticle.content || '')}
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                  onClick={() => handleShare(currentArticle)}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  {t('news.share') || '分享'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {t('news.title') || '资讯中心'}
            </h1>
          </div>
          <div className="premium-icon w-8 h-8 rounded-lg">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="px-6 mt-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            {t('news.loading') || '加载中...'}
          </div>
        ) : newsItems.length > 0 ? (
          <div className="space-y-3">
            {newsItems.map((item, _index) => (
              <Card
                key={item.id}
                className="glass-card border-white/20 hover:border-white/40 transition-all cursor-pointer"
                onClick={() => fetchArticleContent(item.id)}
              >
                <div className="flex p-3">
                  <div className="flex-1 pr-3">
                    <h3 className="text-slate-800 font-medium text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center text-slate-500 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(item.publishDate)}</span>
                    </div>
                  </div>
                  {item.imageUrl && (
                    <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={64}
                        height={64}
                        className="object-cover"
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
    </div>
  )
}
