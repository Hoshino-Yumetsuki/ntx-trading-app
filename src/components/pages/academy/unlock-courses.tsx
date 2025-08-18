'use client'

import { useCallback, useEffect, useMemo, useState, useId } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/src/components/ui/dialog'
import {
  Loader2,
  ShoppingCart,
  ExternalLink,
  Copy,
  Lock,
  BookOpen,
  BadgeCheck,
  RefreshCw,
  Clock
} from 'lucide-react'
import { getPermissionGroups } from '@/src/services/courseService'
import { createOrder, getMyOrders } from '@/src/services/payment'
import type {
  PermissionGroupWithPackages,
  CreateOrderResponse
} from '@/src/types/course'
import type { Order } from '@/src/types/course'
import { format } from 'date-fns'

export function UnlockCoursesPage() {
  const packagesSectionId = useId()
  const [groups, setGroups] = useState<PermissionGroupWithPackages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<CreateOrderResponse | null>(
    null
  )

  // CSR 订单列表
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  // 将 package_id 映射为套餐名称（使用 group.name）
  const packageNameMap = useMemo(() => {
    const map: Record<number, string> = {}
    for (const g of groups) {
      for (const p of g.packages) {
        map[p.id] = g.group.name
      }
    }
    return map
  }, [groups])

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true)
      setOrdersError('')
      const data = await getMyOrders()
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setOrders(sorted)
    } catch (e: any) {
      setOrdersError(e.message || '获取订单失败')
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (ordersOpen) {
      fetchOrders()
    }
  }, [ordersOpen, fetchOrders])

  const openPayDialog = async (order: Order) => {
    // 先打开弹窗，随后用最新数据刷新
    setSelectedOrder(order)
    setPayDialogOpen(true)
    setTimeLeft(0)
    try {
      const data = await getMyOrders()
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setOrders(sorted)
      const latest = sorted.find((o) => o.id === order.id) || order
      setSelectedOrder(latest)
      setTimeLeft(latest.remainingTimeSeconds || 0)
    } catch (_) {
      // 回退到旧数据
      setTimeLeft(order.remainingTimeSeconds || 0)
    }
  }

  useEffect(() => {
    if (!payDialogOpen) return
    if (!timeLeft) return
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [payDialogOpen, timeLeft])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getPermissionGroups()
        setGroups(data)
      } catch (e: any) {
        setError(e.message || '获取套餐失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleBuy = async (packageId: number) => {
    try {
      setCreatingOrder(packageId)
      const res = await createOrder(packageId)
      setPaymentInfo(res)
      setPaymentOpen(true)
    } catch (e: any) {
      alert(e.message || '创建订单失败，请稍后重试')
    } finally {
      setCreatingOrder(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_) {}
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card-strong border-white/50">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-inner">
            <Lock className="h-6 w-6 text-slate-700" />
          </div>
          <h3 className="gradient-text font-bold text-lg mb-2">解锁完整课程</h3>
          <p className="text-slate-600 text-sm mb-4">
            程序化辅助工具：学员专属【筛选系统】，落地模型应用
          </p>
          <Button
            className="diffused-button text-white font-semibold border-0 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:shadow-lg"
            onClick={() => {
              const el = document.getElementById(packagesSectionId)
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            获得机构级策略
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <h4 className="text-slate-800 font-semibold">课程包含内容</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  完整交易系统
                </h5>
                <p className="text-slate-600 text-xs">
                  包含入场、止损、止盈的完整交易决策框架
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  专属筛选工具
                </h5>
                <p className="text-slate-600 text-xs">
                  学员专属的程序化筛选系统，快速发现优质标的
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  实战案例分析
                </h5>
                <p className="text-slate-600 text-xs">
                  真实市场案例解析，理论与实践相结合
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  持续更新支持
                </h5>
                <p className="text-slate-600 text-xs">
                  根据市场变化持续更新策略和工具
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 购买套餐 */}
      <div id={packagesSectionId} className="mt-2" />
      <Card className="glass-card border-white/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-800 text-xl font-bold">
            购买套餐
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOrdersOpen(true)
            }}
            className="text-slate-600 hover:text-slate-800"
          >
            <ExternalLink className="w-4 h-4 mr-1" /> 订单列表
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">加载套餐中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600">暂无可购买的套餐</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <Card
                  key={g.group.id}
                  className="glass-card border-white/30 overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-800 text-base">
                      {g.group.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3">
                      {g.packages.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm flex items-center justify-between"
                        >
                          <div>
                            <div className="text-slate-800 font-medium">
                              {p.duration_days} 天套餐
                            </div>
                            <div className="text-sm text-slate-600">
                              价格：{p.price} {p.currency}
                            </div>
                          </div>
                          <Button
                            className="min-w-[96px] bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleBuy(p.id)}
                            disabled={creatingOrder === p.id}
                          >
                            {creatingOrder === p.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                下单中
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" /> 购买
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
              <BadgeCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <h4 className="text-slate-800 font-semibold">学员专属权益</h4>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-sm">
              <h5 className="font-medium text-sm mb-1">VIP交流群</h5>
              <p className="text-xs text-white/90">
                与导师和优秀学员直接交流，分享交易心得
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm">
              <h5 className="font-medium text-sm mb-1">一对一指导</h5>
              <p className="text-xs text-white/90">
                针对个人交易问题提供专业指导建议
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
              <h5 className="font-medium text-sm mb-1">实时策略更新</h5>
              <p className="text-xs text-white/90">
                第一时间获取最新的市场策略和信号提醒
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表（CSR 弹窗） */}
      <Dialog
        open={ordersOpen}
        onOpenChange={(open) => {
          setOrdersOpen(open)
          if (open) fetchOrders()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>我的订单</DialogTitle>
            <DialogDescription>查看课程购买与支付状态</DialogDescription>
          </DialogHeader>
          {ordersLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">加载订单中...</span>
            </div>
          ) : ordersError ? (
            <div className="text-center py-6">
              <p className="text-red-500 text-sm">{ordersError}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600 text-sm">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-slate-800 font-medium">
                      订单 #{format(new Date(o.created_at), 'yyyyMMdd')}0000
                      {o.id}
                      <span className="ml-2 text-xs text-slate-500">
                        套餐名称 {packageNameMap[o.package_id] ?? '-'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      套餐金额 {o.amount} {o.currency} · 实付金额{' '}
                      {o.paymentAmount} {o.currency}
                    </div>
                    <div className="text-xs text-slate-500">
                      创建时间 {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'px-2 py-1 rounded text-xs font-medium ' +
                        (o.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : o.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200')
                      }
                    >
                      {o.status === 'pending'
                        ? '待支付/待确认'
                        : o.status === 'confirmed'
                          ? '支付成功'
                          : '已关闭'}
                    </span>
                    {o.status === 'pending' && (
                      <>
                        {typeof o.remainingTimeSeconds === 'number' && (
                          <div className="hidden sm:flex items-center text-xs text-slate-600 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" />
                            剩余{' '}
                            {formatTime(Math.max(0, o.remainingTimeSeconds))}
                          </div>
                        )}
                        <Button size="sm" onClick={() => openPayDialog(o)}>
                          去支付
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" /> 刷新
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 订单支付弹窗 */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[460px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>支付信息</DialogTitle>
            <DialogDescription>
              请使用支持 USDT 的钱包进行链上转账
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">支付地址</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm break-all font-mono text-blue-900">
                    {selectedOrder.paymentAddress || '-'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(selectedOrder.paymentAddress || '')
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">支付金额</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-amber-900">
                    {selectedOrder.paymentAmount} {selectedOrder.currency}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(String(selectedOrder.paymentAmount))
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-xs text-red-700 mb-1 font-semibold">
                  注意
                </div>
                <div className="text-sm text-red-700 font-bold">
                  未在有效期内完成支付将导致订单关闭。
                </div>
              </div>

              {typeof timeLeft === 'number' && (
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> 支付倒计时
                  </div>
                  <div
                    className={`font-mono ${timeLeft <= 60 ? 'text-red-600' : 'text-slate-800'}`}
                  >
                    {formatTime(Math.max(0, timeLeft))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 支付弹窗 */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>支付信息</DialogTitle>
            <DialogDescription>请严格按以下信息进行链上转账</DialogDescription>
          </DialogHeader>
          {paymentInfo && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">支付地址</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm break-all font-mono text-blue-900">
                    {paymentInfo.paymentAddress}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentInfo.paymentAddress)}
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">支付金额</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-amber-900">
                    {paymentInfo.paymentAmount} {paymentInfo.currency}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${paymentInfo.paymentAmount} ${paymentInfo.currency}`
                      )
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  • 金额为系统分配的唯一识别值，请勿修改，否则无法自动识别。
                </p>
                <p>• 支付完成后，后台需要时间确认，请耐心等待。</p>
                <p>
                  • 如有问题，请联系管理员并提供订单号：{paymentInfo.orderId}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setPaymentOpen(false)
                    setOrdersOpen(true)
                    fetchOrders()
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> 查看订单
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentOpen(false)}
                >
                  我已知晓
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
