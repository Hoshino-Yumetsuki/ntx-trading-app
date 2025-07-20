'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import { useAuth } from '@/src/contexts/AuthContext'

interface ProfileHeaderProps {
  userInfo: UserInfo | null
}

export function ProfileHeader({ userInfo }: ProfileHeaderProps) {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src="/placeholder.svg?height=80&width=80" />
          <AvatarFallback className="glass-card text-slate-700 text-2xl font-bold">
            {(userInfo?.nickname || user?.nickname || 'U')
              .charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-slate-800 text-xl font-bold mb-1">
            {userInfo?.nickname || user?.nickname || 'User'}
          </h2>
          <div className="flex items-center space-x-2 mb-2">
            <Badge className="bg-blue-100/80 text-blue-700 border-blue-300">
              {userInfo?.role || 'Normal User'}
            </Badge>
            <Badge className="bg-green-100/80 text-green-700 border-green-300">
              EXP: {userInfo?.exp || 0}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm">
            {t('profile.email')}：{userInfo?.email || user?.email || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
