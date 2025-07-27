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
      <div className="mt-4 pt-3 border-t border-slate-200/40 flex items-center">
        <div className="flex items-center text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            <path
              fillRule="evenodd"
              d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            {t('profile.gntx.title') || 'GNTX'}:
          </span>
        </div>
        <span className="ml-2 font-bold text-blue-700">
          {userInfo?.gntxBalance?.toLocaleString() || '0'}{' '}
          <span className="text-xs font-normal text-blue-500">GNTX</span>
        </span>
      </div>
    </div>
  )
}
