"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface RecentNotificationsProps {
  onViewMore: () => void
}

export function RecentNotifications({ onViewMore }: RecentNotificationsProps) {
  // This data should ideally come from a shared source or API with NewsPage
  // For now, hardcoding to match the new NewsPage content for demonstration
  const allNewsItems = [
    {
      id: "1",
      title: "【市场行情】比特币突破7万美元，多头情绪高涨",
    },
    {
      id: "2",
      title: "【NTX动态】黑马学院新增《量化交易实战》课程",
    },
    {
      id: "3",
      title: "【行情分析】以太坊生态TVL再创新高，DeFi热度不减",
    },
    {
      id: "4",
      title: "【行业新闻】Web3游戏融资活跃，GameFi迎来新机遇",
    },
    {
      id: "5",
      title: "【NTX公告】平台安全升级完成，保障用户资产安全",
    },
  ]

  const recentNews = allNewsItems.slice(0, 3) // Get only the 3 most recent items

  return (
    <div className="px-6 py-4">
      <Card className="glass-card border-white/50">
        <CardContent className="p-4">
          <h3 className="text-slate-800 font-semibold text-base mb-3">最新公告</h3>
          <ul className="space-y-2">
            {recentNews.map((item) => (
              <li key={item.id} className="text-slate-700 text-sm flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                <span className="truncate">{item.title}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 mt-3"
            onClick={onViewMore}
          >
            查看更多
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
