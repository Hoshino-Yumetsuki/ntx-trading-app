'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { LogOut } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'

interface LogoutCardProps {
  onLogout: () => void
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="glass-card border-white/30 rounded-[16pt] transition-all duration-300 hover:shadow-lg hover:shadow-red-100/50 hover:border-red-200/50">
      <CardContent className="p-4">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-[240px] h-[32px] text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-[8pt] text-sm font-semibold justify-center"
            onClick={onLogout}
          >
            <span className="inline-flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              {t('profile.logout.title')}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
