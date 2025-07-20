'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import {
  Shield,
  LogOut,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  Copy,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'
import { UserService } from '@/src/services/user'
import type { UserInfo } from '@/src/types/user'
import { toast } from 'sonner'
import { SecuritySettings } from '@/src/components/subpages/security-settings'
import { AssetsPage } from '@/src/components/subpages/assets'
import { useLanguage } from '@/src/contexts/language-context'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
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

    if (user) {
      fetchUserInfo()
    }
  }, [user])

  const handleLogout = () => {
    logout()
  }

  const copyInviteCode = () => {
    if (userInfo?.myInviteCode) {
      navigator.clipboard.writeText(userInfo.myInviteCode)
      toast.success(t('profile.copy.success'))
    }
  }

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

  const menuItems = [
    {
      icon: DollarSign,
      label: t('profile.menu.assets'),
      description: t('profile.menu.assets.description'),
      onClick: () => setCurrentPage('assets')
    },
    {
      icon: Shield,
      label: t('profile.menu.security'),
      description: t('profile.menu.security.description'),
      onClick: () => setCurrentPage('security')
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('profile.loading')}</p>
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
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" />
            <AvatarFallback className="glass-card text-slate-700 text-2xl font-bold">
              {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
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

      <div className="px-6 mt-6 space-y-6">
        {/* 邀请码卡片 */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">
              {t('profile.inviteCode')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  {t('profile.inviteCode.description')}
                </p>
                <p className="text-lg font-mono font-bold text-blue-600">
                  {userInfo?.myInviteCode || 'Loading...'}
                </p>
              </div>
              <Button
                size="sm"
                onClick={copyInviteCode}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!userInfo?.myInviteCode}
              >
                <Copy className="w-4 h-4 mr-1" />
                {t('profile.copy')}
              </Button>
            </div>
            {userInfo?.invitedBy && (
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  {t('profile.inviteCode.invitedBy')}：{userInfo.invitedBy}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
                  <div
                    key={index}
                    className="text-center data-card p-5 rounded-lg"
                  >
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

        {/* 钱包地址卡片 */}
        {userInfo?.bscAddress && (
          <Card className="glass-card border-white/30">
            <CardHeader>
              <CardTitle className="text-slate-800">
                {t('profile.wallet.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {t('profile.wallet.bscAddress')}
                    </p>
                    <p className="text-sm font-mono text-gray-800 break-all">
                      {userInfo.bscAddress}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(userInfo.bscAddress)
                      toast.success(t('profile.copy.address'))
                    }}
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t('profile.copy')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">
              {t('profile.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  type="button"
                  className="flex items-center justify-between p-4 glass-card rounded-lg hover:bg-white/40 transition-all cursor-pointer w-full text-left"
                  onClick={item.onClick}
                >
                  <div className="flex items-center space-x-3">
                    <div className="premium-icon w-10 h-10 rounded-lg">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">{item.label}</p>
                      <p className="text-slate-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* 联系方式卡片 */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">
              {t('profile.contact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/40 transition-all">
              <div className="flex items-center space-x-3">
                <div className="premium-icon w-10 h-10 rounded-lg">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <title>Twitter Icon</title>
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-800 font-medium">
                    {t('profile.contact.twitter')}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {t('profile.contact.twitter.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 text-sm">@NexTradeDao</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('@NexTradeDao')
                    toast.success('已复制到剪贴板')
                  }}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/40 transition-all">
              <div className="flex items-center space-x-3">
                <div className="premium-icon w-10 h-10 rounded-lg">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <title>Telegram Icon</title>
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 9.728-.896 9.728-.379 3.008-1.405 3.538-2.898 2.928 0 0-1.388-.63-3.659-1.947-1.066-.622-1.858-1.003-2.936-1.595-.633-.347-1.097-.608-1.371-1.003-.274-.394-.137-.622.137-.896.274-.274 3.659-3.384 7.318-6.768.274-.274.411-.685.137-.959-.274-.274-.685-.137-.959.137L8.16 15.84s-1.388 1.388-3.659 2.018c-.959.274-1.858-.137-1.858-.137s-1.388-.959-.137-2.018c0 0 6.768-4.892 9.728-7.043 1.388-1.003 2.936-1.388 2.936-1.388s1.858-.685 1.858 1.888z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-800 font-medium">
                    {t('profile.contact.telegram.title')}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {t('profile.contact.telegram.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 text-sm">@NexTradeDao</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('@NexTradeDao')
                    toast.success('已复制到剪贴板')
                  }}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/30">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50/50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t('profile.logout')}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-slate-500 text-sm">
          <p>NTX v1.0.0</p>
          <p>© 2024 NTX Trading Platform</p>
        </div>
      </div>
    </div>
  )
}
