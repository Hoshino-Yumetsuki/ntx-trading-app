'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { getRecentNews } from '@/src/data/news-data'

interface RecentNotificationsProps {
  onViewMore: () => void
}

export function RecentNotifications({ onViewMore }: RecentNotificationsProps) {
  const recentNews = getRecentNews(3)

  return (
    <div className="px-6 py-4">
      <Card className="glass-card border-white/50">
        <CardContent className="p-4">
          <h3 className="text-slate-800 font-semibold text-base mb-3">
            最新公告
          </h3>
          <ul className="space-y-2">
            {recentNews.map((item) => (
              <li
                key={item.id}
                className="text-slate-700 text-sm flex items-center"
              >
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
