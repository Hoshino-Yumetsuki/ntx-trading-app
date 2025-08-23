'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  formatCurrency,
  formatNumber,
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
        console.error('获取平台日数据失败:', error)
        toast.error(t('mining.error.dailyDataFailed') || '获取平台日数据失败')
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
        {/* 列表加载状态 */}
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
      {/* 日数据纵向列表（无图标，默认字体） */}
      <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* 挖矿产出 */}
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.miningOutput') || '挖矿产出'}
            </span>
            <span className="text-base text-slate-800">
              {dailyData && dailyData.mining_output !== undefined
                ? formatCurrency(dailyData.mining_output, 'NTX')
                : '--'}
            </span>
          </div>

          {/* 销毁量 */}
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.burned') || '销毁量'}
            </span>
            <span className="text-base text-slate-800">
              {dailyData && dailyData.burned !== undefined
                ? formatCurrency(dailyData.burned, 'NTX')
                : '--'}
            </span>
          </div>

          {/* 佣金 - 已隐藏 */}
          {/*
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.commission') || '佣金'}
            </span>
            <span className="text-base text-slate-800">
              {dailyData && dailyData.commission !== undefined
                ? formatCurrency(dailyData.commission, 'USDT')
                : '--'}
            </span>
          </div>
          */}

          {/* 交易量 - 已隐藏 */}
          {/*
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.tradingVolume') || '交易量'}
            </span>
            <span className="text-base text-slate-800">
              {dailyData && dailyData.trading_volume !== undefined
                ? formatCurrency(dailyData.trading_volume, 'USDT')
                : '--'}
            </span>
          </div>
          */}

          {/* 挖矿人数 */}
          <div className="flex items-center justify-between py-4 px-4">
            <span className="text-sm text-[#4D576A]">
              {t('mining.daily.miners') || '挖矿人数'}
            </span>
            <span className="text-base text-slate-800">
              {dailyData && dailyData.miners !== undefined
                ? formatNumber(dailyData.miners)
                : '--'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
