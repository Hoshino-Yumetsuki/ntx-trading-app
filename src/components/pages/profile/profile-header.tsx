'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import { useAuth } from '@/src/contexts/AuthContext'
import Image from 'next/image'

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

      {/* 用户信息卡片，使用图片背景 */}
      <div
        className="text-white rounded-[16pt] p-6 shadow-lg mb-4 relative"
        style={{
          backgroundImage: 'url(/Group72@3x.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
          aspectRatio: '1029 / 336'
        }}
      >
        {/* 右上角装饰 */}
        <Image
          src="/Frame29@3x.png"
          alt=""
          width={444}
          height={96}
          className="absolute top-0 right-0 w-[222px] h-auto opacity-80 pointer-events-none select-none"
          priority
        />
        <div className="flex items-center mb-3">
          <Avatar className="w-16 h-16 border-4 border-white/30">
            {/* <AvatarImage src="/placeholder.svg?height=80&width=80" /> */}
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

        {/* 邮箱信息 */}
        <div className="flex items-center text-blue-100 text-sm pl-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 mr-2 opacity-80"
            role="img"
            aria-label="邮箱图标"
          >
            <title>邮箱图标</title>
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
          {userInfo?.email || user?.email || 'N/A'}
        </div>
      </div>
    </div>
  )
}
