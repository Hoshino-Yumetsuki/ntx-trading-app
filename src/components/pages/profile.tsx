'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/src/contexts/AuthContext'
import { UserService } from '@/src/services/user'
import type { UserInfo } from '@/src/types/user'
import { toast } from 'sonner'
import { SecuritySettings } from '@/src/components/pages/profile/security-settings'
import AssetsPage from '@/src/components/pages/profile/assets'
import {
  ProfileHeader,
  InviteCodeCard,
  StatsCard,
  UserInfoCard,
  QuickActionsCard,
  ContactCard,
  LogoutCard
} from '@/src/components/pages/profile/index'

export function ProfilePage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<
    'profile' | 'security' | 'assets'
  >('profile')

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await UserService.getUserInfo()
        setUserInfo(info)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        toast.error('获取用户信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('已退出登录')
      // 回到首页标签并跳转到根路径
      try {
        localStorage.setItem('ntx-active-tab', 'home')
      } catch {}
      router.push('/')
    } catch (error) {
      console.error('退出登录失败:', error)
      toast.error('退出登录失败')
    }
  }

  const handleNavigate = (page: 'assets' | 'security') => {
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

  // 如果当前页面是安全设置，渲染安全设置组件
  if (currentPage === 'security') {
    return <SecuritySettings onBack={() => setCurrentPage('profile')} />
  }

  // 如果当前页面是资产页面，渲染资产页面组件
  if (currentPage === 'assets') {
    return <AssetsPage onBack={() => setCurrentPage('profile')} />
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Profile Header */}
      <ProfileHeader userInfo={userInfo} />

      <div className="px-6 space-y-4 -mt-4">
        {/* User Info Card - 新增的用户信息卡片 */}
        <UserInfoCard userInfo={userInfo} />

        {/* 我的社区 图片卡片 */}
        <div className="relative w-full rounded-[16pt] overflow-hidden">
          {/* 1029:216 比例占位 */}
          <div className="pt-[21%]"></div>
          {/* 背景图 */}
          <Image
            src="/Group34385@3x.png"
            alt="我的社区"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* 左侧文字覆盖 */}
          <div className="absolute inset-0 flex items-center">
            <div className="pl-4 md:pl-6">
              <span className="text-white text-lg font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                我的社区
              </span>
            </div>
          </div>
        </div>

        {/* Invite Code Card */}
        <InviteCodeCard userInfo={userInfo} />

        {/* Stats Card */}
        <StatsCard userInfo={userInfo} />

        {/* Quick Actions Card */}
        <QuickActionsCard onNavigate={handleNavigate} />

        {/* Contact Card */}
        <ContactCard />

        {/* Logout Card */}
        <LogoutCard onLogout={handleLogout} />
      </div>

      <div className="text-center text-slate-500 text-sm">
        <p>NTX v1.0.0</p>
        <p> 2024 NTX Trading Platform</p>
      </div>
    </div>
  )
}
