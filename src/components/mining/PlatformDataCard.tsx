'use client'

import { PlatformTotalDataCard } from './PlatformTotalDataCard'
import { PlatformDailyDataCard } from './PlatformDailyDataCard'
import type { PlatformData } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface PlatformDataCardProps {
  platformData: PlatformData | null
  loading: boolean
}

export function PlatformDataCard({
  platformData,
  loading
}: PlatformDataCardProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      {/* 平台总数据区域 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-800">
            {t('mining.platform.totalDataTitle') || '平台总数据'}
          </h3>
        </div>
        <PlatformTotalDataCard platformData={platformData} loading={loading} />
      </div>

      {/* 平台日数据区域 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-800">
            {t('mining.platform.dailyDataTitle') || '平台日数据'}
          </h3>
        </div>
        <PlatformDailyDataCard />
      </div>
    </div>
  )
}
