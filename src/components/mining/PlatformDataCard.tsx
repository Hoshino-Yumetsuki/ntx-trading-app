'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Coins,
  DollarSign,
  Flame
} from 'lucide-react'
import { formatCurrency, type PlatformData } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface PlatformDataCardProps {
  platformData: PlatformData | null
  loading: boolean
}

export function PlatformDataCard({ platformData, loading }: PlatformDataCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/50">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center">
          <div className="premium-icon w-8 h-8 rounded-lg mr-3">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          {t('mining.platform.title')}
        </CardTitle>
        <p className="text-slate-600 text-sm flex items-center ml-11">
          <Clock className="w-4 h-4 mr-1" />
          {t('mining.platform.updateTime')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center data-card p-5 rounded-xl">
            <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <p
              className={`text-2xl font-bold text-yellow-600 mb-1 ${loading ? 'animate-pulse bg-gray-200 rounded h-8 w-24 mx-auto' : ''}`}
            >
              {loading
                ? ''
                : platformData
                  ? formatCurrency(platformData.total_mined, 'NTX')
                  : '--'}
            </p>
            <p className="text-slate-600 text-sm">
              {t('mining.platform.totalMined')}
            </p>
          </div>
          <div className="text-center data-card p-5 rounded-xl">
            <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {platformData
                ? formatCurrency(platformData.total_commission, 'USDT')
                : '--'}
            </p>
            <p className="text-slate-600 text-sm">
              {t('mining.platform.totalCommission')}
            </p>
          </div>
          <div className="text-center data-card p-5 rounded-xl">
            <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500 mb-1">
              {platformData
                ? formatCurrency(platformData.total_burned, 'NTX')
                : '--'}
            </p>
            <p className="text-slate-600 text-sm">
              {t('mining.platform.totalBurned')}
            </p>
          </div>
          <div className="text-center data-card p-5 rounded-xl">
            <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {platformData
                ? formatCurrency(platformData.total_trading_volume, 'USDT')
                : '--'}
            </p>
            <p className="text-slate-600 text-sm">
              {t('mining.platform.totalTradingVolume')}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h4 className="text-slate-800 font-medium mb-4 flex items-center">
            <div className="premium-icon w-6 h-6 rounded mr-2">
              <Clock className="w-3 h-3 text-blue-600" />
            </div>
            {t('mining.platform.overview')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center">
                <Coins className="w-4 h-4 mr-1 text-yellow-600" />
                {t('mining.platform.mined')}:
              </span>
              <span className="text-yellow-600 font-semibold">
                {platformData
                  ? formatCurrency(platformData.total_mined, 'NTX')
                  : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center">
                <Flame className="w-4 h-4 mr-1 text-red-500" />
                {t('mining.platform.burned')}:
              </span>
              <span className="text-red-500 font-semibold">
                {platformData
                  ? formatCurrency(platformData.total_burned, 'NTX')
                  : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                {t('mining.platform.commission')}:
              </span>
              <span className="text-green-600 font-semibold">
                {platformData
                  ? formatCurrency(platformData.total_commission, 'USDT')
                  : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-600" />
                {t('mining.platform.miners')}:
              </span>
              <span className="text-blue-600 font-semibold">
                {platformData
                  ? `${platformData.platform_users.toLocaleString()}人`
                  : '--'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
