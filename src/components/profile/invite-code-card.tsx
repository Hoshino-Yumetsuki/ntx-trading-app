'use client'

import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Copy } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'

interface InviteCodeCardProps {
  userInfo: UserInfo | null
}

export function InviteCodeCard({ userInfo }: InviteCodeCardProps) {
  const { t } = useLanguage()

  const copyInviteCode = () => {
    if (userInfo?.myInviteCode) {
      navigator.clipboard.writeText(userInfo.myInviteCode)
      toast.success(t('profile.copy.success'))
    }
  }

  return (
    <Card className="glass-card border-white/30">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.inviteCode.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">
              {t('profile.inviteCode.description')}
            </p>
            <p className="text-lg font-mono font-bold text-blue-600">
              {userInfo?.myInviteCode || 'Loading...'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={copyInviteCode}
            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!userInfo?.myInviteCode}
          >
            <Copy className="w-4 h-4 mr-1" />
            {t('profile.copy.button')}
          </Button>
        </div>
        {userInfo?.invitedBy && (
          <div className="mt-3 text-sm text-gray-600">
            <p>
              {t('profile.inviteCode.invitedBy')}：{userInfo.invitedBy}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
