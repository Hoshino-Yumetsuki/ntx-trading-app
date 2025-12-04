'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  formatCurrency,
  formatInteger,
  getDailyPlatformData,
  type DailyPlatformData
} from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'

interface PlatformDailyDataCardProps {
  selectedDate: string
}

export function PlatformDailyDataCard({
  selectedDate
}: PlatformDailyDataCardProps) {
  const { t } = useLanguage()
  const [dailyData, setDailyData] = useState<DailyPlatformData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDailyData = useCallback(
    async (date: string) => {
      setLoading(true)
      try {
        const data = await getDailyPlatformData(date)
        setDailyData(data)
      } catch (error) {
        console.error('Failed to fetch daily platform data:', error)
        toast.error(t('mining.error.dailyDataFailed'))
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  useEffect(() => {
    fetchDailyData(selectedDate)
  }, [selectedDate, fetchDailyData])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="glass-card border-white/50">
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-4 px-4 border-b last:border-b-0"
              >
                <div className="h-4 bg-slate-200 rounded animate-pulse w-24" />
                <div className="h-6 bg-slate-200 rounded animate-pulse w-28" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.miningOutput')}
            </span>
            <span className="text-sm text-slate-800">
              {dailyData && dailyData.mining_output !== undefined
                ? formatCurrency(dailyData.mining_output, 'NTX')
                : '--'}
            </span>
          </div>

          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.burned')}
            </span>
            <span className="text-sm text-slate-800">
              {dailyData && dailyData.burned !== undefined
                ? formatCurrency(dailyData.burned, 'NTX')
                : '--'}
            </span>
          </div>

          <div className="flex items-center justify-between py-4 px-4">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.miners')}
            </span>
            <span className="text-sm text-slate-800">
              {dailyData && dailyData.miners !== undefined
                ? formatInteger(dailyData.miners)
                : '--'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
