'use client'

import { useCallback, useEffect, useState, forwardRef } from 'react'
import html2canvas from 'html2canvas'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'
import { preloadImages } from '@/src/utils/image'

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
  if (!userInfo) return null

  const code = String(userInfo.myInviteCode || '').toUpperCase()

  return (
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
        unoptimized
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
            unoptimized
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
            unoptimized
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
InvitePoster.displayName = 'InvitePoster'

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

        // 等待下一帧与字体加载，减少文字排版差异
        await new Promise((resolve) => requestAnimationFrame(resolve))
        if ((document as any).fonts?.ready) {
          try {
            await (document as any).fonts.ready
          } catch {}
        }

        const scale = 2
        const width = 600
        const height = 800

        // 使用离屏克隆节点，避免受预览容器的 transform 等样式影响
        const offscreen = document.createElement('div')
        offscreen.style.position = 'absolute'
        offscreen.style.left = '-10000px'
        offscreen.style.top = '0'
        offscreen.style.width = `${width}px`
        offscreen.style.height = `${height}px`
        offscreen.style.backgroundColor = '#ffffff'
        // 防止系统字体缩放导致布局差异
        offscreen.style.webkitTextSizeAdjust = '100%'
        const clone = node.cloneNode(true) as HTMLDivElement
        clone.style.transform = 'none'
        clone.style.transformOrigin = 'top left'
        clone.style.width = `${width}px`
        clone.style.height = `${height}px`
        clone.style.backgroundColor = '#ffffff'
        offscreen.appendChild(clone)
        document.body.appendChild(offscreen)

        // 确保克隆节点内的图片已解码，避免渲染空白
        const cloneImgs = Array.from(clone.querySelectorAll('img'))
        cloneImgs.forEach((img) => {
          try {
            ;(img as HTMLImageElement).loading = 'eager'
          } catch {}
        })
        try {
          await Promise.all(
            cloneImgs.map(
              (img) =>
                (img as HTMLImageElement).decode?.().catch(() => {}) ||
                Promise.resolve()
            )
          )
        } catch {}

        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale,
          useCORS: true,
          allowTaint: false,
          width,
          height,
          imageTimeout: 15000,
          foreignObjectRendering: false,
          windowWidth: width,
          windowHeight: height,
          scrollX: 0,
          scrollY: 0
        })

        const dataUrl = canvas.toDataURL('image/png')
        // 清理离屏容器
        try {
          document.body.removeChild(offscreen)
        } catch {}
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
