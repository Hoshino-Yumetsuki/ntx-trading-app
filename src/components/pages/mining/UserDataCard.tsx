'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Users, Coins, DollarSign } from 'lucide-react'
import {
  formatCurrency,
  type UserData,
  type DailyUserData
} from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'

interface UserDataCardProps {
  user: any
  userData: UserData | null
  dailyData: DailyUserData | null
  userLoading: boolean
}

export function UserDataCard({
  user,
  userData,
  dailyData,
  userLoading
}: UserDataCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/50">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center">
          <div className="premium-icon w-8 h-8 rounded-lg mr-3">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          {t('mining.user.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="text-center py-8">
            <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">{t('mining.user.loginPrompt')}</p>
            <p className="text-sm text-gray-400">
              {t('mining.user.loginDescription')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                </div>
                <p
                  className={`text-xl font-bold text-yellow-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-20 mx-auto' : ''}`}
                >
                  {userLoading
                    ? ''
                    : userData && userData.total_mining !== undefined
                      ? formatCurrency(userData.total_mining, 'NTX')
                      : '--'}
                </p>
                <p className="text-slate-600 text-sm">
                  {t('mining.user.totalMining')}
                </p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-10 h-10 rounded-lg mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-red-500" />
                </div>
                <p
                  className={`text-xl font-bold text-red-500 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-20 mx-auto' : ''}`}
                >
                  {userLoading
                    ? ''
                    : userData && userData.total_trading_cost !== undefined
                      ? formatCurrency(userData.total_trading_cost, 'USDT')
                      : '--'}
                </p>
                <p className="text-slate-600 text-sm">
                  {t('mining.user.totalTradingCost')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                </div>
                <p
                  className={`text-lg font-bold text-yellow-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-16 mx-auto' : ''}`}
                >
                  {userLoading
                    ? ''
                    : dailyData && dailyData.mining_output !== undefined
                      ? `+${formatCurrency(dailyData.mining_output, 'NTX')}`
                      : '--'}
                </p>
                <p className="text-slate-600 text-sm">
                  {t('mining.user.dailyMining')}
                </p>
              </div>
              <div className="text-center data-card p-5 rounded-xl">
                <div className="premium-icon w-8 h-8 rounded-lg mx-auto mb-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                </div>
                <p
                  className={`text-lg font-bold text-red-500 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-16 mx-auto' : ''}`}
                >
                  {userLoading
                    ? ''
                    : dailyData && dailyData.total_trading_cost !== undefined
                      ? dailyData.total_trading_cost === 0
                        ? formatCurrency(dailyData.total_trading_cost, 'USDT')
                        : `-${formatCurrency(dailyData.total_trading_cost, 'USDT')}`
                      : '--'}
                </p>
                <p className="text-slate-600 text-sm">
                  {t('mining.user.dailyTradingCost')}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
