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
import { useInviteImageGenerator } from './invite-image-generator'

interface InviteCodeCardProps {
  userInfo: UserInfo | null
}

export function InviteCodeCard({ userInfo }: InviteCodeCardProps) {
  const { t } = useLanguage()
  const [showShareModal, setShowShareModal] = useState(false)
  const { generateImage, ImageGeneratorComponent } =
    useInviteImageGenerator(userInfo)

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
      toast.success('邀请链接已复制到剪贴板')
    }
  }

  const openShareModal = () => {
    setShowShareModal(true)
  }

  return (
    <Card className="glass-card border-white/30 rounded-[16pt]">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.inviteCode.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[16pt] border border-blue-200">
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
              onClick={copyInviteCode}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!userInfo?.myInviteCode}
            >
              <Copy className="w-4 h-4 mr-1" />
              {t('profile.copy.button')}
            </Button>
            <Button
              size="sm"
              onClick={openShareModal}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              disabled={!userInfo?.myInviteCode}
            >
              <Share2 className="w-4 h-4 mr-1" />
              分享海报
            </Button>
          </div>
        </div>
        {userInfo?.invitedBy && (
          <div className="mt-3 text-sm text-gray-600">
            <p>
              {t('profile.inviteCode.invitedBy')}：{userInfo.invitedBy}
            </p>
          </div>
        )}
      </CardContent>

      {/* 分享海报模态框 */}
      <UniversalShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="分享邀请海报"
        shareData={{
          title: '注册 NTX DAO',
          text: `Web3 金融聚合返佣工具，快来参与交易挖矿！\n\n享受高达50%手续费返佣和交易挖矿\n\n邀请码：${userInfo?.myInviteCode || ''}`,
          url: userInfo?.myInviteCode
            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?invite=${userInfo.myInviteCode}`
            : ''
        }}
        imageGenerator={generateImage}
        showImagePreview={true}
        showCustomQrUpload={false}
        customActions={[
          {
            label: '复制邀请码',
            icon: Copy,
            onClick: copyInviteCode,
            variant: 'outline',
            className: 'w-full'
          },
          {
            label: '复制邀请链接',
            icon: Copy,
            onClick: copyInviteLink,
            variant: 'outline',
            className: 'w-full'
          }
        ]}
        showDefaultShareButtons={true}
        showCopyLinkButton={false}
      />

      {/* 图片生成器组件 */}
      <ImageGeneratorComponent />
    </Card>
  )
}
