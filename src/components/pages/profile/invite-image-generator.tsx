'use client'

import { useCallback, useEffect, useState, forwardRef } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'
import { preloadImages } from '@/src/utils/image'
import { QRCodeCanvas } from '@/src/components/ui/qr-code-canvas'
import { generateImageWithRetry } from '@/src/utils/image-generation'
import { useLanguage } from '@/src/contexts/language-context'

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin)
    return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

export const InvitePoster = forwardRef<
  HTMLDivElement,
  {
    userInfo: UserInfo | null
    qrDataUrl: string
  }
>(({ userInfo, qrDataUrl }, ref) => {
  const { t } = useLanguage()

  if (!userInfo) return null

  const code = String(userInfo.myInviteCode || '').toUpperCase()

  return (
    <div
      ref={ref}
      className="relative bg-white overflow-hidden mx-auto"
      style={{ width: 600, height: 800 }}
    >
      <Image
        src="/分享-bg.png"
        alt=""
        fill
        priority
        sizes="600px"
        className="object-cover"
      />

      <div className="relative w-full h-full flex flex-col items-center">
        <div className="mt-14 rounded-2xl overflow-hidden outline outline-4 outline-white">
          <Image
            src="/NTX-LOGO优化-7.png"
            alt="NTX"
            width={84}
            height={84}
            className="block"
            priority
          />
        </div>

        <div
          className="mt-6 text-center text-gray-900 font-bold"
          style={{ fontSize: 28, lineHeight: '36px', fontFamily: 'sans-serif' }}
        >
          <div>{t('profile.inviteCode.slogan1')}</div>
          <div>{t('profile.inviteCode.slogan2')}</div>
        </div>
        <div
          className="mt-2 text-center text-gray-600"
          style={{ fontSize: 16, fontFamily: 'sans-serif' }}
        >
          {t('profile.inviteCode.benefit')}
        </div>

        <div
          className="mt-8 flex items-center justify-center"
          style={{ width: 243, height: 244 }}
        >
          <Image
            src="/share_p1.png"
            alt=""
            width={243}
            height={244}
            className="object-contain"
            priority
          />
        </div>

        <div
          className="mt-auto mb-8 mx-8 rounded-2xl bg-blue-600 text-white relative"
          style={{ height: 190 }}
        >
          <div className="relative h-full flex">
            <div className="flex-1 pl-14 pr-4 flex flex-col justify-center">
              <div
                className="text-white"
                style={{ fontSize: 20, fontFamily: 'sans-serif' }}
              >
                {t('profile.inviteCode.scanQrToRegister')}
              </div>
              <div
                className="mt-2 font-bold"
                style={{ fontSize: 30, fontFamily: 'sans-serif' }}
              >
                {t('profile.inviteCode.inviteCodeLabel')} {code}
              </div>
            </div>
            <div className="w-[168px] flex items-center justify-center pr-6">
              <div className="bg-white p-1.5">
                {qrDataUrl ? (
                  <QRCodeCanvas dataUrl={qrDataUrl} width={120} height={120} />
                ) : (
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      background: '#f3f4f6'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
InvitePoster.displayName = 'InvitePoster'

export function useInviteImageGenerator(userInfo: UserInfo | null) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (!userInfo?.myInviteCode) {
      setQrDataUrl('')
      return
    }
    const inviteUrl = `${getBaseUrl()}/register?invite=${userInfo.myInviteCode}`
    QRCode.toDataURL(inviteUrl, {
      width: 120,
      margin: 2,
      color: { dark: '#1e40af', light: '#ffffff' }
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''))
  }, [userInfo?.myInviteCode])

  const generateImage = useCallback(
    async (node: HTMLDivElement | null): Promise<string | null> => {
      if (!node || !userInfo?.myInviteCode) {
        console.error(
          'Generation prerequisites not met: DOM node or user info is missing.'
        )
        return null
      }
      if (!qrDataUrl) {
        console.error('QR code data is not ready.')
        return null
      }

      try {
        const staticImageUrls = [
          '/分享-bg.png',
          '/NTX-LOGO优化-7.png',
          '/share_p1.png'
        ]
        const allImageUrls = [...staticImageUrls, qrDataUrl]

        await preloadImages(allImageUrls)

        await new Promise((resolve) => setTimeout(resolve, 100))

        const width = 600
        const height = 800

        const result = await generateImageWithRetry(node, {
          width,
          height,
          pixelRatio: 2,
          minBlobSize: 100000,
          maxAttempts: 10,
          retryDelay: 500
        })

        return result
      } catch (error) {
        console.error('Failed to generate invite share image:', error)
        return null
      }
    },
    [userInfo, qrDataUrl]
  )

  return { generateImage, qrDataUrl }
}
