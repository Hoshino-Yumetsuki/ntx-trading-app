'use client'

import { ArrowLeft, RefreshCw } from 'lucide-react'
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
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">
            {t('assets.title')}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* 切换按钮 - 使用挖矿数据页面类似的样式 */}
      <div className="flex space-x-1 bg-slate-100/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200/50">
        <button
          type="button"
          onClick={() => onViewChange('assets')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentView === 'assets'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          {t('assets.overview')}
        </button>
        <button
          type="button"
          onClick={() => onViewChange('history')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentView === 'history'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          {t('assets.withdrawHistory')}
        </button>
        <button
          type="button"
          onClick={() => onViewChange('commission')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentView === 'commission'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          {t('assets.commissionHistory')}
        </button>
      </div>
    </div>
  )
}
