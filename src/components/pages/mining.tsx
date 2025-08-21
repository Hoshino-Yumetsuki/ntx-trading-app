'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { Button } from '@/src/components/ui/button'
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
import { RefreshCw } from 'lucide-react'
import {
  getPlatformData,
  getUserData,
  getDailyUserData,
  getMiningLeaderboard,
  getExchanges,
  getUserExchanges,
  bindExchange,
  unbindExchange,
  type PlatformData,
  type UserData,
  type DailyUserData,
  type LeaderboardItem,
  type Exchange,
  type UserExchange
} from '@/src/services/mining'
import {
  PlatformDataCard,
  UserDataCard,
  LeaderboardCard,
  ExchangeCard
} from '@/src/components/pages/mining/index'
import { toast } from 'sonner'
import { useAuth } from '@/src/contexts/AuthContext'
import { useLanguage } from '@/src/contexts/language-context'

export function MiningPage() {
  const exchangeUidId = useId()
  const { user, token } = useAuth()
  const { t } = useLanguage()
  const [platformData, setPlatformData] = useState<PlatformData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dailyData, setDailyData] = useState<DailyUserData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  const [userExchanges, setUserExchanges] = useState<UserExchange[]>([])
  const [activeTab, setActiveTab] = useState<'mining' | 'exchange'>('mining')
  const [miningSubTab, setMiningSubTab] = useState<'platform' | 'user'>(
    'platform'
  )
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
  const handleBindExchange = (exchangeId: number, uid: string) => {
    setBindingExchangeId(exchangeId)
    setBindingUid(uid)
    setShowBindDialog(true)
  }

  // 处理解绑交易所
  const handleUnbindExchange = async (exchangeId: number) => {
    if (!token) {
      toast.error(t('mining.error.notLoggedIn') || '请先登录')
      return
    }

    try {
      await unbindExchange(token, exchangeId)
      toast.success(t('mining.success.unbindExchange') || '解绑成功')
      // 刷新用户绑定的交易所列表
      await fetchUserExchanges()
    } catch (error) {
      console.error('解绑交易所失败:', error)
      toast.error(t('mining.error.unbindExchange') || '解绑失败')
    }
  }

  // 确认绑定交易所
  const confirmBindExchange = async () => {
    if (!token || !bindingExchangeId || !bindingUid.trim()) {
      toast.error(t('mining.error.enterUid') || '请输入 UID')
      return
    }

    try {
      await bindExchange(token, {
        exchange_id: bindingExchangeId,
        exchange_uid: bindingUid.trim()
      })

      toast.success(t('mining.success.bindExchange') || '绑定成功')
      setShowBindDialog(false)
      setBindingExchangeId(null)
      setBindingUid('')

      // 刷新用户绑定的交易所列表
      await fetchUserExchanges()
    } catch (error) {
      console.error('绑定交易所失败:', error)
      toast.error(t('mining.error.bindExchange') || '绑定失败')
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
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
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
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 ${loading || userLoading || leaderboardLoading || exchangesLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* 标签页切换按钮 */}
      <div className="px-6 mt-6">
        <div className="flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/30">
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'exchange'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {t('mining.tabs.exchange') || '交易所'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mining')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'mining'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {t('mining.tabs.data') || '挖矿数据'}
          </button>
        </div>
      </div>

      <div className="px-6 mt-6">
        {/* 挖矿数据标签页 */}
        {activeTab === 'mining' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {t('mining.data.title') || '挖矿数据'}
              </h2>

              {/* 挖矿数据子标签页切换按钮 */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-slate-100/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setMiningSubTab('platform')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      miningSubTab === 'platform'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    {t('mining.platform.title') || '平台数据'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMiningSubTab('user')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      miningSubTab === 'user'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    {t('mining.user.title') || '我的数据'}
                  </button>
                </div>
              </div>

              {/* 挖矿数据内容区域 */}
              <div>
                {/* 平台数据组件 */}
                {miningSubTab === 'platform' && (
                  <div>
                    <PlatformDataCard
                      platformData={platformData}
                      loading={loading}
                    />
                  </div>
                )}

                {/* 用户数据组件 */}
                {miningSubTab === 'user' && (
                  <div>
                    <UserDataCard
                      user={user}
                      userData={userData}
                      dailyData={dailyData}
                      userLoading={userLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 交易所页面标签页 */}
        {activeTab === 'exchange' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t('mining.exchangeList.title') || '交易所列表'}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 交易所绑定组件 */}
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-4">
                    {t('mining.bindExchanges.title') || '绑定交易所'}
                  </h3>
                  <ExchangeCard
                    exchanges={exchanges}
                    userExchanges={userExchanges}
                    exchangesLoading={exchangesLoading}
                    onBindExchange={handleBindExchange}
                    onUnbindExchange={handleUnbindExchange}
                  />
                </div>

                {/* 挖矿排行榜组件 */}
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-4">
                    {t('mining.leaderboard.title') || '挖矿排行榜'}
                  </h3>
                  <LeaderboardCard
                    leaderboard={leaderboard}
                    leaderboardLoading={leaderboardLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 绑定交易所对话框 */}
      <Dialog open={showBindDialog} onOpenChange={setShowBindDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[420px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('mining.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('mining.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={exchangeUidId} className="text-right">
                {t('mining.dialog.uidLabel')}
              </Label>
              <Input
                id={exchangeUidId}
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
            <Button
              onClick={confirmBindExchange}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('mining.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
