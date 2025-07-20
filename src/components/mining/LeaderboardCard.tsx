'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Trophy } from 'lucide-react'
import { formatCurrency, type LeaderboardItem } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface LeaderboardCardProps {
  leaderboard: LeaderboardItem[]
  leaderboardLoading: boolean
}

export function LeaderboardCard({ leaderboard, leaderboardLoading }: LeaderboardCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/50">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center">
          <div className="premium-icon w-8 h-8 rounded-lg mr-3">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          {t('mining.leaderboard.title')}
        </CardTitle>
        <p className="text-slate-600 text-sm ml-11">
          {t('mining.leaderboard.description')}
        </p>
      </CardHeader>
      <CardContent>
        {leaderboardLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 data-card rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 data-card rounded-xl hover:bg-white/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.nickname}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.email_masked}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-600">
                    {formatCurrency(item.mining_amount, 'NTX')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {t('mining.leaderboard.noData')}
            </p>
            <p className="text-sm text-gray-400">
              {t('mining.leaderboard.tryLater')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
