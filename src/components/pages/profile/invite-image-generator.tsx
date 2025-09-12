'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { toPng } from 'html-to-image'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'
import { preloadImages } from '@/src/utils/image'

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin)
    return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

export function useInviteImageGenerator(userInfo: UserInfo | null) {
  const posterRef = useRef<HTMLDivElement>(null)
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

  const generateImage = useCallback(async (): Promise<string | null> => {
    const node = posterRef.current
    if (!node || !userInfo?.myInviteCode || !qrDataUrl) {
      console.error('生成图片的前置条件不足')
      return null
    }

    try {
      // 步骤 1: 收集所有需要加载的图片资源
      const imageUrls = [
        '/分享-bg.png',
        '/NTX-LOGO优化-7.png',
        '/share_p1.png',
        qrDataUrl
      ]

      // 步骤 2: 执行预加载，确保图片数据已在浏览器缓存中
      await preloadImages(imageUrls)

      // 步骤 3: 等待下一帧，给浏览器足够的时间去绘制DOM
      await new Promise((resolve) => requestAnimationFrame(resolve))
      
      // 额外增加一个小的延时，作为iOS Safari的最后保障
      await new Promise((resolve) => setTimeout(resolve, 50));


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
  }, [userInfo, qrDataUrl])

  const InviteCanvas = useCallback(() => {
    if (!userInfo) return null
    const code = String(userInfo.myInviteCode || '').toUpperCase()

    //  ======= 核心修改点 =======
    //  将 -top-[9999px] 修改为 opacity-0，使其在视口内渲染但不可见
    return (
      <div
        className="fixed top-0 left-0 opacity-0 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <div
          ref={posterRef}
          className="relative bg-white overflow-hidden"
          style={{ width: 600, height: 800 }}
        >
          {/* ... 内部JSX结构保持不变 ... */}
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