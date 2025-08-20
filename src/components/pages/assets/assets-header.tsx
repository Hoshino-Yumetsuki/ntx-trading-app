'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

interface AssetsHeaderProps {
  onBack: () => void
  currentView: 'assets' | 'history' | 'commission'
  onRefresh: () => void
  onViewChange: (view: 'assets' | 'history' | 'commission') => void
}

export function AssetsHeader({
  onBack,
  currentView,
  onRefresh: _onRefresh,
  onViewChange
}: AssetsHeaderProps) {
  const { t } = useLanguage()
  // Mark as used to satisfy linter; refresh is provided by parent when needed
  void _onRefresh

  return (
    <div className="px-6 pt-12 pb-4 relative z-10">
      {/* 顶部：返回与标识，与新手教程保持一致 */}
      <div className="flex items-center space-x-3 mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative w-28 h-9 md:w-32 md:h-10">
          <Image
            src="/Frame17@3x.png"
            alt="NTX Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Header Banner：左文右图 */}
      <div className="relative mb-4 rounded-2xl overflow-visible">
        <div className="relative h-28">
          {/* 左侧标题 */}
          <div className="relative z-10 h-full flex items-center pl-1 pr-40">
            <h1 className="text-2xl font-bold text-blue-600">
              {t('assets.title')}
            </h1>
          </div>
          {/* 右侧图标 */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 z-0 pointer-events-none">
            <Image
              src="/9481dc54cf0484575744a3a5008ed6911@3x.png"
              alt="Assets Header"
              fill
              className="object-contain object-right"
              priority
            />
          </div>
        </div>
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
