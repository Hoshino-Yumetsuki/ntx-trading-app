'use client'

import { useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'

interface InviteImageGeneratorProps {
  userInfo: UserInfo | null
  onImageGenerated?: (imageUrl: string) => void
}

export function InviteImageGenerator({
  userInfo,
  onImageGenerated
}: InviteImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const _generateInviteShareImage = useCallback(async (): Promise<
    string | null
  > => {
    if (!canvasRef.current || !userInfo?.myInviteCode) return null

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // 设置画布尺寸
      canvas.width = 600
      canvas.height = 800

      // 背景图（cover 绘制）
      try {
        const bgImg = new window.Image()
        bgImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve
          bgImg.onerror = reject
          bgImg.src = '/分享-bg.png'
        })
        const scale = Math.max(
          canvas.width / bgImg.width,
          canvas.height / bgImg.height
        )
        const dw = bgImg.width * scale
        const dh = bgImg.height * scale
        const dx = (canvas.width - dw) / 2
        const dy = (canvas.height - dh) / 2
        ctx.drawImage(bgImg, dx, dy, dw, dh)
      } catch (_bgErr) {
        // 兜底为纯白背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // 加载并绘制顶部圆角方形 logo
      try {
        const logoImg = new window.Image()
        logoImg.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          logoImg.src = '/ntx_1_1.jpg'
        })
        // 绘制 logo (居中，圆角方形)
        const logoSize = 84
        const logoX = (canvas.width - logoSize) / 2
        const logoY = 60
        const r = 16
        // 裁剪路径（圆角矩形）
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(logoX + r, logoY)
        ctx.lineTo(logoX + logoSize - r, logoY)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY,
          logoX + logoSize,
          logoY + r
        )
        ctx.lineTo(logoX + logoSize, logoY + logoSize - r)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY + logoSize,
          logoX + logoSize - r,
          logoY + logoSize
        )
        ctx.lineTo(logoX + r, logoY + logoSize)
        ctx.quadraticCurveTo(
          logoX,
          logoY + logoSize,
          logoX,
          logoY + logoSize - r
        )
        ctx.lineTo(logoX, logoY + r)
        ctx.quadraticCurveTo(logoX, logoY, logoX + r, logoY)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()
        // 边框
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(logoX + r, logoY)
        ctx.lineTo(logoX + logoSize - r, logoY)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY,
          logoX + logoSize,
          logoY + r
        )
        ctx.lineTo(logoX + logoSize, logoY + logoSize - r)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY + logoSize,
          logoX + logoSize - r,
          logoY + logoSize
        )
        ctx.lineTo(logoX + r, logoY + logoSize)
        ctx.quadraticCurveTo(
          logoX,
          logoY + logoSize,
          logoX,
          logoY + logoSize - r
        )
        ctx.lineTo(logoX, logoY + r)
        ctx.quadraticCurveTo(logoX, logoY, logoX + r, logoY)
        ctx.closePath()
        ctx.stroke()
      } catch (error) {
        console.error('加载logo失败:', error)
        // 如果logo加载失败，绘制默认的NTX文字
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('NTX', canvas.width / 2, 150)
      }

      // 主副标题（参照设计稿：两行主标题 + 一行副标题）
      ctx.fillStyle = '#111827'
      ctx.textAlign = 'center'
      ctx.font = 'bold 28px Arial'
      ctx.fillText('注册 NTX DAO，连接用户聚合资源，', canvas.width / 2, 250)
      ctx.fillText('挖掘你的 Web3 机会', canvas.width / 2, 284)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial'
      ctx.fillText('享受高达60%手续费返佣和挖矿交易', canvas.width / 2, 320)

      // 中部图案：Frame48@3x.png（不降级）
      try {
        const bannerImg = new window.Image()
        bannerImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          bannerImg.onload = resolve
          bannerImg.onerror = reject
          bannerImg.src = '/Frame48@3x.png'
        })

        const bannerW = 200
        const bannerH = 120
        const bannerX = (canvas.width - bannerW) / 2
        const bannerY = 320
        const scale = Math.min(
          bannerW / bannerImg.width,
          bannerH / bannerImg.height
        )
        const drawW = bannerImg.width * scale
        const drawH = bannerImg.height * scale
        const drawX = bannerX + (bannerW - drawW) / 2
        const drawY = bannerY + (bannerH - drawH) / 2
        ctx.drawImage(bannerImg, drawX, drawY, drawW, drawH)
      } catch (_e) {}

      // 底部蓝色信息卡片（圆角）
      const cardX = 30
      const cardY = 560
      const cardW = canvas.width - 60
      const cardH = 190
      const cardR = 16
      ctx.fillStyle = '#2563eb'
      ctx.beginPath()
      ctx.moveTo(cardX + cardR, cardY)
      ctx.lineTo(cardX + cardW - cardR, cardY)
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR)
      ctx.lineTo(cardX + cardW, cardY + cardH - cardR)
      ctx.quadraticCurveTo(
        cardX + cardW,
        cardY + cardH,
        cardX + cardW - cardR,
        cardY + cardH
      )
      ctx.lineTo(cardX + cardR, cardY + cardH)
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR)
      ctx.lineTo(cardX, cardY + cardR)
      ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.font = '14px Arial'
      ctx.fillText('扫描二维码, 注册 NTX DAO', cardX + 24, cardY + 36)
      ctx.font = 'bold 30px Arial'
      ctx.fillText(
        `邀请码： ${String(userInfo.myInviteCode).toUpperCase()}`,
        cardX + 24,
        cardY + 80
      )

      // 生成二维码（SSR 兜底：NEXT_PUBLIC_BASE_URL）
      const baseUrl =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_URL || ''
      const inviteUrl = `${baseUrl}/register?invite=${userInfo.myInviteCode}`
      const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })

      // 绘制二维码
      const qrImg = new window.Image()
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve
        qrImg.onerror = reject
        qrImg.src = qrDataUrl
      })

      const qrSize = 120
      const qrPadding = 6
      const qrX = cardX + cardW - 24 - (qrSize + qrPadding * 2)
      const qrY = cardY + (cardH - (qrSize + qrPadding * 2)) / 2
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX, qrY, qrSize + qrPadding * 2, qrSize + qrPadding * 2)
      ctx.drawImage(qrImg, qrX + qrPadding, qrY + qrPadding, qrSize, qrSize)

      const imageDataUrl = canvas.toDataURL('image/png', 0.9)
      onImageGenerated?.(imageDataUrl)
      return imageDataUrl
    } catch (error) {
      console.error('生成邀请分享图片失败:', error)
      throw error
    }
  }, [userInfo, onImageGenerated])

  if (!userInfo) return null

  return (
    <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

// Hook to use the invite image generator
export function useInviteImageGenerator(userInfo: UserInfo | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!canvasRef.current || !userInfo?.myInviteCode) return null

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // 设置画布尺寸
      canvas.width = 600
      canvas.height = 800

      // 背景图（cover 绘制）
      try {
        const bgImg = new window.Image()
        bgImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve
          bgImg.onerror = reject
          bgImg.src = '/分享-bg.png'
        })
        const scale = Math.max(
          canvas.width / bgImg.width,
          canvas.height / bgImg.height
        )
        const dw = bgImg.width * scale
        const dh = bgImg.height * scale
        const dx = (canvas.width - dw) / 2
        const dy = (canvas.height - dh) / 2
        ctx.drawImage(bgImg, dx, dy, dw, dh)
      } catch (_bgErr) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // 加载并绘制顶部圆角方形 logo
      try {
        const logoImg = new window.Image()
        logoImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          logoImg.src = '/ntx_1_1.jpg'
        })

        // 绘制 logo (居中，圆角方形)
        const logoSize = 84
        const logoX = (canvas.width - logoSize) / 2
        const logoY = 60
        const r = 16
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(logoX + r, logoY)
        ctx.lineTo(logoX + logoSize - r, logoY)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY,
          logoX + logoSize,
          logoY + r
        )
        ctx.lineTo(logoX + logoSize, logoY + logoSize - r)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY + logoSize,
          logoX + logoSize - r,
          logoY + logoSize
        )
        ctx.lineTo(logoX + r, logoY + logoSize)
        ctx.quadraticCurveTo(
          logoX,
          logoY + logoSize,
          logoX,
          logoY + logoSize - r
        )
        ctx.lineTo(logoX, logoY + r)
        ctx.quadraticCurveTo(logoX, logoY, logoX + r, logoY)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        // 白色描边
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(logoX + r, logoY)
        ctx.lineTo(logoX + logoSize - r, logoY)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY,
          logoX + logoSize,
          logoY + r
        )
        ctx.lineTo(logoX + logoSize, logoY + logoSize - r)
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY + logoSize,
          logoX + logoSize - r,
          logoY + logoSize
        )
        ctx.lineTo(logoX + r, logoY + logoSize)
        ctx.quadraticCurveTo(
          logoX,
          logoY + logoSize,
          logoX,
          logoY + logoSize - r
        )
        ctx.lineTo(logoX, logoY + r)
        ctx.quadraticCurveTo(logoX, logoY, logoX + r, logoY)
        ctx.closePath()
        ctx.stroke()
      } catch (_error) {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('NTX', canvas.width / 2, 150)
      }

      // 主副标题（与组件版本保持一致：两行主标题 + 一行副标题）
      ctx.fillStyle = '#111827'
      ctx.textAlign = 'center'
      ctx.font = 'bold 28px Arial'
      ctx.fillText('注册 NTX DAO，连接用户聚合资源，', canvas.width / 2, 250)
      ctx.fillText('挖掘你的 Web3 机会', canvas.width / 2, 284)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial'
      ctx.fillText('享受高达60%手续费返佣和挖矿交易', canvas.width / 2, 320)

      // 中部图案：Frame48@3x.png（不降级）
      try {
        const bannerImg = new window.Image()
        bannerImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          bannerImg.onload = resolve
          bannerImg.onerror = reject
          bannerImg.src = '/Frame48@3x.png'
        })

        const bannerW = 200
        const bannerH = 120
        const bannerX = (canvas.width - bannerW) / 2
        const bannerY = 320
        const scale = Math.min(
          bannerW / bannerImg.width,
          bannerH / bannerImg.height
        )
        const drawW = bannerImg.width * scale
        const drawH = bannerImg.height * scale
        const drawX = bannerX + (bannerW - drawW) / 2
        const drawY = bannerY + (bannerH - drawH) / 2
        ctx.drawImage(bannerImg, drawX, drawY, drawW, drawH)
      } catch (_e) {}

      // 设计稿无中部品牌口号，此处不额外绘制文字
      // 旧降级代码移除，保持与参考稿一致

      // 底部蓝色信息卡片（圆角）
      const cardX = 30
      const cardY = 560
      const cardW = canvas.width - 60
      const cardH = 190
      const cardR = 16
      ctx.fillStyle = '#2563eb'
      ctx.beginPath()
      ctx.moveTo(cardX + cardR, cardY)
      ctx.lineTo(cardX + cardW - cardR, cardY)
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR)
      ctx.lineTo(cardX + cardW, cardY + cardH - cardR)
      ctx.quadraticCurveTo(
        cardX + cardW,
        cardY + cardH,
        cardX + cardW - cardR,
        cardY + cardH
      )
      ctx.lineTo(cardX + cardR, cardY + cardH)
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR)
      ctx.lineTo(cardX, cardY + cardR)
      ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.font = '14px Arial'
      ctx.fillText('扫描二维码, 注册 NTX DAO', cardX + 24, cardY + 36)
      ctx.font = 'bold 30px Arial'
      ctx.fillText(
        `邀请码： ${String(userInfo.myInviteCode).toUpperCase()}`,
        cardX + 24,
        cardY + 80
      )

      // 二维码（SSR 兜底：NEXT_PUBLIC_BASE_URL）
      const baseUrl =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_URL || ''
      const inviteUrl = `${baseUrl}/register?invite=${userInfo.myInviteCode}`
      const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1e40af', light: '#ffffff' }
      })

      const qrImg = new window.Image()
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve
        qrImg.onerror = reject
        qrImg.src = qrDataUrl
      })

      const qrSize = 120
      const qrPadding = 6
      const qrX = cardX + cardW - 24 - (qrSize + qrPadding * 2)
      const qrY = cardY + (cardH - (qrSize + qrPadding * 2)) / 2
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX, qrY, qrSize + qrPadding * 2, qrSize + qrPadding * 2)
      ctx.drawImage(qrImg, qrX + qrPadding, qrY + qrPadding, qrSize, qrSize)

      // 卡片外不再绘制重复文案/品牌

      return canvas.toDataURL('image/png', 0.9)
    } catch (error) {
      console.error('生成邀请分享图片失败:', error)
      throw error
    }
  }, [userInfo])

  const ImageGeneratorComponent = () => {
    if (!userInfo) return null

    return (
      <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    )
  }

  return { generateImage, ImageGeneratorComponent }
}
