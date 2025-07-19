'use client'

import { useState, useEffect } from 'react'
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
  RefreshCw
} from 'lucide-react'
import { getPlatformData, formatCurrency, type PlatformData } from '@/src/services/mining'
import { toast } from 'sonner'

export function MiningPage() {
  const [platformData, setPlatformData] = useState<PlatformData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const exchanges = [
    { name: 'Bitget', rank: 6, efficiency: 36.0, logo: 'BG' },
    { name: 'HTX', rank: 9, efficiency: 30.0, logo: 'HTX' },
    { name: 'Bybit', rank: 2, efficiency: 26.64, logo: 'BB' },
    { name: 'Binance', rank: 1, efficiency: 24.6, logo: 'BN' },
    { name: 'XT', rank: 20, efficiency: 42.0, logo: 'XT' }
  ]

  // 获取平台数据
  const fetchPlatformData = async () => {
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
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchPlatformData()
  }, [])

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
                {lastUpdated ? lastUpdated.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '--:--'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPlatformData}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
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
                <p className={`text-2xl font-bold text-yellow-600 mb-1 ${loading ? 'animate-pulse bg-gray-200 rounded h-8 w-24 mx-auto' : ''}`}>
                  {loading ? '' : (platformData ? formatCurrency(platformData.total_mined, 'NTX') : '--')}
                </p>
                <p className="text-slate-600 text-sm">总挖矿量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {platformData ? formatCurrency(platformData.total_commission, 'USDT') : '--'}
                </p>
                <p className="text-slate-600 text-sm">总平台佣金 (USDT)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-500 mb-1">
                  {platformData ? formatCurrency(platformData.total_burned, 'NTX') : '--'}
                </p>
                <p className="text-slate-600 text-sm">总销毁量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {platformData ? formatCurrency(platformData.total_trading_volume, 'USDT') : '--'}
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
                    {platformData ? formatCurrency(platformData.total_mined, 'NTX') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-red-500" />
                    销毁量:
                  </span>
                  <span className="text-red-500 font-semibold">
                    {platformData ? formatCurrency(platformData.total_burned, 'NTX') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    平台佣金:
                  </span>
                  <span className="text-green-600 font-semibold">
                    {platformData ? formatCurrency(platformData.total_commission, 'USDT') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-600" />
                    挖矿人数:
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {platformData ? `${platformData.platform_users.toLocaleString()}人` : '--'}
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-xl font-bold text-yellow-600 mb-1">12,345</p>
                <p className="text-slate-600 text-sm">总挖矿量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-xl font-bold text-red-500 mb-1">5,678</p>
                <p className="text-slate-600 text-sm">总交易成本 (USDT)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-lg font-bold text-yellow-600 mb-1">+123</p>
                <p className="text-slate-600 text-sm">今日挖矿量 (NTX)</p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-lg font-bold text-red-500 mb-1">-45</p>
                <p className="text-slate-600 text-sm">今日交易成本 (USDT)</p>
              </div>
            </div>
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
