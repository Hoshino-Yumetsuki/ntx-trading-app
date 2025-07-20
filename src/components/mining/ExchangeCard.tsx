'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { ExternalLink, UserX, UserPlus } from 'lucide-react'
import type { Exchange, UserExchange } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

interface ExchangeCardProps {
  exchanges: Exchange[]
  userExchanges: UserExchange[]
  exchangesLoading: boolean
  onBindExchange: (exchangeId: number, uid: string) => void
  onUnbindExchange: (exchangeId: number) => void
}

export function ExchangeCard({
  exchanges,
  userExchanges,
  exchangesLoading,
  onBindExchange,
  onUnbindExchange
}: ExchangeCardProps) {
  const { t } = useLanguage()
  const [bindingExchangeId, setBindingExchangeId] = useState<number | null>(
    null
  )
  const [uid, setUid] = useState('')
  const [isBindDialogOpen, setIsBindDialogOpen] = useState(false)

  // 获取交易所图标路径
  const getExchangeIcon = (exchangeName: string) => {
    const name = exchangeName.toLowerCase()
    const iconMap: { [key: string]: string } = {
      'binance': '/exchange/binance.png',
      'bitget': '/exchange/bitget.png',
      'bybit': '/exchange/bybit.jpg',
      'htx': '/exchange/htx.jpg',
      'xt': '/exchange/xt.png'
    }
    return iconMap[name] || null
  }

  const handleBindClick = (exchangeId: number) => {
    setBindingExchangeId(exchangeId)
    setUid('')
    setIsBindDialogOpen(true)
  }

  const handleBindConfirm = () => {
    if (bindingExchangeId && uid.trim()) {
      onBindExchange(bindingExchangeId, uid.trim())
      setIsBindDialogOpen(false)
      setBindingExchangeId(null)
      setUid('')
    }
  }

  const handleUnbind = (exchangeId: number) => {
    onUnbindExchange(exchangeId)
  }

  return (
    <>
      <Card className="glass-card border-white/50">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            {t('mining.exchange.title')}
          </CardTitle>
          <p className="text-slate-600 text-sm ml-11">
            {t('mining.exchange.description')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {exchangesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 data-card rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          ) : exchanges.length > 0 ? (
            exchanges.map((exchange, _index) => {
              const isUserBound = userExchanges.some(
                (ue) => ue.id === exchange.id
              )
              return (
                <div
                  key={exchange.id}
                  className="flex items-center justify-between p-5 data-card rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                      {getExchangeIcon(exchange.name) ? (
                        <Image
                          src={getExchangeIcon(exchange.name)!}
                          alt={exchange.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-slate-700 text-sm font-bold">
                          {exchange.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-lg">
                        {exchange.name}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {t('mining.exchange.efficiency')}:{' '}
                        {exchange.mining_efficiency.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    {isUserBound ? (
                      <div>
                        <p className="text-green-600 font-bold text-sm">
                          {t('mining.exchange.status.bound')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-blue-600 font-bold text-sm">
                          {t('mining.exchange.status.unbound')}
                        </p>
                      </div>
                    )}
                  </div>
                  {isUserBound ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUnbind(exchange.id)}
                      className="px-4 py-2"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      {t('mining.exchange.unbind') || '解绑'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleBindClick(exchange.id)}
                      className="diffused-button text-white border-0 px-4 py-2"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t('mining.exchange.bind') || '绑定'}
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                {t('mining.exchange.noExchanges')}
              </p>
              <p className="text-sm text-gray-400">
                {t('mining.exchange.tryLater')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 绑定对话框 */}
      <Dialog open={isBindDialogOpen} onOpenChange={setIsBindDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('mining.exchange.bindTitle') || '绑定交易所'}
            </DialogTitle>
            <DialogDescription>
              {t('mining.exchange.bindDescription') ||
                '请输入您在交易所的 UID 来绑定账户'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="uid-input"
                className="text-sm font-medium text-slate-700"
              >
                {t('mining.exchange.uid') || 'UID'}
              </label>
              <Input
                id="uid-input"
                placeholder={
                  t('mining.exchange.uidPlaceholder') || '请输入您的 UID'
                }
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBindDialogOpen(false)}
            >
              {t('common.cancel') || '取消'}
            </Button>
            <Button
              onClick={handleBindConfirm}
              disabled={!uid.trim()}
              className="diffused-button text-white"
            >
              {t('mining.exchange.confirmBind') || '确认绑定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
