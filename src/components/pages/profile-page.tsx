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
  HelpCircle,
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
import { AssetsPage } from '@/src/components/subpages/assets-page'

export function ProfilePage() {
  const { user, logout } = useAuth()
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
      toast.success('邀请码已复制到剪贴板')
    }
  }

  const stats = [
    {
      label: 'NTX 余额',
      value: `${userInfo?.ntxBalance?.toLocaleString() || '0'} NTX`,
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      label: 'USDT 余额',
      value: `$${userInfo?.usdtBalance?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'GNTX 余额',
      value: `${userInfo?.gntxBalance?.toLocaleString() || '0'} GNTX`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: '推荐用户',
      value: `${userInfo?.invitedUserCount || 0}`,
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  const menuItems = [
    {
      icon: DollarSign,
      label: '我的资产',
      description: '查看我的资产',
      onClick: () => setCurrentPage('assets')
    },
    {
      icon: Shield,
      label: '安全中心',
      description: '密码和安全验证',
      onClick: () => setCurrentPage('security')
    },
    {
      icon: HelpCircle,
      label: '帮助中心',
      description: '常见问题和客服',
      onClick: () => {}
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户信息中...</p>
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
              {userInfo?.nickname || user?.nickname || '用户'}
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
              邮箱：{userInfo?.email || user?.email || 'N/A'}
            </p>
          </div>
          <Button
            size="sm"
            className="glass-card text-slate-700 border-slate-300 bg-white/50"
          >
            编辑
          </Button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* 邀请码卡片 */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">我的邀请码</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">分享邀请码获得奖励</p>
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
                复制
              </Button>
            </div>
            {userInfo?.invitedBy && (
              <div className="mt-3 text-sm text-gray-600">
                <p>邀请人：{userInfo.invitedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">我的数据</CardTitle>
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
              <CardTitle className="text-slate-800">我的钱包</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">BSC 地址</p>
                    <p className="text-sm font-mono text-gray-800 break-all">
                      {userInfo.bscAddress}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(userInfo.bscAddress)
                      toast.success('地址已复制到剪贴板')
                    }}
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">快捷操作</CardTitle>
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

        <Card className="glass-card border-white/30">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50/50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              退出登录
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
