'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Award, TrendingUp, Users, DollarSign } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'

interface StatsCardProps {
  userInfo: UserInfo | null
}

export function StatsCard({ userInfo }: StatsCardProps) {
  const { t } = useLanguage()

  const stats = [
    {
      label: t('profile.stats.ntxBalance'),
      value: `${userInfo?.ntxBalance?.toLocaleString() || '0'} NTX`,
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      label: t('profile.stats.usdtBalance'),
      value: `$${userInfo?.usdtBalance?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: t('profile.stats.gntxBalance'),
      value: `${userInfo?.gntxBalance?.toLocaleString() || '0'} GNTX`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: t('profile.stats.referrals'),
      value: `${userInfo?.invitedUserCount || 0}`,
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  return (
    <Card className="glass-card border-white/30">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.stats.totalReward')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center data-card p-5 rounded-lg">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`text-lg font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-slate-600 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
