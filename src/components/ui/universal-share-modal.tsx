'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Download, Share2, Copy } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast'
import Image from 'next/image'
import QRCode from 'qrcode'

export interface ShareData {
  title: string
  text: string
  url: string
  qrCodeUrl?: string
}

export interface ShareAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

interface UniversalShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  shareData: ShareData
  // 图片生成相关
  imageGenerator?: () => Promise<string | null>
  showImagePreview?: boolean
  // 自定义操作
  customActions?: ShareAction[]
  // 是否显示默认分享按钮
  showDefaultShareButtons?: boolean
  // 是否显示内置复制链接按钮
  showCopyLinkButton?: boolean
}

export function UniversalShareModal({
  isOpen,
  onClose,
  title,
  shareData,
  imageGenerator,
  showImagePreview = false,
  customActions = [],
  showDefaultShareButtons = true,
  showCopyLinkButton = true
}: UniversalShareModalProps) {
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [_qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (!shareData.url) return

    try {
      const qrDataUrl = await QRCode.toDataURL(shareData.url, {
        width: 120,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('生成二维码失败:', error)
    }
  }, [shareData.url])

  // 生成图片
  const _generateImage = useCallback(async () => {
    if (!imageGenerator) return

    try {
      setIsGenerating(true)
      const imageDataUrl = await imageGenerator()
      if (imageDataUrl) {
        setGeneratedImage(imageDataUrl)
      }
    } catch (error) {
      console.error('生成图片失败:', error)
      toast({
        title: '生成失败',
        description: '无法生成分享图片，请重试',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [imageGenerator])

  // 下载图片
  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `${shareData.title}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: '下载成功',
      description: '图片已保存到本地'
    })
  }

  // 复制图片到剪贴板
  const copyImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      toast({
        title: '复制成功',
        description: '图片已复制到剪贴板'
      })
    } catch (error) {
      console.error('复制失败:', error)
      toast({
        title: '复制失败',
        description: '无法复制图片到剪贴板',
        variant: 'destructive'
      })
    }
  }

  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url)

    toast({
      title: '复制成功',
      description: '链接已复制到剪贴板'
    })
  }

  // 默认分享函数
  const shareToTelegram = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareData.url
    )}&text=${encodeURIComponent(shareText)}`

    window.open(shareUrl, '_blank')
  }

  const shareToTwitter = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
      shareData.url
    )}`

    window.open(shareUrl, '_blank')
  }

  const shareToWhatsApp = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

    window.open(shareUrl, '_blank')
  }

  const shareNative = async () => {
    const shareDataPayload = {
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    }

    try {
      if (navigator.share) {
        await navigator.share(shareDataPayload)
      } else {
        copyLink()
      }
    } catch (error) {
      console.error('分享失败:', error)
      copyLink()
    }
  }

  // 当模态框打开时初始化
  useEffect(() => {
    if (isOpen) {
      setGeneratedImage('')
      setQrCodeDataUrl('')

      const initialize = async () => {
        await generateQRCode()
        if (showImagePreview) {
          setTimeout(() => {
            _generateImage()
          }, 300)
        }
      }

      initialize()
    }
  }, [isOpen, generateQRCode, showImagePreview, _generateImage])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 图片预览区域 */}
          {showImagePreview && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm text-gray-500">正在生成分享图片...</p>
                </div>
              ) : generatedImage ? (
                <div className="relative">
                  <div className="max-w-full overflow-hidden rounded-lg">
                    <Image
                      src={generatedImage}
                      alt="分享预览"
                      width={300}
                      height={400}
                      className="rounded-lg shadow-lg mx-auto w-auto h-auto max-w-full max-h-[500px] object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">分享图片预览</p>
                </div>
              ) : (
                <div className="py-8 text-gray-500">
                  <p className="text-sm">图片生成中...</p>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮区域 */}
          <div className="space-y-3">
            {/* 图片相关操作 */}
            {showImagePreview && generatedImage && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={downloadImage}
                  className="flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  保存图片
                </Button>
                <Button
                  variant="outline"
                  onClick={copyImage}
                  className="flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制图片
                </Button>
              </div>
            )}

            {/* 链接操作 */}
            {showCopyLinkButton && (
              <Button variant="outline" onClick={copyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </Button>
            )}

            {/* 自定义操作 */}
            {customActions.length > 0 && (
              <div className="space-y-2">
                {customActions.map((action, index) => {
                  const IconComponent = action.icon
                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      onClick={action.onClick}
                      className={action.className || 'w-full'}
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 mr-2" />
                      )}
                      {action.label}
                    </Button>
                  )
                })}
              </div>
            )}

            {/* 默认分享平台 */}
            {showDefaultShareButtons && (
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
