'use client'

import { useState } from 'react'
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { toast } from 'sonner'
import { useLanguage } from '@/src/contexts/language-context'
import type { UserInfo } from '@/src/types/user'

interface AssetsOverviewProps {
  userInfo: UserInfo
  onWithdraw: (type: 'usdt' | 'ntx') => void
  onNavigate?: (page: 'security') => void
}

export function AssetsOverview({
  userInfo,
  onWithdraw,
  onNavigate
}: AssetsOverviewProps) {
  const { t } = useLanguage()
  const [addressCopied, setAddressCopied] = useState(false)

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return '0.00'

    if (balance >= 1000000) {
      return `${(balance / 1000000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}M`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}K`
    }

    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const copyAddress = async () => {
    if (userInfo.bscAddress) {
      try {
        await navigator.clipboard.writeText(userInfo.bscAddress)
        setAddressCopied(true)
        toast.success(t('common.copied'))
        setTimeout(() => setAddressCopied(false), 2000)
      } catch (_error) {
        toast.error(t('common.copyFailed'))
      }
    }
  }

  return (
    <>
      <div className="space-y-4 mb-6">
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
                onClick={() => onWithdraw('usdt')}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('assets.withdraw')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-right">
              <p
                className="font-bold text-slate-800 truncate"
                style={{
                  fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formatBalance(userInfo.usdtBalance)}
              </p>
              <p className="text-sm text-slate-600">
                {t('assets.availableBalance')}
              </p>
            </div>
          </CardContent>
        </Card>

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
                onClick={() => onWithdraw('ntx')}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('assets.withdraw')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-right">
              <p
                className="font-bold text-slate-800 truncate"
                style={{
                  fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formatBalance(userInfo.ntxBalance)}
              </p>
              <p className="text-sm text-slate-600">
                {t('assets.availableBalance')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {t('assets.bscWalletAddress')}
              </h3>
              <p className="text-sm text-slate-600">Binance Smart Chain</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-slate-700 break-all">
              {userInfo.bscAddress || t('assets.notSet')}
            </p>
            {userInfo.bscAddress ? (
              <Button
                size="sm"
                variant="outline"
                onClick={copyAddress}
                className="shrink-0"
              >
                {addressCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onNavigate?.('security')}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0"
              >
                去绑定
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
