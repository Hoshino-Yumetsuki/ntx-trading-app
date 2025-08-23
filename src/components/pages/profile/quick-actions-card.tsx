'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Shield, ChevronRight, DollarSign } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'

interface QuickActionsCardProps {
  onNavigate: (page: 'assets' | 'security') => void
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
    }
  ]

  return (
    <Card className="glass-card border-white/30 rounded-[16pt]">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              type="button"
              className="flex items-center justify-between p-4 glass-card rounded-[16pt] hover:bg-white/40 transition-all cursor-pointer w-full text-left"
              onClick={item.onClick}
            >
              <div className="flex items-center space-x-3">
                <div className="premium-icon w-10 h-10 rounded-[16pt]">
                  <Icon className="w-5 h-5 text-slate-600" />
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
      </CardContent>
    </Card>
  )
}
