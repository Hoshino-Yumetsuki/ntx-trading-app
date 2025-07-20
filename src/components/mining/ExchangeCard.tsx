'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { type Exchange, type UserExchange } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface ExchangeCardProps {
  exchanges: Exchange[]
  userExchanges: UserExchange[]
  exchangesLoading: boolean
  onBindExchange: (exchangeId: number, exchangeName: string) => void
  onModifyBinding: (exchangeId: number, exchangeName: string) => void
}

export function ExchangeCard({
  exchanges,
  userExchanges,
  exchangesLoading,
  onBindExchange,
  onModifyBinding
}: ExchangeCardProps) {
  const { t } = useLanguage()

  return (
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
                  <div className="premium-icon w-12 h-12 rounded-xl">
                    <span className="text-slate-700 text-sm font-bold">
                      {exchange.name.substring(0, 2).toUpperCase()}
                    </span>
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
                    variant="outline"
                    onClick={() =>
                      onModifyBinding(exchange.id, exchange.name)
                    }
                    className="border-0 px-4 py-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t('mining.exchange.modifyBinding')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() =>
                      onBindExchange(exchange.id, exchange.name)
                    }
                    className="diffused-button text-white border-0 px-4 py-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t('mining.exchange.goBind')}
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
  )
}
