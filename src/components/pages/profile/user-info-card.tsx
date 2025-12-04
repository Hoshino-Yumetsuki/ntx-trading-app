'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import type { UserInfo } from '@/src/types/user'
import Image from 'next/image'
import { useLanguage } from '@/src/contexts/language-context'

interface UserInfoCardProps {
  userInfo: UserInfo | null
}

export function UserInfoCard({ userInfo }: UserInfoCardProps) {
  const { t } = useLanguage()
  const invites = userInfo?.invitedUserCount ?? 0
  const brokerProgress = Math.min(invites / 100, 1)
  const brokerPercent = Math.floor(brokerProgress * 100)
  const remainingInvites = Math.max(0, 100 - invites)

  return (
    <Card className="glass-card border-white/30 relative rounded-[16pt] transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:border-blue-200/50 hover:scale-[1.01]">
      <Image
        src="/avatar-placeholder.png"
        alt=""
        width={444}
        height={96}
        className="absolute top-0 right-0 w-[180px] h-auto opacity-80 pointer-events-none select-none"
        priority
      />

      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-slate-800 flex items-center"></CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-base font-medium text-slate-800">
            {t('profile.userInfo.memberRole')}：
            <span className="text-green-600">
              {userInfo?.role || 'Normal User'}
            </span>
          </div>
          <div className="text-sm text-slate-700">
            {t('profile.userInfo.gntxHolding')}：
            {userInfo?.gntxBalance?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-slate-700">
            {t('profile.userInfo.invitedCount')}：
            <span className="text-blue-600">
              {(userInfo?.invitedUserCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-[16pt] p-4">
          <div className="mt-4">
            <div className="text-sm text-slate-700 mb-1">
              {t('profile.userInfo.toBroker')}
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${brokerPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {brokerPercent}% {t('profile.userInfo.completed')}
            </div>
            <div className="text-xs text-slate-600 mt-1 text-right">
              {t('profile.userInfo.needMore')}{' '}
              <span className="text-blue-600">
                {remainingInvites.toLocaleString()}
              </span>{' '}
              {t('profile.userInfo.people')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
