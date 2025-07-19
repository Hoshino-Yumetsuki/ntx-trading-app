'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import {
  TrendingUp,
  Users,
  ExternalLink,
  Clock,
  BarChart3,
  Coins,
  DollarSign,
  Flame,
  RefreshCw,
  Trophy
} from 'lucide-react'
import {
  getPlatformData,
  getUserData,
  getDailyUserData,
  getMiningLeaderboard,
  formatCurrency,
  type PlatformData,
  type UserData,
  type DailyUserData,
  type LeaderboardItem
} from '@/src/services/mining'
import { toast } from 'sonner'
import { useAuth } from '@/src/contexts/AuthContext'

export function MiningPage() {
  const { user, token } = useAuth()
  const [platformData, setPlatformData] = useState<PlatformData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dailyData, setDailyData] = useState<DailyUserData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const exchanges = [
    { name: 'Bitget', rank: 6, efficiency: 36.0, logo: 'BG' },
    { name: 'HTX', rank: 9, efficiency: 30.0, logo: 'HTX' },
    { name: 'Bybit', rank: 2, efficiency: 26.64, logo: 'BB' },
    { name: 'Binance', rank: 1, efficiency: 24.6, logo: 'BN' },
    { name: 'XT', rank: 20, efficiency: 42.0, logo: 'XT' }
  ]

  // 获取平台数据
  const fetchPlatformData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getPlatformData()
      setPlatformData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('获取平台数据失败:', error)
      toast.error('获取平台数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取用户数据
  const fetchUserData = useCallback(async () => {
    if (!token) return

    try {
      setUserLoading(true)
      // 获取今天的日期（YYYY-MM-DD格式）
      const today = new Date().toISOString().split('T')[0]

      const [userDataResult, dailyDataResult] = await Promise.all([
        getUserData(token),
        getDailyUserData(token, today) // 获取今日数据
      ])
      setUserData(userDataResult)
      setDailyData(dailyDataResult)
    } catch (error) {
      console.error('获取用户数据失败:', error)
      toast.error('获取用户数据失败')
    } finally {
      setUserLoading(false)
    }
  }, [token])

  // 获取排行榜数据
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true)
      const data = await getMiningLeaderboard()
      setLeaderboard(data)
    } catch (error) {
      console.error('获取排行榜失败:', error)
      toast.error('获取排行榜失败')
    } finally {
      setLeaderboardLoading(false)
    }
  }, [])

  // 刷新所有数据
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchPlatformData(),
      fetchLeaderboard(),
      user && token ? fetchUserData() : Promise.resolve()
    ])
  }, [fetchPlatformData, fetchLeaderboard, fetchUserData, user, token])

  // 组件挂载时获取数据
  useEffect(() => {
    fetchPlatformData()
    fetchLeaderboard()
    if (user && token) {
      fetchUserData()
    }
  }, [user, token, fetchPlatformData, fetchLeaderboard, fetchUserData])

  return (
    <div className="min-h-screen pb-6">
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">挖矿中心</h1>
            <p className="text-slate-600 text-sm">交易即挖矿，获取NTX奖励</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-slate-500 text-xs">最后更新</p>
              <p className="text-slate-700 text-sm font-medium">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAllData}
              disabled={loading || userLoading || leaderboardLoading}
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 ${loading || userLoading || leaderboardLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <div className="premium-icon w-8 h-8 rounded-lg mr-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              平台数据
            </CardTitle>
            <p className="text-slate-600 text-sm flex items-center ml-11">
              <Clock className="w-4 h-4 mr-1" />
              每日UTC+8 8:00更新
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                </div>
                <p
                  className={`text-2xl font-bold text-yellow-600 mb-1 ${loading ? 'animate-pulse bg-gray-200 rounded h-8 w-24 mx-auto' : ''}`}
                >
                  {loading
                    ? ''
                    : platformData
                      ? formatCurrency(platformData.total_mined, 'NTX')
                      : '--'}
                </p>
                <p className="text-slate-600 text-sm">总挖矿量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {platformData
                    ? formatCurrency(platformData.total_commission, 'USDT')
                    : '--'}
                </p>
                <p className="text-slate-600 text-sm">总平台佣金 (USDT)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-500 mb-1">
                  {platformData
                    ? formatCurrency(platformData.total_burned, 'NTX')
                    : '--'}
                </p>
                <p className="text-slate-600 text-sm">总销毁量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {platformData
                    ? formatCurrency(platformData.total_trading_volume, 'USDT')
                    : '--'}
                </p>
                <p className="text-slate-600 text-sm">总交易量 (USDT)</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h4 className="text-slate-800 font-medium mb-4 flex items-center">
                <div className="premium-icon w-6 h-6 rounded mr-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                </div>
                平台概览
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Coins className="w-4 h-4 mr-1 text-yellow-600" />
                    矿产量:
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    {platformData
                      ? formatCurrency(platformData.total_mined, 'NTX')
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-red-500" />
                    销毁量:
                  </span>
                  <span className="text-red-500 font-semibold">
                    {platformData
                      ? formatCurrency(platformData.total_burned, 'NTX')
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    平台佣金:
                  </span>
                  <span className="text-green-600 font-semibold">
                    {platformData
                      ? formatCurrency(platformData.total_commission, 'USDT')
                      : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-600" />
                    挖矿人数:
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {platformData
                      ? `${platformData.platform_users.toLocaleString()}人`
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <div className="premium-icon w-8 h-8 rounded-lg mr-3">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              我的数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8">
                <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-4">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">请登录查看您的挖矿数据</p>
                <p className="text-sm text-gray-400">
                  登录后可查看总挖矿量、交易成本等详细信息
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center data-card p-5 rounded-xl">
                    <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                      <Coins className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p
                      className={`text-xl font-bold text-yellow-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-20 mx-auto' : ''}`}
                    >
                      {userLoading
                        ? ''
                        : userData && userData.total_mining !== undefined
                          ? formatCurrency(userData.total_mining, 'NTX')
                          : '--'}
                    </p>
                    <p className="text-slate-600 text-sm">总挖矿量 (NTX)</p>
                  </div>
                  <div className="text-center data-card p-5 rounded-xl">
                    <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                      <DollarSign className="w-5 h-5 text-red-500" />
                    </div>
                    <p
                      className={`text-xl font-bold text-red-500 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-20 mx-auto' : ''}`}
                    >
                      {userLoading
                        ? ''
                        : userData && userData.total_trading_cost !== undefined
                          ? formatCurrency(userData.total_trading_cost, 'USDT')
                          : '--'}
                    </p>
                    <p className="text-slate-600 text-sm">总交易成本 (USDT)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center data-card p-5 rounded-xl">
                    <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p
                      className={`text-lg font-bold text-yellow-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-16 mx-auto' : ''}`}
                    >
                      {userLoading
                        ? ''
                        : dailyData && dailyData.mining_output !== undefined
                          ? `+${formatCurrency(dailyData.mining_output, 'NTX')}`
                          : '--'}
                    </p>
                    <p className="text-slate-600 text-sm">今日挖矿量 (NTX)</p>
                  </div>
                  <div className="text-center data-card p-5 rounded-xl">
                    <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                    </div>
                    <p
                      className={`text-lg font-bold text-red-500 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-16 mx-auto' : ''}`}
                    >
                      {userLoading
                        ? ''
                        : dailyData &&
                            dailyData.total_trading_cost !== undefined
                          ? dailyData.total_trading_cost === 0
                            ? formatCurrency(
                                dailyData.total_trading_cost,
                                'USDT'
                              )
                            : `-${formatCurrency(dailyData.total_trading_cost, 'USDT')}`
                          : '--'}
                    </p>
                    <p className="text-slate-600 text-sm">
                      今日交易成本 (USDT)
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <div className="premium-icon w-8 h-8 rounded-lg mr-3">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              挖矿排行榜
            </CardTitle>
            <p className="text-slate-600 text-sm ml-11">
              查看平台最佳挖矿者，学习他们的成功经验！
            </p>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 data-card rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 data-card rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.nickname}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.email_masked}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-600">
                        {formatCurrency(item.mining_amount, 'NTX')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">暂无排行榜数据</p>
                <p className="text-sm text-gray-400">请稍后再试</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <div className="premium-icon w-8 h-8 rounded-lg mr-3">
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </div>
              交易所绑定
            </CardTitle>
            <p className="text-slate-600 text-sm ml-11">
              选择您的交易所，绑定UID，立即开始挖矿！
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchanges.map((exchange, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 data-card rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="premium-icon w-12 h-12 rounded-xl">
                    <span className="text-slate-700 text-sm font-bold">
                      {exchange.logo}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-lg">
                      {exchange.name}
                    </p>
                    <p className="text-slate-600 text-sm">
                      CMC排名 #{exchange.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="text-green-600 font-bold text-lg">
                    {exchange.efficiency}%
                  </p>
                  <p className="text-slate-600 text-xs">挖矿效率</p>
                </div>
                <Button
                  size="sm"
                  className="diffused-button text-white border-0 px-4 py-2"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  去绑定
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
