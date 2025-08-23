'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Award, TrendingUp } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'

interface UserInfoCardProps {
  userInfo: UserInfo | null
}

export function UserInfoCard({ userInfo }: UserInfoCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 -mb-8 -ml-8 bg-blue-500/10 rounded-full" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-slate-800 flex items-center"></CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 经验和用户组 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex justify-between text-sm text-slate-700 mb-1">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-blue-600" />
              <span>EXP: {userInfo?.exp || 0}</span>
            </div>
            <span className="font-medium">
              {userInfo?.role || 'Normal User'}
            </span>
          </div>
          <div className="h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${Math.min(((userInfo?.exp || 0) / 100) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>

        {/* GNTX 资产 */}
        <div className="flex flex-col">
          <div className="flex items-center text-slate-700 mb-2">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium">
              {t('profile.gntx.title') || 'GNTX 资产'}：
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {userInfo?.gntxBalance?.toLocaleString() || '0'}{' '}
            <span className="text-blue-500 text-sm font-normal">GNTX</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
