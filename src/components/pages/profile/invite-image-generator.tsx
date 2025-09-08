'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { toPng } from 'html-to-image'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'
import { preloadImages } from '@/src/utils/image' // 导入预加载函数

// 资源缓存，避免重复加载与重复生成
const _imageCache = new Map<string, Promise<HTMLImageElement>>()
const _qrImageCache = new Map<string, Promise<HTMLImageElement>>()

// --- 辅助函数 (保持不变) ---

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin)
    return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

// ... createRoundedRectPath, loadImage, getQrImage 等其他辅助函数保持不变 ...

// --- 核心 Hook ---

/**
 * 用于生成邀请分享图的 Hook
 * @param userInfo - 用户信息
 */
export function useInviteImageGenerator(userInfo: UserInfo | null) {
  const posterRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  // 此 useEffect 仍然有用，因为它可以在用户界面上提前显示二维码
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

  const generateImage = useCallback(async (): Promise<string | null> => {
    const node = posterRef.current
    if (!node || !userInfo?.myInviteCode) {
      console.error('生成图片的前置条件不足：DOM 未渲染或用户信息不完整')
      return null
    }

    if (!qrDataUrl) {
      console.error('二维码数据尚未准备好，无法生成图片。')
      return null
    }

    try {
      // 步骤 1: 定义所有需要加载的图片资源
      const staticImageUrls = ['/分享-bg.png', '/NTX-LOGO优化-7', '/share_p1.png']
      const allImageUrls = [...staticImageUrls, qrDataUrl]

      // 步骤 2: 【核心】执行预加载，等待所有图片下载到浏览器缓存中
      await preloadImages(allImageUrls)

      // 步骤 3: 给浏览器一帧的时间来确保所有元素都已绘制完毕
      await new Promise((resolve) => requestAnimationFrame(resolve))

      // 步骤 4: 执行截图
      const dataUrl = await toPng(node, {
        backgroundColor: '#ffffff',
        cacheBust: false,
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
      console.error('生成邀请分享图片失败:', error)
      return null
    }
  }, [userInfo, qrDataUrl]) // 依赖项中加入 qrDataUrl

  // 返回一个需要被渲染的、隐藏的 DOM 海报组件
  const InviteCanvas = useCallback(() => {
    // 如果没有用户信息，则无需渲染 canvas，以节省资源
    if (!userInfo) return null

    const code = String(userInfo.myInviteCode || '').toUpperCase()

    return (
      <div
        className="fixed -top-[9999px] left-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={posterRef}
          className="relative bg-white overflow-hidden"
          style={{ width: 600, height: 800 }}
        >
          {/* 背景图 */}
          <Image
            src="/分享-bg.png"
            alt=""
            fill
            priority
            sizes="600px"
            className="object-cover"
          />

          {/* 内容容器 */}
          <div className="relative w-full h-full flex flex-col items-center">
            {/* Logo */}
            <div className="mt-14 rounded-2xl overflow-hidden outline outline-4 outline-white">
              <Image
                src="/NTX-LOGO优化-7"
                alt="NTX"
                width={84}
                height={84}
                className="block"
                priority
              />
            </div>

            {/* 标题 */}
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

            {/* 中部 Banner */}
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

            {/* 底部卡片 */}
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
      </div>
    )
  }, [userInfo, qrDataUrl])

  return { generateImage, InviteCanvas }
}
