'use client'

import { useRef, useCallback, useEffect, useState, forwardRef } from 'react' // Import forwardRef
import { toPng } from 'html-to-image'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'
import { preloadImages } from '@/src/utils/image'

// --- Helper Functions ---
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin)
    return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

/**
 * Invite Poster Component - Now wrapped in forwardRef
 */
export const InvitePoster = forwardRef<
  HTMLDivElement,
  {
    userInfo: UserInfo | null
    qrDataUrl: string
  }
>(({ userInfo, qrDataUrl }, ref) => { // ref is now the second argument
  if (!userInfo) return null

  const code = String(userInfo.myInviteCode || '').toUpperCase()

  return (
    // The forwarded ref is attached here
    <div
      ref={ref}
      className="relative bg-white overflow-hidden mx-auto"
      style={{ width: 600, height: 800 }}
    >
      {/* Background Image */}
      <Image
        src="/分享-bg.png"
        alt=""
        fill
        priority
        sizes="600px"
        className="object-cover"
      />

      {/* Content Container */}
      <div className="relative w-full h-full flex flex-col items-center">
        {/* Logo */}
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

        {/* Title */}
        <div
          className="mt-6 text-center text-gray-900 font-bold"
          style={{ fontSize: 28, lineHeight: '36px' }}
        >
          <div>注册 NTX DAO，连接用户聚合资源，</div>
          <div>挖掘你的 Web3 机会</div>
        </div>
        <div
          className="mt-2 text-center text-gray-600"
          style={{ fontSize: 16 }}
        >
          享受高达60%手续费返佣和挖矿交易
        </div>

        {/* Middle Banner */}
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

        {/* Bottom Card */}
        <div
          className="mt-auto mb-8 mx-8 rounded-2xl bg-blue-600 text-white relative"
          style={{ height: 190 }}
        >
          <div className="relative h-full flex">
            <div className="flex-1 pl-14 pr-4 flex flex-col justify-center">
              <div className="text-white" style={{ fontSize: 20 }}>
                扫描二维码, 注册 NTX DAO
              </div>
              <div className="mt-2 font-bold" style={{ fontSize: 30 }}>
                邀请码： {code}
              </div>
            </div>
            <div className="w-[168px] flex items-center justify-center pr-6">
              <div className="bg-white p-1.5">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="QR"
                    width={120}
                    height={120}
                    unoptimized
                  />
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
// Add display name for better debugging
InvitePoster.displayName = 'InvitePoster';


/**
 * Hook for generating the invite share image.
 * @param userInfo - User information
 */
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
        console.error('Generation prerequisites not met: DOM node or user info is missing.')
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
        
        await new Promise((resolve) => setTimeout(resolve, 100));

        const dataUrl = await toPng(node, {
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: 2,
          fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit'
          },
          width: node.scrollWidth,
          height: node.scrollHeight
        })

        return dataUrl
      } catch (error) {
        console.error('Failed to generate invite share image:', error)
        return null
      }
    },
    [userInfo, qrDataUrl]
  )

  return { generateImage, qrDataUrl }
}