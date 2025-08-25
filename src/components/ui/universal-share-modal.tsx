'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent
} from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Download, Share2, Copy } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast'
import NextImage from 'next/image'
import QRCode from 'qrcode'
import jsqr from 'jsqr'

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
  // 当识别到上传二维码的内容时回调，用于覆盖二维码文本
  onQrOverride?: (text: string) => void
  // 是否展示“自定义上传二维码”功能（默认不展示）
  showCustomQrUpload?: boolean
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
  showCopyLinkButton = true,
  onQrOverride,
  showCustomQrUpload = true
}: UniversalShareModalProps) {
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [_qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 选择并上传二维码图片
  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = URL.createObjectURL(file)
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('图片加载失败'))
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法获取 canvas 2d 上下文')
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const result = jsqr(imageData.data, imageData.width, imageData.height)

      if (result?.data) {
        onQrOverride?.(result.data)
        toast({
          title: '二维码识别成功',
          description: '将使用自定义二维码内容'
        })
        // 如果有预览，则重新生成
        if (showImagePreview && imageGenerator) {
          _generateImage()
        }
      } else {
        toast({
          title: '识别失败',
          description: '未能识别到二维码内容，请尝试更清晰的图片',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('二维码识别异常:', error)
      toast({
        title: '识别失败',
        description: '处理二维码图片时发生错误',
        variant: 'destructive'
      })
    } finally {
      // 重置 input 以便可重复选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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

  // 检测是否为iOS设备
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }
    setIsIOS(checkIsIOS())
  }, [])

  // 下载图片
  const downloadImage = () => {
    if (!generatedImage) return

    // iOS 设备特殊处理
    if (isIOS) {
      // 创建一个新窗口打开图片，用户可以长按保存
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>保存海报</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background-color: #f5f5f5;
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }
                img {
                  max-width: 100%;
                  max-height: 80vh;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  border-radius: 8px;
                }
                .instructions {
                  margin-top: 20px;
                  text-align: center;
                  padding: 10px;
                  background-color: #fff;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                  width: 90%;
                  max-width: 400px;
                }
              </style>
            </head>
            <body>
              <img src="${generatedImage}" alt="邀请海报">
              <div class="instructions">
                <p><strong>请长按图片，选择"添加到照片"保存到相册</strong></p>
              </div>
            </body>
          </html>
        `)
        newWindow.document.close()
      }

      toast({
        title: '请长按图片保存',
        description: 'iOS设备请长按图片，然后选择"添加到照片"'
      })
    } else {
      // 非iOS设备使用常规下载方式
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
                    <NextImage
                      src={generatedImage}
                      alt="分享预览"
                      width={300}
                      height={400}
                      className="rounded-lg shadow-lg mx-auto w-auto h-auto max-w-full max-h-[500px] object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">分享图片预览</p>
                </div>
              ) : (
                <div className="py-8 text-gray-500 flex flex-col items-center gap-3">
                  <p className="text-sm">暂无预览</p>
                  <Button variant="outline" onClick={_generateImage}>
                    重新生成
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 自定义二维码：上传并识别（可配置显示） */}
          {showCustomQrUpload && (
            <div className="bg-gray-50 rounded-lg p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={triggerUpload}
                  className="w-full"
                >
                  上传自定义二维码
                </Button>
                {onQrOverride && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      onQrOverride('')
                      toast({ title: '已还原默认二维码' })
                      if (showImagePreview && imageGenerator) {
                        _generateImage()
                      }
                    }}
                  >
                    还原默认
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                提示：可上传包含二维码的图片，系统会自动解析并替换分享图中的二维码指向。
              </p>
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
