'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
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
  getExchanges,
  getUserExchanges,
  bindExchange,
  formatCurrency,
  type PlatformData,
  type UserData,
  type DailyUserData,
  type LeaderboardItem,
  type Exchange,
  type UserExchange
} from '@/src/services/mining'
import { toast } from 'sonner'
import { useAuth } from '@/src/contexts/AuthContext'
import { useLanguage } from '@/src/contexts/language-context'

export function MiningPage() {
  const { user, token } = useAuth()
  const { t } = useLanguage()
  const [platformData, setPlatformData] = useState<PlatformData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dailyData, setDailyData] = useState<DailyUserData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  const [userExchanges, setUserExchanges] = useState<UserExchange[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [exchangesLoading, setExchangesLoading] = useState(false)
  const [bindingExchangeId, setBindingExchangeId] = useState<number | null>(
    null
  )
  const [bindingUid, setBindingUid] = useState('')
  const [showBindDialog, setShowBindDialog] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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
      toast.error(t('mining.error.fetchUserData'))
    } finally {
      setUserLoading(false)
    }
  }, [token, t])

  // 获取排行榜数据
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true)
      const data = await getMiningLeaderboard()
      setLeaderboard(data)
    } catch (error) {
      console.error('获取排行榜失败:', error)
      toast.error(t('mining.error.fetchLeaderboard'))
    } finally {
      setLeaderboardLoading(false)
    }
  }, [t])

  // 获取交易所列表
  const fetchExchanges = useCallback(async () => {
    try {
      setExchangesLoading(true)
      const data = await getExchanges()
      setExchanges(data)
    } catch (error) {
      console.error('获取交易所列表失败:', error)
      toast.error(t('mining.error.fetchExchanges'))
    } finally {
      setExchangesLoading(false)
    }
  }, [t])

  // 获取用户绑定的交易所
  const fetchUserExchanges = useCallback(async () => {
    if (!token) return

    try {
      const data = await getUserExchanges(token)
      setUserExchanges(data)
    } catch (error) {
      console.error('获取用户交易所失败:', error)
      toast.error(t('mining.error.fetchUserExchanges'))
    }
  }, [token, t])

  // 处理绑定交易所
  const handleBindExchange = (exchangeId: number, _exchangeName: string) => {
    setBindingExchangeId(exchangeId)
    setBindingUid('')
    setShowBindDialog(true)
  }

  // 处理修改绑定
  const handleModifyBinding = (exchangeId: number, _exchangeName: string) => {
    setBindingExchangeId(exchangeId)
    setBindingUid('')
    setShowBindDialog(true)
  }

  // 确认绑定交易所
  const confirmBindExchange = async () => {
    if (!token || !bindingExchangeId || !bindingUid.trim()) {
      toast.error(t('mining.error.enterUid'))
      return
    }

    try {
      await bindExchange(token, {
        exchange_id: bindingExchangeId,
        exchange_uid: bindingUid.trim()
      })

      toast.success(t('mining.success.bindExchange'))
      setShowBindDialog(false)
      setBindingExchangeId(null)
      setBindingUid('')

      // 刷新用户绑定的交易所列表
      await fetchUserExchanges()
    } catch (error) {
      console.error('绑定交易所失败:', error)
      toast.error(t('mining.error.bindExchange'))
    }
  }

  // 取消绑定对话框
  const cancelBindDialog = () => {
    setShowBindDialog(false)
    setBindingExchangeId(null)
    setBindingUid('')
  }

  // 刷新所有数据
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchPlatformData(),
      fetchLeaderboard(),
      fetchExchanges(),
      user && token ? fetchUserData() : Promise.resolve(),
      user && token ? fetchUserExchanges() : Promise.resolve()
    ])
  }, [
    fetchPlatformData,
    fetchLeaderboard,
    fetchExchanges,
    fetchUserData,
    fetchUserExchanges,
    user,
    token
  ])

  // 组件挂载时获取数据
  useEffect(() => {
    fetchPlatformData()
    fetchLeaderboard()
    fetchExchanges()
    if (user && token) {
      fetchUserData()
      fetchUserExchanges()
    }
  }, [
    user,
    token,
    fetchPlatformData,
    fetchLeaderboard,
    fetchExchanges,
    fetchUserData,
    fetchUserExchanges
  ])

  return (
    <div className="min-h-screen pb-6">
      <div className="glass-card-strong px-6 pt-12 pb-8 rounded-b-3xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {t('mining.title')}
            </h1>
            <p className="text-slate-600 text-sm">{t('mining.subtitle')}</p>
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
              disabled={
                loading || userLoading || leaderboardLoading || exchangesLoading
              }
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 ${loading || userLoading || leaderboardLoading || exchangesLoading ? 'animate-spin' : ''}`}
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
              {t('mining.platform.title')}
            </CardTitle>
            <p className="text-slate-600 text-sm flex items-center ml-11">
              <Clock className="w-4 h-4 mr-1" />
              {t('mining.platform.updateTime')}
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
                <p className="text-slate-600 text-sm">
                  {t('mining.platform.totalMined')}
                </p>
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
                <p className="text-slate-600 text-sm">
                  {t('mining.platform.totalCommission')}
                </p>
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
                <p className="text-slate-600 text-sm">
                  {t('mining.platform.totalBurned')}
                </p>
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
                <p className="text-slate-600 text-sm">
                  {t('mining.platform.totalTradingVolume')}
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h4 className="text-slate-800 font-medium mb-4 flex items-center">
                <div className="premium-icon w-6 h-6 rounded mr-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                </div>
                {t('mining.platform.overview')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Coins className="w-4 h-4 mr-1 text-yellow-600" />
                    {t('mining.platform.mined')}:
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
                    {t('mining.platform.burned')}:
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
                    {t('mining.platform.commission')}:
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
                    {t('mining.platform.miners')}:
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
              {t('mining.user.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8">
                <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-4">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">
                  {t('mining.user.loginPrompt')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('mining.user.loginDescription')}
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
                    <p className="text-slate-600 text-sm">
                      {t('mining.user.totalMining')}
                    </p>
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
                    <p className="text-slate-600 text-sm">
                      {t('mining.user.totalTradingCost')}
                    </p>
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
                    <p className="text-slate-600 text-sm">
                      {t('mining.user.dailyMining')}
                    </p>
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
                      {t('mining.user.dailyTradingCost')}
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
              {t('mining.leaderboard.title')}
            </CardTitle>
            <p className="text-slate-600 text-sm ml-11">
              {t('mining.leaderboard.description')}
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
                <p className="text-gray-500 mb-2">
                  {t('mining.leaderboard.noData')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('mining.leaderboard.tryLater')}
                </p>
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
              {t('mining.exchange.title')}
            </CardTitle>
            <p className="text-slate-600 text-sm ml-11">
              {t('mining.exchange.description')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchangesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-5 data-card rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="h-5 bg-gray-200 rounded w-12 animate-pulse mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : exchanges.length > 0 ? (
              exchanges.map((exchange, _index) => {
                const isUserBound = userExchanges.some(
                  (ue) => ue.id === exchange.id
                )
                return (
                  <div
                    key={exchange.id}
                    className="flex items-center justify-between p-5 data-card rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="premium-icon w-12 h-12 rounded-xl">
                        <span className="text-slate-700 text-sm font-bold">
                          {exchange.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold text-lg">
                          {exchange.name}
                        </p>
                        <p className="text-slate-600 text-sm">
                          {t('mining.exchange.efficiency')}:{' '}
                          {exchange.mining_efficiency.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      {isUserBound ? (
                        <div>
                          <p className="text-green-600 font-bold text-sm">
                            {t('mining.exchange.status.bound')}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-blue-600 font-bold text-sm">
                            {t('mining.exchange.status.unbound')}
                          </p>
                        </div>
                      )}
                    </div>
                    {isUserBound ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleModifyBinding(exchange.id, exchange.name)
                        }
                        className="border-0 px-4 py-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t('mining.exchange.modifyBinding')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleBindExchange(exchange.id, exchange.name)
                        }
                        className="diffused-button text-white border-0 px-4 py-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t('mining.exchange.goBind')}
                      </Button>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">
                  {t('mining.exchange.noExchanges')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('mining.exchange.tryLater')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 绑定交易所对话框 */}
      <Dialog open={showBindDialog} onOpenChange={setShowBindDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('mining.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('mining.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exchange-uid" className="text-right">
                {t('mining.dialog.uidLabel')}
              </Label>
              <Input
                id="exchange-uid"
                value={bindingUid}
                onChange={(e) => setBindingUid(e.target.value)}
                placeholder={t('mining.dialog.uidPlaceholder')}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelBindDialog}>
              {t('mining.dialog.cancel')}
            </Button>
            <Button onClick={confirmBindExchange}>
              {t('mining.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
