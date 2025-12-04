'use client'

import { useState } from 'react'
import { PlatformTotalDataCard } from './PlatformTotalDataCard'
import { PlatformDailyDataCard } from './PlatformDailyDataCard'
import type { PlatformData } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import { Input } from '@/src/components/ui/input'

interface PlatformDataCardProps {
  platformData: PlatformData | null
  loading: boolean
}

export function PlatformDataCard({
  platformData,
  loading
}: PlatformDataCardProps) {
  const { t } = useLanguage()
  const getYesterdayDate = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDate())

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-base font-medium text-slate-700 mb-3">
          {t('mining.platform.totalDataTitle')}
        </h3>
        <PlatformTotalDataCard platformData={platformData} loading={loading} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-medium text-slate-700">
            {t('mining.platform.dailyDataTitle')}
          </h3>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="h-9 w-auto"
            />
          </div>
        </div>
        <PlatformDailyDataCard selectedDate={selectedDate} />
      </div>
    </div>
  )
}
