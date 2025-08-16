'use client'

import { useCallback, useEffect, useState } from 'react'
import { getMyOrders } from '@/src/services/payment'
import type { Order } from '@/src/types/course'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getMyOrders()
      // Sort by created_at desc
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setOrders(sorted)
    } catch (e: any) {
      setError(e.message || '获取订单失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-start mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="mr-3 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">我的订单</h1>
            <p className="text-slate-600 text-sm">查看课程购买与支付状态</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" /> 刷新
          </Button>
        </div>
      </div>

      <div className="px-6 mt-6">
        <Card className="glass-card border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              订单列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-slate-600">加载订单中...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-500">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-600">暂无订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-slate-800 font-medium">
                        订单 #{o.id}
                        <span className="ml-2 text-xs text-slate-500">
                          套餐ID {o.package_id}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        应付 {o.amount} {o.currency} · 实付金额{' '}
                        {o.paymentAmount} {o.currency}
                      </div>
                      <div className="text-xs text-slate-500">
                        创建时间 {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>
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
                          ? '已确认'
                          : '已关闭'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
