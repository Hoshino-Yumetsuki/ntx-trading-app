'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { TrendingUp } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'

interface GntxCardProps {
  userInfo: UserInfo | null
}

export function GntxCard({ userInfo }: GntxCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/30 overflow-hidden rounded-[16pt]">
      <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 -mb-8 -ml-8 bg-blue-500/10 rounded-full" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-slate-800 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          {t('profile.gntx.title')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-[16pt] p-4">
          <div className="text-2xl md:text-3xl font-bold text-blue-700 text-center">
            {userInfo?.gntxBalance?.toLocaleString() || '0'}{' '}
            <span className="text-blue-500">GNTX</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
