'use client'

import { Wallet, History, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { useLanguage } from '@/src/contexts/language-context'
import type { WithdrawalRecord } from '@/src/types/user'

interface WithdrawalHistoryProps {
  records: WithdrawalRecord[]
  loading: boolean
}

export function WithdrawalHistory({
  records,
  loading
}: WithdrawalHistoryProps) {
  const { t } = useLanguage()

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return '0.00'
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          text: t('assets.status.pending')
        }
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          text: t('assets.status.confirmed')
        }
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          text: t('assets.status.failed')
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          text: status
        }
    }
  }

  if (loading) {
    return (
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
    )
  }

  if (records.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">{t('assets.noWithdrawalRecords')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
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
                      {record.currency.toUpperCase()} {t('assets.withdraw')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {formatDate(record.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
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
                    {t('assets.withdrawAmount')}:
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatBalance(record.amount)}{' '}
                    {record.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {t('assets.withdrawAddress')}:
                  </span>
                  <span className="text-sm font-mono text-slate-700 break-all">
                    {record.to_address.slice(0, 6)}...
                    {record.to_address.slice(-4)}
                  </span>
                </div>
                {record.confirmed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">
                      {t('assets.completedTime')}:
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
      })}
    </div>
  )
}
