'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/src/contexts/AuthContext'
import { UserService } from '@/src/services/user'
import type { UserInfo } from '@/src/types/user'
import { toast } from 'sonner'
import { useLanguage } from '@/src/contexts/language-context'
import { SecuritySettings } from '@/src/components/pages/profile/security-settings'
import AssetsPage from '@/src/components/pages/profile/assets'
import CommunityPage from '@/src/components/pages/profile/community'
import { BrokerPage } from '@/src/components/pages/broker'
import { OrdersPage } from '@/src/components/pages/orders'
import {
  ProfileHeader,
  InviteCodeCard,
  UserInfoCard,
  QuickActionsCard,
  ContactCard,
  LogoutCard,
  RewardsCard,
  StakeCard
} from '@/src/components/pages/profile/index'

interface ProfilePageProps {
  onNavigate?: (tab: string) => void
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const communityArrowId = useId()
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<
    'profile' | 'security' | 'assets' | 'community' | 'broker' | 'orders'
  >('profile')

  const fetchUserInfo = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const info = await UserService.getUserInfo()
      setUserInfo(info)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      toast.error('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success(t('common.loggedOut'))
      try {
        localStorage.setItem('ntx-active-tab', 'home')
      } catch {}
      router.push('/')
    } catch (_error) {
      toast.error('退出登录失败')
    }
  }

  const handleNavigate = (
    page: 'assets' | 'security' | 'community' | 'broker' | 'orders' | 'mission'
  ) => {
    if (page === 'mission') {
      if (onNavigate) {
        onNavigate('mission')
      } else {
        router.push('/?tab=mission')
      }
      return
    }
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 'security') {
    return (
      <SecuritySettings
        onBack={() => setCurrentPage('profile')}
        userInfo={userInfo}
        refetchUserInfo={fetchUserInfo}
      />
    )
  }

  if (currentPage === 'assets') {
    return (
      <AssetsPage
        onBack={() => setCurrentPage('profile')}
        userInfo={userInfo}
        onNavigate={handleNavigate}
      />
    )
  }

  if (currentPage === 'community') {
    return <CommunityPage onBack={() => setCurrentPage('profile')} />
  }

  if (currentPage === 'broker') {
    return <BrokerPage onBack={() => setCurrentPage('profile')} />
  }

  if (currentPage === 'orders') {
    return <OrdersPage onBack={() => setCurrentPage('profile')} />
  }

  return (
    <div className="min-h-screen pb-6">
      <ProfileHeader userInfo={userInfo} />
      <div className="px-6 space-y-4 -mt-4">
        <UserInfoCard userInfo={userInfo} />
        <button
          type="button"
          className="relative w-full rounded-[16pt] overflow-hidden cursor-pointer select-none transition active:scale-[.99]"
          onClick={() => handleNavigate('community')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigate('community')
            }
          }}
        >
          <div className="pt-[21%]"></div>
          <Image
            src="/Group34385@3x.png"
            alt={t('profile.community.title')}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 flex items-center justify-between">
            <div className="pl-4 md:pl-6">
              <span className="text-white text-lg font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {t('profile.community.title')}
              </span>
            </div>
            <div className="pr-4 md:pr-6 flex items-center">
              <span className="text-white text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] mr-1">
                {t('common.clickToEnter', '点击进入')}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                role="img"
                aria-labelledby={communityArrowId}
              >
                <title id={communityArrowId}>进入社区页面</title>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </button>

        <InviteCodeCard userInfo={userInfo} />
        <RewardsCard userInfo={userInfo} onNavigate={handleNavigate} />
        <StakeCard userInfo={userInfo} onNavigate={handleNavigate} />
        <QuickActionsCard onNavigate={handleNavigate} />
        <ContactCard />
        <LogoutCard onLogout={handleLogout} />
      </div>
    </div>
  )
}
