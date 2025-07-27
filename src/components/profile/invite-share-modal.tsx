'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Download, Share2, Copy } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import Image from 'next/image'

interface InviteShareModalProps {
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo | null
}

export function InviteShareModal({
  isOpen,
  onClose,
  userInfo
}: InviteShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 生成邀请链接
  const inviteUrl = `https://ntx-dao.com/register?invite=${userInfo?.myInviteCode || ''}`

  // 分享文本
  const shareText = `注册 NTX DAO, Web3 金融聚合返佣工具，快来参与交易挖矿！

享受高达50%手续费返佣和交易挖矿

邀请码：${userInfo?.myInviteCode || ''}

${inviteUrl}`

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    try {
      setIsGenerating(true)
      const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af', // 蓝色
          light: '#ffffff'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('生成二维码失败:', error)
      toast.error('生成二维码失败')
    } finally {
      setIsGenerating(false)
    }
  }, [inviteUrl])

  useEffect(() => {
    if (isOpen && userInfo?.myInviteCode) {
      generateQRCode()
    }
  }, [isOpen, userInfo?.myInviteCode, generateQRCode])

  // 生成海报
  const generatePoster = async () => {
    if (!canvasRef.current || !qrCodeDataUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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

    // 绘制二维码
    const qrImg = new window.Image()
    await new Promise((resolve) => {
      qrImg.onload = resolve
      qrImg.src = qrCodeDataUrl
    })

    const qrSize = 180
    const qrX = (canvas.width - qrSize) / 2
    const qrY = 420

    // 二维码背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)

    // 绘制二维码
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // 扫描提示
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText(
      '扫描二维码，注册 NTX DAO',
      canvas.width / 2,
      qrY + qrSize + 40
    )

    // 邀请码
    ctx.font = 'bold 24px Arial'
    ctx.fillText(
      `邀请码：${userInfo?.myInviteCode || ''}`,
      canvas.width / 2,
      qrY + qrSize + 80
    )

    // 底部logo文字
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText('NEXTRADE DAO', canvas.width / 2, canvas.height - 60)
    ctx.font = '14px Arial'
    ctx.fillText(
      '专业投资互动社区 为Web3交易而生',
      canvas.width / 2,
      canvas.height - 30
    )
  }

  // 下载海报
  const downloadPoster = async () => {
    try {
      await generatePoster()
      if (!canvasRef.current) return

      const link = document.createElement('a')
      link.download = `NTX_DAO_邀请海报_${userInfo?.myInviteCode}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
      toast.success('海报已下载')
    } catch (error) {
      console.error('下载海报失败:', error)
      toast.error('下载海报失败')
    }
  }

  // 复制邀请码
  const copyInviteCode = () => {
    if (userInfo?.myInviteCode) {
      navigator.clipboard.writeText(userInfo.myInviteCode)
      toast.success('邀请码已复制')
    }
  }

  // 复制邀请链接
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    toast.success('邀请链接已复制')
  }

  // 分享到不同平台
  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(telegramUrl, '_blank')
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank')
  }

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
  }

  // 通用分享API（如果支持）
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NTX DAO 邀请',
          text: shareText,
          url: inviteUrl
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 降级到复制链接
      copyInviteLink()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-slate-800">
            分享海报
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 海报预览区域 */}
          <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg p-6 text-white text-center relative">
            {/* Logo区域 */}
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/ntx_1_1.jpg"
                  alt="NTX Logo"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    // 如果图片加载失败，显示文字
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML =
                        '<div class="text-blue-600 font-bold text-lg">NTX</div>'
                    }
                  }}
                />
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-xl font-bold mb-2">
              注册 NTX DAO, Web3 金融聚合返佣工具，快来参与交易挖矿！
            </h2>
            <p className="text-sm mb-4">享受高达50%手续费返佣和交易挖矿</p>

            {/* 二维码 */}
            <div className="bg-white p-3 rounded-lg inline-block mb-4">
              {isGenerating ? (
                <div className="w-32 h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="邀请二维码"
                  width={128}
                  height={128}
                  className="w-32 h-32"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-gray-500">
                  二维码生成中...
                </div>
              )}
            </div>

            <p className="text-sm mb-2">扫描二维码，注册 NTX DAO</p>
            <p className="font-bold text-lg">
              邀请码：{userInfo?.myInviteCode || ''}
            </p>

            {/* 底部品牌 */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-lg font-bold">NEXTRADE DAO</div>
                <div className="text-xs">专业投资互动社区 为Web3交易而生</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 复制操作 */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={copyInviteCode}
                className="flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制邀请码
              </Button>
              <Button
                variant="outline"
                onClick={copyInviteLink}
                className="flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </Button>
            </div>

            {/* 下载海报 */}
            <Button
              onClick={downloadPoster}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              保存海报
            </Button>

            {/* 分享到平台 */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">分享到</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={shareToTelegram}
                  className="flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  onClick={shareToTwitter}
                  className="flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />X
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={shareNative}
                  className="flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  更多
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 隐藏的canvas用于生成海报 */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  )
}
