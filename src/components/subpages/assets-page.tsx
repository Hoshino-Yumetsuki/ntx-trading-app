'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  History,
  Clock,
  CheckCircle,
  XCircle
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
import {
  getUserInfo,
  withdrawUsdt,
  withdrawNtx,
  getWithdrawalRecords,
  getCommissionRecords
} from '@/src/services/user'
import { AuthService } from '@/src/services/auth'
import { useLanguage } from '@/src/contexts/language-context'
import type {
  UserInfo,
  WithdrawalRecord,
  CommissionRecord
} from '@/src/types/user'

interface AssetsPageProps {
  onBack: () => void
}

export function AssetsPage({ onBack }: AssetsPageProps) {
  const { t } = useLanguage()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawType, setWithdrawType] = useState<'usdt' | 'ntx'>('usdt')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [currentView, setCurrentView] = useState<
    'assets' | 'history' | 'commission'
  >('assets')
  const [withdrawalRecords, setWithdrawalRecords] = useState<
    WithdrawalRecord[]
  >([])
  const [commissionRecords, setCommissionRecords] = useState<
    CommissionRecord[]
  >([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [loadingCommission, setLoadingCommission] = useState(false)

  // 获取用户信息
  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      toast.error(t('assets.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    const token = AuthService.getToken()
    if (token) {
      fetchUserInfo()
    } else {
      setLoading(false)
      toast.error('请先登录')
    }
  }, [fetchUserInfo])

  // 获取提现记录
  const fetchWithdrawalRecords = useCallback(async () => {
    try {
      setLoadingRecords(true)
      const records = await getWithdrawalRecords()
      setWithdrawalRecords(records)
    } catch (error) {
      console.error('获取提现记录失败:', error)
      toast.error(t('assets.error'))
    } finally {
      setLoadingRecords(false)
    }
  }, [t])

  const fetchCommissionRecords = useCallback(async () => {
    try {
      setLoadingCommission(true)
      const records = await getCommissionRecords()
      setCommissionRecords(records)
    } catch (error) {
      console.error('获取佣金记录失败:', error)
      toast.error(t('assets.error'))
    } finally {
      setLoadingCommission(false)
    }
  }, [t])

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

  // 格式化时间显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: '待处理',
          icon: Clock,
          color: 'text-yellow-600'
        }
      case 'confirmed':
        return {
          text: '已完成',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'rejected':
        return {
          text: '已拒绝',
          icon: XCircle,
          color: 'text-red-600'
        }
      default:
        return {
          text: '未知',
          icon: Clock,
          color: 'text-gray-600'
        }
    }
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
      <div className="glass-card-strong px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">我的资产</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={
              currentView === 'assets'
                ? fetchUserInfo
                : currentView === 'history'
                  ? fetchWithdrawalRecords
                  : fetchCommissionRecords
            }
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            刷新
          </Button>
        </div>

        {/* 切换按钮 */}
        <div className="flex space-x-2">
          <Button
            variant={currentView === 'assets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('assets')}
            className="flex-1"
          >
            资产概览
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentView('history')
              if (withdrawalRecords.length === 0) {
                fetchWithdrawalRecords()
              }
            }}
            className="flex-1"
          >
            提现记录
          </Button>
          <Button
            variant={currentView === 'commission' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentView('commission')
              if (commissionRecords.length === 0) {
                fetchCommissionRecords()
              }
            }}
            className="flex-1"
          >
            佣金记录
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {currentView === 'assets' ? (
            <>
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
                      <h3 className="font-semibold text-slate-800">
                        BSC 钱包地址
                      </h3>
                      <p className="text-sm text-slate-600">
                        Binance Smart Chain
                      </p>
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
            </>
          ) : currentView === 'history' ? (
            /* 提现记录 */
            <div className="space-y-4">
              {loadingRecords ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white shadow-sm animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : withdrawalRecords.length === 0 ? (
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">暂无提现记录</p>
                  </CardContent>
                </Card>
              ) : (
                withdrawalRecords.map((record) => {
                  const statusDisplay = getStatusDisplay(record.status)
                  const StatusIcon = statusDisplay.icon

                  return (
                    <Card key={record.id} className="bg-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">
                                {record.currency.toUpperCase()} 提现
                              </h4>
                              <p className="text-sm text-slate-600">
                                {formatDate(record.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon
                              className={`w-4 h-4 ${statusDisplay.color}`}
                            />
                            <span
                              className={`text-sm font-medium ${statusDisplay.color}`}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                              提现金额:
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {formatBalance(record.amount)}{' '}
                              {record.currency.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                              提现地址:
                            </span>
                            <span className="text-sm font-mono text-slate-700 break-all">
                              {record.to_address.slice(0, 6)}...
                              {record.to_address.slice(-4)}
                            </span>
                          </div>
                          {record.confirmed_at && (
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">
                                完成时间:
                              </span>
                              <span className="text-sm text-slate-700">
                                {formatDate(record.confirmed_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          ) : (
            /* 佣金记录 */
            <div className="space-y-4">
              {loadingCommission ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white shadow-sm animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : commissionRecords.length === 0 ? (
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">暂无佣金记录</p>
                  </CardContent>
                </Card>
              ) : (
                commissionRecords.map((record) => (
                  <Card key={record.id} className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              邀请佣金
                            </h4>
                            <p className="text-sm text-slate-600">
                              {formatDate(record.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            +{formatBalance(record.amount)} USDT
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">
                            邀请人:
                          </span>
                          <span className="text-sm text-slate-700">
                            {record.invitee_nickname}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">邮箱:</span>
                          <span className="text-sm font-mono text-slate-700">
                            {record.invitee_email}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
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
