'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/src/components/ui/popover'
import {
  TrendingUp,
  Users,
  Coins,
  DollarSign,
  Flame,
  Calendar,
  RefreshCw
} from 'lucide-react'
import {
  formatCurrency,
  formatNumber,
  getDailyPlatformData,
  type DailyPlatformData
} from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'

interface PlatformDailyDataCardProps {
  initialDate?: string
}

// 获取昨天的日期
const getYesterdayDate = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export function PlatformDailyDataCard({
  initialDate
}: PlatformDailyDataCardProps) {
  const { t } = useLanguage()
  const dateInputId = useId()
  const [dailyData, setDailyData] = useState<DailyPlatformData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || getYesterdayDate()
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const handleRefresh = () => {
    fetchDailyData(selectedDate)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* 日期选择器加载状态 */}
        <Card className="glass-card border-white/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-200 rounded animate-pulse w-32"></div>
              <div className="h-8 bg-slate-200 rounded animate-pulse w-24"></div>
            </div>
          </CardHeader>
        </Card>

        {/* 数据卡片加载状态 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card border-white/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 日期选择器 */}
      <Card className="glass-card border-white/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {t('mining.daily.selectDate') || '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="space-y-2">
                    <label
                      htmlFor={dateInputId}
                      className="text-sm font-medium text-slate-700"
                    >
                      {t('mining.daily.selectDate') || '选择日期'}
                    </label>
                    <Input
                      id={dateInputId}
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <div className="text-lg font-medium text-slate-700">
                {formatDate(selectedDate)}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-9 w-9 p-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 日数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 挖矿产出 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.daily.miningOutput') || '挖矿产出'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatNumber(dailyData?.mining_output)} NTX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 佣金 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.daily.commission') || '佣金'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatCurrency(dailyData?.commission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 销毁量 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.daily.burned') || '销毁量'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatNumber(dailyData?.burned)} NTX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 交易量 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.daily.tradingVolume') || '交易量'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatCurrency(dailyData?.trading_volume)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 挖矿人数 */}
      <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                {t('mining.daily.miners') || '挖矿人数'}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {formatNumber(dailyData?.miners)}{' '}
                {t('mining.platform.users') || '人'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
