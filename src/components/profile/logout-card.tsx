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
    <Card className="glass-card border-white/30">
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50/50"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('profile.logout.title')}
        </Button>
      </CardContent>
    </Card>
  )
}
