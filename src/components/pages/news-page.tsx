'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Newspaper, Share2, Clock } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast' // Assuming useToast is available for notifications
import { newsItems, } from '@/src/data/news-data' // 导入统一的新闻数据

export function NewsPage() {
  const handleShare = async (newsItem: (typeof newsItems)[0]) => {
    const shareData = {
      title: newsItem.title,
      text: newsItem.content,
      url: window.location.origin + newsItem.link // Use current origin for example
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback for browsers that do not support Web Share API
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        )
        toast({
          title: '链接已复制',
          description: '新闻内容已复制到剪贴板，您可以手动分享。'
        })
      }
    } catch (error) {
      console.error('分享失败:', error)
      toast({
        title: '分享失败',
        description: '无法分享新闻，请稍后再试。',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">新闻中心</h1>
            <p className="text-slate-600 text-sm">获取最新平台动态与市场资讯</p>
          </div>
          <div className="premium-icon w-8 h-8 rounded-lg">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-5">
        {newsItems.map((item, index) => (
          <div key={item.id} className="flex relative">
            <div className="flex flex-col items-center mr-4">
              <div className="premium-icon w-6 h-6 rounded-full flex-shrink-0 z-20 shadow-md border border-blue-200">
                <Clock className="w-3 h-3 text-blue-600" />
              </div>
              {index < newsItems.length - 1 && (
                <div className="w-0.5 bg-gradient-to-b from-blue-400 to-blue-200 flex-grow mt-2 mb-2 z-10"></div>
              )}
            </div>

            <Card className="glass-card border-white/50 flex-1 data-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-800 text-lg font-semibold">
                  {item.title}
                </CardTitle>
                <div className="flex items-center text-slate-500 text-xs mt-1">
                  <span>{item.date}</span>
                  <span className="mx-2">•</span>
                  <span>{item.time}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {item.content}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                    onClick={() => handleShare(item)}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
