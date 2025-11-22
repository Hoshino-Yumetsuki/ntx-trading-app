'use client'

import { Card } from '@/src/components/ui/card'
import { Shield, ChevronRight, DollarSign, FileText, Gift } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'

interface QuickActionsCardProps {
  onNavigate: (page: 'assets' | 'security' | 'orders' | 'mission') => void
}

export function QuickActionsCard({ onNavigate }: QuickActionsCardProps) {
  const { t } = useLanguage()

  const menuItems = [
    {
      icon: DollarSign,
      label: t('profile.menu.assets.title'),
      description: t('profile.menu.assets.description'),
      onClick: () => onNavigate('assets')
    },
    {
      icon: Shield,
      label: t('profile.menu.security.title'),
      description: t('profile.menu.security.description'),
      onClick: () => onNavigate('security')
    },
    {
      icon: FileText,
      label: t('profile.menu.orders.title') || '我的订单',
      description:
        t('profile.menu.orders.description') || '查看购买记录与支付状态',
      onClick: () => onNavigate('orders')
    },
    {
      icon: Gift,
      label: '任务中心',
      description: '完成任务领取奖励',
      onClick: () => onNavigate('mission')
    }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-800 font-medium">
          {t('profile.quickActions')}
        </h3>
      </div>

      <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              type="button"
              key={index}
              className={`flex items-center justify-between p-3 hover:bg-white/40 transition-all w-full text-left ${index < menuItems.length - 1 ? 'border-b border-white/20' : ''}`}
              onClick={item.onClick}
            >
              <div className="flex items-center space-x-3">
                <div className="premium-icon w-8 h-8 rounded-[12pt] bg-blue-100/50">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-800 font-medium">{item.label}</p>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          )
        })}
      </Card>
    </div>
  )
}
