'use client'

import { Hammer, Database } from 'lucide-react'
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
    <>
      {!user ? (
        <div className="text-center py-8">
          <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{t('mining.user.loginPrompt')}</p>
          <p className="text-sm text-gray-400">
            {t('mining.user.loginDescription')}
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-slate-700 mb-3">
            {t('mining.user.title') || '我的数据'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center data-card p-5 rounded-xl">
              <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-3">
                <Hammer className="w-6 h-6 text-blue-600" />
              </div>
              <p
                className={`text-2xl font-bold text-blue-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-24 mx-auto' : ''}`}
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
              <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-3">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <p
                className={`text-2xl font-bold text-blue-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-7 w-24 mx-auto' : ''}`}
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
              <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-2">
                <Hammer className="w-5 h-5 text-blue-600" />
              </div>
              <p
                className={`text-xl font-bold text-blue-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-20 mx-auto' : ''}`}
              >
                {userLoading
                  ? ''
                  : dailyData && dailyData.mining_output !== undefined
                    ? formatCurrency(dailyData.mining_output, 'NTX')
                    : '--'}
              </p>
              <p className="text-slate-600 text-sm">
                {t('mining.user.dailyMining')}
              </p>
            </div>
            <div className="text-center data-card p-5 rounded-xl">
              <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-2">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <p
                className={`text-xl font-bold text-blue-600 mb-1 ${userLoading ? 'animate-pulse bg-gray-200 rounded h-6 w-20 mx-auto' : ''}`}
              >
                {userLoading
                  ? ''
                  : dailyData && dailyData.total_trading_cost !== undefined
                    ? formatCurrency(dailyData.total_trading_cost, 'USDT')
                    : '--'}
              </p>
              <p className="text-slate-600 text-sm">
                {t('mining.user.dailyTradingCost')}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
