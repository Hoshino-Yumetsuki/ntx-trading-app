'use client'

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
  Settings,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Wallet,
  Award,
  TrendingUp,
  Users
} from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'

export function ProfilePage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const stats = [
    {
      label: '总挖矿量',
      value: '12,345 NTX',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      label: '总收益',
      value: '+$2,456',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { label: '交易次数', value: '1,234', icon: Users, color: 'text-blue-600' },
    { label: '推荐用户', value: '23', icon: Users, color: 'text-purple-600' }
  ]

  const menuItems = [
    { icon: Wallet, label: '钱包管理', description: '查看资产和交易记录' },
    { icon: Settings, label: '账户设置', description: '个人信息和偏好设置' },
    { icon: Bell, label: '通知设置', description: '推送和提醒设置' },
    { icon: Shield, label: '安全中心', description: '密码和安全验证' },
    { icon: HelpCircle, label: '帮助中心', description: '常见问题和客服' }
  ]

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
              {user?.nickname || '用户'}
            </h2>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-yellow-100/80 text-yellow-700 border-yellow-300">
                VIP会员
              </Badge>
              <Badge className="bg-slate-100/80 text-slate-700 border-slate-300">
                Lv.5
              </Badge>
            </div>
            <p className="text-slate-600 text-sm">加入时间：2024年1月</p>
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

        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 glass-card rounded-lg hover:bg-white/40 transition-all cursor-pointer"
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
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="glass-card-strong border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="gradient-text font-bold text-lg mb-1">
                  VIP会员
                </h3>
                <p className="text-slate-600 text-sm">享受专属权益和优先服务</p>
              </div>
              <div className="text-right">
                <p className="text-slate-800 font-bold">2024.12.31</p>
                <p className="text-slate-600 text-sm">到期时间</p>
              </div>
            </div>
            <Button className="w-full mt-4 diffused-button text-white font-semibold border-0">
              续费会员
            </Button>
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
