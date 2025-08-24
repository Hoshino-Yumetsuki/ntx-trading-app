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

      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#3b82f6') // 蓝色
      gradient.addColorStop(1, '#1e40af') // 深蓝色
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 加载并绘制logo
      try {
        const logoImg = new window.Image()
        logoImg.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          logoImg.src = '/ntx_1_1.jpg'
        })

        // 绘制logo (居中，圆形)
        const logoSize = 120
        const logoX = (canvas.width - logoSize) / 2
        const logoY = 80

        ctx.save()
        ctx.beginPath()
        ctx.arc(
          logoX + logoSize / 2,
          logoY + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        )
        ctx.clip()
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        // 绘制边框
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(
          logoX + logoSize / 2,
          logoY + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      } catch (error) {
        console.error('加载logo失败:', error)
        // 如果logo加载失败，绘制默认的NTX文字
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('NTX', canvas.width / 2, 150)
      }

      // 主标题
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('注册 NTX DAO', canvas.width / 2, 260)

      // 副标题
      ctx.font = 'bold 24px Arial'
      ctx.fillText('Web3 金融聚合返佣工具', canvas.width / 2, 300)
      ctx.fillText('快来参与交易挖矿！', canvas.width / 2, 330)

      // 描述文字
      ctx.font = '18px Arial'
      ctx.fillText('享受高达50%手续费返佣和交易挖矿', canvas.width / 2, 380)

      // 邀请码背景
      const codeBoxY = 430
      const codeBoxHeight = 80
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(50, codeBoxY, canvas.width - 100, codeBoxHeight)

      // 邀请码文字
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('邀请码', canvas.width / 2, codeBoxY + 25)
      ctx.font = 'bold 28px Arial'
      ctx.fillText(userInfo.myInviteCode, canvas.width / 2, codeBoxY + 55)

      // 生成二维码
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const inviteUrl = `${origin}/register?invite=${userInfo.myInviteCode}`
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

      const qrSize = 160
      const qrX = (canvas.width - qrSize) / 2
      const qrY = 540

      // 二维码背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)

      // 绘制二维码
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      // 二维码下方文字
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px Arial'
      ctx.fillText(
        '扫描二维码，注册 NTX DAO',
        canvas.width / 2,
        qrY + qrSize + 30
      )

      // 底部品牌
      ctx.font = 'bold 20px Arial'
      ctx.fillText('NEXTRADE DAO', canvas.width / 2, qrY + qrSize + 70)
      ctx.font = '14px Arial'
      ctx.fillText(
        '专业投资互动社区 为Web3交易而生',
        canvas.width / 2,
        qrY + qrSize + 95
      )

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

      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(1, '#1e40af')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 加载并绘制logo
      try {
        const logoImg = new window.Image()
        logoImg.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          logoImg.src = '/ntx_1_1.jpg'
        })

        const logoSize = 120
        const logoX = (canvas.width - logoSize) / 2
        const logoY = 80

        ctx.save()
        ctx.beginPath()
        ctx.arc(
          logoX + logoSize / 2,
          logoY + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        )
        ctx.clip()
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(
          logoX + logoSize / 2,
          logoY + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      } catch (_error) {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('NTX', canvas.width / 2, 150)
      }

      // 文字内容
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('注册 NTX DAO', canvas.width / 2, 260)

      ctx.font = 'bold 24px Arial'
      ctx.fillText('Web3 金融聚合返佣工具', canvas.width / 2, 300)
      ctx.fillText('快来参与交易挖矿！', canvas.width / 2, 330)

      ctx.font = '18px Arial'
      ctx.fillText('享受高达50%手续费返佣和交易挖矿', canvas.width / 2, 380)

      // 邀请码
      const codeBoxY = 430
      const codeBoxHeight = 80
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(50, codeBoxY, canvas.width - 100, codeBoxHeight)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('邀请码', canvas.width / 2, codeBoxY + 25)
      ctx.font = 'bold 28px Arial'
      ctx.fillText(userInfo.myInviteCode, canvas.width / 2, codeBoxY + 55)

      // 二维码
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : ''
      const inviteUrl = `${origin}/register?invite=${userInfo.myInviteCode}`
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

      const qrSize = 160
      const qrX = (canvas.width - qrSize) / 2
      const qrY = 540

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      ctx.fillStyle = '#ffffff'
      ctx.font = '16px Arial'
      ctx.fillText(
        '扫描二维码，注册 NTX DAO',
        canvas.width / 2,
        qrY + qrSize + 30
      )

      ctx.font = 'bold 20px Arial'
      ctx.fillText('NEXTRADE DAO', canvas.width / 2, qrY + qrSize + 70)
      ctx.font = '14px Arial'
      ctx.fillText(
        '专业投资互动社区 为Web3交易而生',
        canvas.width / 2,
        qrY + qrSize + 95
      )

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
