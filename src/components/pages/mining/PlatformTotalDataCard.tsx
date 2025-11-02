'use client'

import { Hammer, Database, User } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="data-card p-5 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/Group69@3x.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '96px'
          }}
        >
          <Hammer className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-sm text-[#4D576A] mb-1">
            {t('mining.platform.totalMined') || '总挖矿量'}
          </p>
          <p
            className={`text-[14pt] font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-7 w-28' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.total_mined !== undefined
                ? formatCurrency(platformData.total_mined, 'NTX')
                : '--'}
          </p>
        </div>

        <div
          className="data-card p-5 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/Group69@3x.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '96px'
          }}
        >
          <Database className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-sm text-[#4D576A] mb-1">
            {t('mining.platform.totalBurned') || '总销毁量'}
          </p>
          <p
            className={`text-[14pt] font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-7 w-28' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.total_burned !== undefined
                ? formatCurrency(platformData.total_burned, 'NTX')
                : '--'}
          </p>
        </div>

        <div
          className="data-card p-5 rounded-xl text-left"
          style={{
            border: 'none',
            backgroundImage: 'url(/Group69@3x.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: '96px'
          }}
        >
          <User className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-sm text-[#4D576A] mb-1">
            {t('mining.platform.totalUsers') || '平台用户'}
          </p>
          <p
            className={`text-[14pt] font-din-black text-[#4D576A] ${loading ? 'animate-pulse bg-gray-200 rounded h-7 w-28' : ''}`}
          >
            {loading
              ? ''
              : platformData && platformData.platform_users !== undefined
                ? formatNumber(platformData.platform_users)
                : '--'}
          </p>
        </div>
      </div>
    </div>
  )
}
