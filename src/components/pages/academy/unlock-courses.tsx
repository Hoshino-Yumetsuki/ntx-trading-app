'use client'

import { useEffect, useState } from 'react'
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
  DialogDescription
} from '@/src/components/ui/dialog'
import { Loader2, ShoppingCart, ExternalLink, Copy } from 'lucide-react'
import { getPermissionGroups } from '@/src/services/courseService'
import { createOrder } from '@/src/services/payment'
import type {
  PermissionGroupWithPackages,
  CreateOrderResponse
} from '@/src/types/course'

export function UnlockCoursesPage() {
  const [groups, setGroups] = useState<PermissionGroupWithPackages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<CreateOrderResponse | null>(
    null
  )

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
          <h3 className="gradient-text font-bold text-lg mb-2">解锁完整课程</h3>
          <p className="text-slate-600 text-sm mb-4">
            程序化辅助工具：学员专属【筛选系统】，落地模型应用
          </p>
          <Button
            className="diffused-button text-white font-semibold border-0"
            onClick={() => {
              const el = document.getElementById('packages-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            获得机构级策略
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/30">
        <CardContent className="p-6">
          <h4 className="text-slate-800 font-semibold mb-4">课程包含内容</h4>
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
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
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
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
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
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
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
      <div id="packages-section" className="mt-2" />
      <Card className="glass-card border-white/30">
        <CardHeader>
          <CardTitle className="text-slate-800 text-xl font-bold">
            购买套餐
          </CardTitle>
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
                            className="min-w-[96px]"
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
          <h4 className="text-slate-800 font-semibold mb-4">学员专享权益</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h5 className="text-blue-800 font-medium text-sm mb-1">
                VIP交流群
              </h5>
              <p className="text-blue-600 text-xs">
                与导师和优秀学员直接交流，分享交易心得
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h5 className="text-purple-800 font-medium text-sm mb-1">
                一对一指导
              </h5>
              <p className="text-purple-600 text-xs">
                针对个人交易问题提供专业指导建议
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <h5 className="text-green-800 font-medium text-sm mb-1">
                实时策略更新
              </h5>
              <p className="text-green-600 text-xs">
                第一时间获取最新的市场策略和信号提醒
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <div className="text-xs text-amber-700 mb-1">
                  支付金额（唯一值）
                </div>
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
                    window.location.href = '/orders'
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
