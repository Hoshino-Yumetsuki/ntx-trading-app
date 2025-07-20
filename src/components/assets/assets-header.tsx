'use client'

import { ArrowLeft, Wallet, RefreshCw } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useLanguage } from '@/src/contexts/language-context'

interface AssetsHeaderProps {
  onBack: () => void
  currentView: 'assets' | 'history' | 'commission'
  onRefresh: () => void
  onViewChange: (view: 'assets' | 'history' | 'commission') => void
}

export function AssetsHeader({
  onBack,
  currentView,
  onRefresh,
  onViewChange
}: AssetsHeaderProps) {
  const { t } = useLanguage()

  return (
    <div className="glass-card-strong px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">
              {t('assets.title')}
            </h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* 切换按钮 */}
      <div className="flex space-x-2">
        <Button
          variant={currentView === 'assets' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('assets')}
          className="flex-1"
        >
          {t('assets.overview')}
        </Button>
        <Button
          variant={currentView === 'history' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('history')}
          className="flex-1"
        >
          {t('assets.withdrawHistory')}
        </Button>
        <Button
          variant={currentView === 'commission' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('commission')}
          className="flex-1"
        >
          {t('assets.commissionHistory')}
        </Button>
      </div>
    </div>
  )
}
