'use client'

import { Hammer, Database, User } from 'lucide-react'
import {
  formatCurrency,
  formatInteger,
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          className="data-card p-4 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/card-glow-bg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '80px'
          }}
        >
          <Hammer className="w-7 h-7 text-blue-600 mb-2" />
          <p className="text-xs text-[#4D576A] mb-1">
            {t('mining.platform.totalMined')}
          </p>
          <p
            className={`text-sm font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-6 w-24' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.total_mined !== undefined
                ? formatCurrency(platformData.total_mined, 'NTX')
                : '--'}
          </p>
        </div>

        <div
          className="data-card p-4 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/card-glow-bg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '80px'
          }}
        >
          <Database className="w-7 h-7 text-blue-600 mb-2" />
          <p className="text-xs text-[#4D576A] mb-1">
            {t('mining.platform.totalBurned')}
          </p>
          <p
            className={`text-sm font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-6 w-24' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.total_burned !== undefined
                ? formatCurrency(platformData.total_burned, 'NTX')
                : '--'}
          </p>
        </div>

        <div
          className="data-card p-4 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/card-glow-bg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '80px'
          }}
        >
          <User className="w-7 h-7 text-blue-600 mb-2" />
          <p className="text-xs text-[#4D576A] mb-1">
            {t('mining.platform.totalUsers')}
          </p>
          <p
            className={`text-sm font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-6 w-24' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.platform_users !== undefined
                ? formatInteger(platformData.platform_users)
                : '--'}
          </p>
        </div>
      </div>
    </div>
  )
}
