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

export function NewsPage() {
  const newsItems = [
    {
      id: '1',
      date: '2024年7月13日',
      time: '09:00',
      title: '【市场行情】比特币突破7万美元，多头情绪高涨',
      content:
        '今日比特币价格强势突破7万美元关口，创下近期新高。市场分析师指出，宏观经济数据利好和机构资金持续流入是主要推动力，短期内多头情绪预计将继续主导市场。',
      link: '#'
    },
    {
      id: '2',
      date: '2024年7月12日',
      time: '15:30',
      title: '【NTX动态】黑马学院新增《量化交易实战》课程',
      content:
        '为满足用户对高级交易策略的需求，黑马学院正式上线《量化交易实战》课程，由资深量化专家授课，深入讲解程序化交易模型构建与优化。',
      link: '#'
    },
    {
      id: '3',
      date: '2024年7月11日',
      time: '10:45',
      title: '【行情分析】以太坊生态TVL再创新高，DeFi热度不减',
      content:
        '以太坊（ETH）生态系统总锁仓价值（TVL）持续增长，DeFi（去中心化金融）项目表现强劲。这表明市场对去中心化应用的需求旺盛，ETH有望继续领跑公链赛道。',
      link: '#'
    },
    {
      id: '4',
      date: '2024年7月10日',
      time: '18:00',
      title: '【行业新闻】Web3游戏融资活跃，GameFi迎来新机遇',
      content:
        '近期Web3游戏领域融资活动频繁，多家GameFi项目获得巨额投资。分析认为，随着技术成熟和用户认知度提升，GameFi有望成为下一个加密市场爆发点。',
      link: '#'
    },
    {
      id: '5',
      date: '2024年7月09日',
      time: '11:20',
      title: '【NTX公告】平台安全升级完成，保障用户资产安全',
      content:
        'NTX平台已完成新一轮安全系统升级，引入多重加密技术和实时风控机制，全面提升用户账户和资产的安全性，请用户放心使用。',
      link: '#'
    }
  ]

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
