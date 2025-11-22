
'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
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
  ExchangeCard
} from '@/src/components/pages/mining/index'
import { toast } from 'sonner'
import { useAuth } from '@/src/contexts/AuthContext'
import { useLanguage } from '@/src/contexts/language-context'

export function MiningPage() {
  const exchangeUidId = useId()
  const { user, token } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [platformData, setPlatformData] = useState<PlatformData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dailyData, setDailyData] = useState<DailyUserData | null>(null)
  const [_leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  const [userExchanges, setUserExchanges] = useState<UserExchange[]>([])
  const [activeTab, setActiveTab] = useState<'mining' | 'exchange'>('exchange')
  const [miningSubTab, setMiningSubTab] = useState<'platform' | 'user'>('user')
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [exchangesLoading, setExchangesLoading] = useState(false)
  const [bindingExchangeId, setBindingExchangeId] = useState<number | null>(
    null
  )
  const [bindingUid, setBindingUid] = useState('')
  const [showBindDialog, setShowBindDialog] = useState(false)
  const [_lastUpdated, setLastUpdated] = useState<Date | null>(null)

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

  const fetchUserData = useCallback(async () => {
    if (!token) return

    try {
      setUserLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const [userDataResult, dailyDataResult] = await Promise.all([
        getUserData(token),
        getDailyUserData(token, today)
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

  const getAuthTokenOrOpen = (): string | null => {
    if (!token) {
      toast.error(t('mining.error.notLoggedIn') || '请先登录')
      router.push('/login')
      return null
    }
    return token
  }

  const handleBindExchange = (exchangeId: number, uid: string) => {
    const authToken = getAuthTokenOrOpen()
    if (!authToken) return
    setBindingExchangeId(exchangeId)
    setBindingUid(uid)
    setShowBindDialog(true)
  }

  const handleUnbindExchange = async (exchangeId: number) => {
    const authToken = getAuthTokenOrOpen()
    if (!authToken) return

    try {
      await unbindExchange(authToken, exchangeId)
      toast.success(t('mining.success.unbindExchange') || '解绑成功')
      await fetchUserExchanges()
    } catch (error) {
      console.error('解绑交易所失败:', error)
      toast.error(t('mining.error.unbindExchange') || '解绑失败')
    }
  }

  const confirmBindExchange = async () => {
    const authToken = getAuthTokenOrOpen()
    if (!authToken) return
    if (!bindingExchangeId || !bindingUid.trim()) {
      toast.error(t('mining.error.enterUid') || '请输入 UID')
      return
    }

    try {
      await bindExchange(authToken, {
        exchange_id: bindingExchangeId,
        exchange_uid: bindingUid.trim()
      })

      toast.success(t('mining.success.bindExchange') || '绑定成功')
      setShowBindDialog(false)
      setBindingExchangeId(null)
      setBindingUid('')

      await fetchUserExchanges()
    } catch (error) {
      console.error('绑定交易所失败:', error)
      toast.error(t('mining.error.bindExchange') || '绑定失败')
    }
  }

  const cancelBindDialog = () => {
    setShowBindDialog(false)
    setBindingExchangeId(null)
    setBindingUid('')
  }

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
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-blue-600">
              {t('mining.title')}
            </h1>
            <p className="text-slate-600 text-xs mt-0.5">
              {t('mining.subtitle')}
            </p>
          </div>
          <div>
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

      <div className="px-6 mt-4">
        <div className="flex space-x-1 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'exchange'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {t('mining.tabs.exchange') || '交易所'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mining')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'mining'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {t('mining.tabs.data') || '挖矿数据'}
          </button>
        </div>
      </div>

      <div className="px-6 mt-4">
        {activeTab === 'mining' && (
          <div>
            <h2 className="text-base font-medium text-slate-700 mb-3">
              {t('mining.data.title') || '挖矿数据'}
            </h2>

            <div className="mb-4">
              <div className="flex space-x-1 bg-slate-100/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200/50">
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
              </div>
            </div>

            <div>
              {miningSubTab === 'platform' && (
                <PlatformDataCard
                  platformData={platformData}
                  loading={loading}
                />
              )}

              {miningSubTab === 'user' && (
                <UserDataCard
                  user={user}
                  userData={userData}
                  dailyData={dailyData}
                  userLoading={userLoading}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t('mining.exchangeList.title') || '交易所列表'}
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <ExchangeCard
                    exchanges={exchanges}
                    userExchanges={userExchanges}
                    exchangesLoading={exchangesLoading}
                    onBindExchange={handleBindExchange}
                    onUnbindExchange={handleUnbindExchange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
