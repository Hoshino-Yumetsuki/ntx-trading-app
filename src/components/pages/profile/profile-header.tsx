'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
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
    <div className="px-6 pt-8 pb-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        {t('profile.title') || '个人中心'}
      </h1>
      
      {/* 用户信息卡片，使用蓝色背景 */}
      <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg mb-4">
        <div className="flex items-center mb-4">
          <Avatar className="w-16 h-16 border-4 border-white/30">
            <AvatarImage src="/placeholder.svg?height=80&width=80" />
            <AvatarFallback className="bg-blue-700 text-white text-xl font-bold">
              {(userInfo?.nickname || user?.nickname || 'U')
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h2 className="text-xl font-bold">
              {userInfo?.nickname || user?.nickname || 'User'}
            </h2>
            <p className="text-blue-100 text-sm">
              ID: {userInfo?.id || user?.id || 'N/A'}
            </p>
          </div>
        </div>
        
        {/* 经验条和用户角色 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-blue-100 mb-1">
            <span>EXP: {userInfo?.exp || 0}</span>
            <span>{userInfo?.role || 'Normal User'}</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full" 
              style={{
                width: `${Math.min(((userInfo?.exp || 0) / 100) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
        
        {/* 邮箱信息 */}
        <div className="text-sm text-left">
          <p className="text-blue-100">
            {t('profile.email')}：{userInfo?.email || user?.email || 'N/A'}
          </p>
        </div>
      </div>
      
      {/* GNTX 余额信息 */}
      <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex items-center text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 mr-2"
            role="img"
            aria-label="GNTX token icon"
          >
            <title>GNTX Token</title>
            <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            <path
              fillRule="evenodd"
              d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            {t('profile.gntx.title') || 'GNTX 余额'}: 
          </span>
        </div>
        <span className="ml-2 font-bold text-blue-700">
          {userInfo?.gntxBalance?.toLocaleString() || '0'}{' '}
          <span className="text-sm font-normal text-blue-500">GNTX</span>
        </span>
      </div>
    </div>
  )
}
