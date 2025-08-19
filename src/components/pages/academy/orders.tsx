'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Order } from '@/src/types/course'
import { getMyOrders } from '@/src/services/payment'
import { getPermissionGroups } from '@/src/services/courseService'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [packageNameMap, setPackageNameMap] = useState<Record<number, string>>({})

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError('')
        const [ordersData, groups] = await Promise.all([
          getMyOrders(),
          getPermissionGroups().catch(() => [])
        ])
        const sorted = [...ordersData].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(sorted)

        const map: Record<number, string> = {}
        ;(groups || []).forEach((pg: any) => {
          const groupName = pg?.group?.name ?? ''
          ;(pg?.packages || []).forEach((p: any) => {
            const name = (p?.description?.trim?.() as string) || `${groupName} · ${p?.duration_days ?? ''}天`
            if (p?.id) map[p.id as number] = name
          })
        })
        setPackageNameMap(map)
      } catch (e: any) {
        setError(e.message || '获取订单失败')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const renderStatus = (o: Order) => {
    const base = 'px-2 py-1 rounded text-xs font-medium inline-flex items-center'
    if (o.status === 'confirmed') {
      return <span className={`${base} bg-green-100 text-green-700 border border-green-200`}>支付成功</span>
    }
    if (o.status === 'pending') {
      return <span className={`${base} bg-amber-100 text-amber-700 border border-amber-200`}>待支付/待确认</span>
    }
    return <span className={`${base} bg-slate-100 text-slate-700 border border-slate-200`}>已关闭</span>
  }

  const formatOrderNo = (o: Order) => {
    const d = new Date(o.created_at)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}${m}${day}0000${o.id}`
  }

  return (
    <div className="space-y-4">
      {/* 顶部说明与刷新 */}
      <div className="text-slate-600 text-sm -mt-2 mb-2">查看课程购买与支付状态</div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={async () => {
          try {
            setLoading(true)
            const data = await getMyOrders()
            const sorted = [...data].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            setOrders(sorted)
          } finally {
            setLoading(false)
          }
        }}>刷新</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-slate-600">加载订单中...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600">暂无订单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="glass-card border-white/40 shadow-md rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-slate-800 font-semibold">订单#{formatOrderNo(o)}</div>
                  <div className="text-slate-400 text-sm">{packageNameMap[o.package_id] ?? '-'}</div>
                </div>
                <div className="text-slate-700 text-sm">套餐金额 {o.amount} {o.currency}</div>
                <div className="text-blue-600 text-sm font-semibold mt-1">
                  实付金额 {o.paymentAmount} {o.currency}
                </div>
                <div className="text-slate-500 text-xs mt-1">创建时间 {new Date(o.created_at).toLocaleString()}</div>
                <div className="mt-3">{renderStatus(o)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
