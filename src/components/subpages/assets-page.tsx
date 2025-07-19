'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/src/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { toast } from 'sonner'
import { getUserInfo, withdrawUsdt, withdrawNtx } from '@/src/services/user'
import { AuthService } from '@/src/services/auth'
import type { UserInfo } from '@/src/types/user'

interface AssetsPageProps {
  onBack: () => void
}

export function AssetsPage({ onBack }: AssetsPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawType, setWithdrawType] = useState<'usdt' | 'ntx'>('usdt')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [addressError, setAddressError] = useState('')

  // 获取用户信息
  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      toast.error('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = AuthService.getToken()
    if (token) {
      fetchUserInfo()
    } else {
      setLoading(false)
      toast.error('请先登录')
    }
  }, [fetchUserInfo])

  // 验证BSC地址格式
  const validateBscAddress = (address: string) => {
    if (!address) {
      return '请输入提现地址'
    }

    // BSC地址必须以0x开头，后面跟40个十六进制字符，总长度42位
    const bscAddressRegex = /^0x[a-fA-F0-9]{40}$/

    if (!bscAddressRegex.test(address)) {
      return '请输入有效的BSC链地址 (以 0x 开头，共42位)'
    }

    return ''
  }

  // 处理提现
  const handleWithdraw = (type: 'usdt' | 'ntx') => {
    setWithdrawType(type)
    setWithdrawAmount('')
    setWithdrawAddress(userInfo?.bscAddress || '')
    setAddressError('')
    setShowWithdrawDialog(true)
  }

  // 确认提现
  const confirmWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast.error('请填写完整的提现信息')
      return
    }

    // 验证地址格式
    const addressValidationError = validateBscAddress(withdrawAddress)
    if (addressValidationError) {
      setAddressError(addressValidationError)
      toast.error(addressValidationError)
      return
    }
    setAddressError('')

    const amount = Number.parseFloat(withdrawAmount)
    if (amount <= 0) {
      toast.error('提现金额必须大于0')
      return
    }

    const maxAmount =
      withdrawType === 'usdt' ? userInfo?.usdtBalance : userInfo?.ntxBalance

    // 检查余额是否为0
    if ((maxAmount || 0) <= 0) {
      toast.error(`${withdrawType.toUpperCase()}余额不足，无法提现`)
      return
    }

    if (amount > (maxAmount || 0)) {
      toast.error(`提现金额不能超过可用余额 ${maxAmount}`)
      return
    }

    try {
      setIsWithdrawing(true)

      const request = {
        amount,
        toAddress: withdrawAddress
      }

      if (withdrawType === 'usdt') {
        await withdrawUsdt(request)
      } else {
        await withdrawNtx(request)
      }

      toast.success(`${withdrawType.toUpperCase()}提现申请成功，等待管理员确认`)
      setShowWithdrawDialog(false)

      // 刷新用户信息
      await fetchUserInfo()
    } catch (error) {
      console.error('提现失败:', error)
      toast.error('提现申请失败，请重试')
    } finally {
      setIsWithdrawing(false)
    }
  }

  // 处理地址输入变化
  const handleAddressChange = (address: string) => {
    setWithdrawAddress(address)

    // 如果地址不为空，实时验证
    if (address.trim()) {
      const error = validateBscAddress(address)
      setAddressError(error)
    } else {
      setAddressError('')
    }
  }

  // 复制地址
  const copyAddress = async () => {
    if (userInfo?.bscAddress) {
      try {
        await navigator.clipboard.writeText(userInfo.bscAddress)
        setAddressCopied(true)
        toast.success('地址已复制')
        setTimeout(() => setAddressCopied(false), 2000)
      } catch (_error) {
        toast.error('复制失败')
      }
    }
  }

  // 格式化余额显示
  const formatBalance = (balance: number) => {
    return balance.toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 头部 */}
        <div className="glass-card-strong px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">我的资产</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="w-4 h-4 mr-1" />
            刷新
          </Button>
        </div>

        <div className="p-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 头部 */}
        <div className="glass-card-strong px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">我的资产</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUserInfo}>
            <RefreshCw className="w-4 h-4 mr-1" />
            重试
          </Button>
        </div>

        <div className="p-4">
          <div className="max-w-md mx-auto text-center py-8">
            <p className="text-slate-600">获取用户信息失败，请重试</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="glass-card-strong px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">我的资产</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUserInfo}>
          <RefreshCw className="w-4 h-4 mr-1" />
          刷新
        </Button>
      </div>

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* 资产卡片 */}
          <div className="space-y-4 mb-6">
            {/* USDT */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">USDT</h3>
                      <p className="text-sm text-slate-600">Tether USD</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleWithdraw('usdt')}
                    className="diffused-button text-white border-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    提现
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatBalance(userInfo.usdtBalance)}
                  </p>
                  <p className="text-sm text-slate-600">可用余额</p>
                </div>
              </CardContent>
            </Card>

            {/* NTX */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">NTX</h3>
                      <p className="text-sm text-slate-600">NTX Token</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleWithdraw('ntx')}
                    className="diffused-button text-white border-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    提现
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatBalance(userInfo.ntxBalance)}
                  </p>
                  <p className="text-sm text-slate-600">可用余额</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BSC地址信息 */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">BSC 钱包地址</h3>
                  <p className="text-sm text-slate-600">Binance Smart Chain</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-mono text-slate-700 break-all">
                    {userInfo.bscAddress || '未设置'}
                  </p>
                </div>
                {userInfo.bscAddress && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAddress}
                    className="flex-shrink-0"
                  >
                    {addressCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 提现对话框 */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{withdrawType.toUpperCase()} 提现</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">提现金额</Label>
              <Input
                id="amount"
                type="number"
                placeholder="请输入提现金额"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-slate-600 mt-1">
                可用余额:{' '}
                {formatBalance(
                  withdrawType === 'usdt'
                    ? userInfo.usdtBalance
                    : userInfo.ntxBalance
                )}{' '}
                {withdrawType.toUpperCase()}
              </p>
            </div>
            <div>
              <Label htmlFor="address">提现地址</Label>
              <Input
                id="address"
                placeholder="请输入BSC钱包地址 (0x...)"
                value={withdrawAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="mt-1"
              />
              <div className="mt-1">
                {addressError && (
                  <p className="text-sm text-red-500">{addressError}</p>
                )}
                {withdrawAddress &&
                  !addressError &&
                  withdrawAddress.length === 42 &&
                  withdrawAddress.startsWith('0x') && (
                    <p className="text-sm text-green-600">✓ 地址格式正确</p>
                  )}
                <p className="text-sm text-slate-600 mt-1">
                  ⚠️ 请确保地址正确，错误地址可能导致资产永久丢失
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={confirmWithdraw}
              disabled={isWithdrawing}
              className="diffused-button"
            >
              {isWithdrawing ? '提交中...' : '立即提现'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
