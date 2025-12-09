'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import { useAuth } from '@/src/contexts/AuthContext'
import Image from 'next/image'
import { toast } from 'sonner'

interface ProfileHeaderProps {
  userInfo: UserInfo | null
}

export function ProfileHeader({ userInfo }: ProfileHeaderProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [tapCount, setTapCount] = useState(0)
  const lastTapTime = useRef(0)

  const handleCardTap = () => {
    const now = Date.now()
    // 如果距离上次点击超过 2 秒，重置计数
    if (now - lastTapTime.current > 2000) {
      setTapCount(1)
    } else {
      setTapCount((prev) => prev + 1)
    }
    lastTapTime.current = now

    if (tapCount + 1 >= 10) {
      setTapCount(0)
      showDebugInfo()
    }
  }

  const showDebugInfo = () => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.()
    const swController = navigator.serviceWorker?.controller
    const debugInfo = [
      `Platform: ${isNative ? 'Native (Capacitor)' : 'Web'}`,
      `SW Active: ${swController ? 'Yes' : 'No'}`,
      `SW URL: ${swController?.scriptURL || 'N/A'}`,
      `User Agent: ${navigator.userAgent.slice(0, 50)}...`,
      `Online: ${navigator.onLine}`,
      `App Version: ${process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'}`
    ].join('\n')

    toast.info(debugInfo, {
      duration: 10000,
      style: {
        whiteSpace: 'pre-line',
        fontSize: '12px'
      }
    })
  }

  return (
    <div className="px-6 pt-8 pb-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        {t('profile.title')}
      </h1>

      <div
        className="text-white rounded-[16pt] p-6 shadow-lg mb-4 relative cursor-pointer select-none"
        style={{
          backgroundImage: 'url(/profile-header-bg.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
          aspectRatio: '1029 / 336'
        }}
        onClick={handleCardTap}
      >
        <Image
          src="/avatar-placeholder.png"
          alt=""
          width={444}
          height={96}
          className="absolute top-0 right-0 w-[222px] h-auto opacity-80 pointer-events-none select-none"
          priority
        />
        <div className="flex items-center mb-3">
          <Avatar className="w-16 h-16 border-4 border-white/30">
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
      </div>
    </div>
  )
}
