'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Copy, Share2 } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'
import { UniversalShareModal } from '@/src/components/ui/universal-share-modal'
import { useInviteImageGenerator, InvitePoster } from './invite-image-generator'
import { MissionService } from '@/src/services/mission'

interface InviteCodeCardProps {
  userInfo: UserInfo | null
}

export function InviteCodeCard({ userInfo }: InviteCodeCardProps) {
  const { t } = useLanguage()
  const [showShareModal, setShowShareModal] = useState(false)

  const { generateImage, qrDataUrl } = useInviteImageGenerator(userInfo)

  const copyInviteCode = () => {
    if (userInfo?.myInviteCode) {
      navigator.clipboard.writeText(userInfo.myInviteCode)
      toast.success(t('profile.copy.success'))
    }
  }

  const copyInviteLink = () => {
    if (userInfo?.myInviteCode) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const inviteUrl = `${origin}/register?invite=${userInfo.myInviteCode}`
      navigator.clipboard.writeText(inviteUrl)
      toast.success(t('profile.share.inviteLinkCopied'))
    }
  }

  const openShareModal = () => {
    setShowShareModal(true)
  }

  const handleShare = () => {
    // 上报每日分享任务
    MissionService.reportAction('daily_share')
  }

  return (
    <Card className="glass-card border-white/30 rounded-[16pt]">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.inviteCode.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-[16pt] border border-blue-200">
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">
              {t('profile.inviteCode.description')}
            </p>
            <p className="text-lg font-mono font-bold text-blue-600">
              {userInfo?.myInviteCode || 'Loading...'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={copyInviteLink}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!userInfo?.myInviteCode}
            >
              <Copy className="w-4 h-4 mr-1" />
              {t('profile.share.copyLink')}
            </Button>
            <Button
              size="sm"
              onClick={openShareModal}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              disabled={!userInfo?.myInviteCode}
            >
              <Share2 className="w-4 h-4 mr-1" />
              {t('profile.share.sharePoster')}
            </Button>
          </div>
        </div>
      </CardContent>

      <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={t('profile.share.shareInvitePoster')}
        onShare={handleShare}
        shareData={{
          title: t('profile.inviteCode.registerTitle'),
          text: `Web3 金融聚合返佣工具，快来参与交易挖矿！\n\n${t('profile.inviteCode.benefit')}\n\n${t('profile.inviteCode.inviteCodeLabel')}${userInfo?.myInviteCode || ''}`,
          url: userInfo?.myInviteCode
            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?invite=${userInfo.myInviteCode}`
            : ''
        }}
        imageGenerator={generateImage}
        posterComponent={
          <InvitePoster userInfo={userInfo} qrDataUrl={qrDataUrl} />
        }
        showImagePreview={true}
        showCustomQrUpload={false}
        customActions={[
          {
            label: t('profile.share.copyInviteLink'),
            icon: Copy,
            onClick: copyInviteLink,
            variant: 'outline',
            className: 'w-full'
          },
          {
            label: t('profile.share.copyInviteCode'),
            icon: Copy,
            onClick: copyInviteCode,
            variant: 'outline',
            className: 'w-full'
          }
        ]}
        showDefaultShareButtons={true}
        showCopyLinkButton={false}
      />
    </Card>
  )
}
