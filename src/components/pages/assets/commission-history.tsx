'use client'

import { Wallet, History } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { useLanguage } from '@/src/contexts/language-context'
import type { CommissionRecord } from '@/src/types/user'

interface CommissionHistoryProps {
  records: CommissionRecord[]
  loading: boolean
}

export function CommissionHistory({
  records,
  loading
}: CommissionHistoryProps) {
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
          <p className="text-slate-600">{t('assets.noCommissionRecords')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {t('assets.inviteCommission')}
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
                  {t('assets.invitee')}:
                </span>
                <span className="text-sm text-slate-700">
                  {record.invitee_nickname}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">
                  {t('assets.email')}:
                </span>
                <span className="text-sm font-mono text-slate-700">
                  {record.invitee_email}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
