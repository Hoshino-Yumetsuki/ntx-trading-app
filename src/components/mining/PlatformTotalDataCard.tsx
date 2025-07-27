'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Users, Coins, DollarSign, Flame } from 'lucide-react'
import {
  formatCurrency,
  formatNumber,
  type PlatformData
} from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface PlatformTotalDataCardProps {
  platformData: PlatformData | null
  loading: boolean
}

export function PlatformTotalDataCard({
  platformData,
  loading
}: PlatformTotalDataCardProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="space-y-4">
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
      {/* 主要数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 总挖矿量 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.platform.totalMined') || '总挖矿量'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatNumber(platformData?.total_mined)} NTX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 总佣金 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.platform.totalCommission') || '总佣金'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatCurrency(platformData?.total_commission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 总销毁量 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.platform.totalBurned') || '总销毁量'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatNumber(platformData?.total_burned)} NTX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 平台用户数 */}
        <Card className="glass-card border-white/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="premium-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 truncate">
                  {t('mining.platform.totalUsers') || '平台用户'}
                </p>
                <p className="text-lg font-semibold text-slate-800 truncate">
                  {formatNumber(platformData?.platform_users)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
