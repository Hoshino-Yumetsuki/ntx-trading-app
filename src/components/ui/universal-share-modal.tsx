'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type FC,
  type ComponentType,
  cloneElement,
  isValidElement
} from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Download, Share2, Copy, Loader2 } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast'
import NextImage from 'next/image'
import jsqr from 'jsqr'

// --- 接口定义 (保持不变) ---
export interface ShareData {
  title: string
  text: string
  url: string
  qrCodeUrl?: string
}

export interface ShareAction {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

interface UniversalShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  shareData: ShareData
  imageGenerator?: (node: HTMLDivElement | null) => Promise<string | null>
  posterComponent?: React.ReactElement
  showImagePreview?: boolean
  customActions?: ShareAction[]
  showDefaultShareButtons?: boolean
  showCopyLinkButton?: boolean
  onQrOverride?: (text: string) => void
  showCustomQrUpload?: boolean
}

// --- 自定义 Hooks (保持不变) ---
const useImageActions = (generatedImage: string, title: string) => {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))
  }, [])

  const downloadImage = useCallback(() => {
    if (!generatedImage) {
        toast({ title: '图片尚未生成', description: '请稍后再试', variant: 'destructive'})
        return;
    };

    if (isIOS) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(
          `<html><head><title>保存海报</title><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}img{max-width:100%;max-height:80vh;border-radius:8px;}p{margin-top:20px;font-family:-apple-system,sans-serif}</style></head><body><img src="${generatedImage}" alt="分享海报"><p><strong>请长按图片保存到相册</strong></p></body></html>`
        )
        newWindow.document.close()
      }
      toast({
        title: '请长按图片保存',
        description: 'iOS设备请长按图片，然后选择"添加到照片"'
      })
    } else {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `${title}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: '下载成功', description: '图片已保存到本地' })
    }
  }, [generatedImage, title, isIOS])

  return { downloadImage }
}

const useQrCodeScanner = (onQrScanSuccess: (text: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerUpload = () => fileInputRef.current?.click()

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await img.decode()

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('无法获取 canvas 上下文')

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsqr(imageData.data, imageData.width, imageData.height)

        if (result?.data) {
          onQrScanSuccess(result.data)
          toast({
            title: '二维码识别成功',
            description: '将使用自定义二维码内容'
          })
        } else {
          toast({
            title: '识别失败',
            description: '未能识别到二维码',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('二维码识别异常:', error)
        toast({
          title: '识别失败',
          description: '处理图片时发生错误',
          variant: 'destructive'
        })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [onQrScanSuccess]
  )

  return { fileInputRef, triggerUpload, handleFileChange }
}


// ######################################################################
// ### 3. 主组件实现 (Main Component Implementation) ###
// ######################################################################

export function UniversalShareModal({
  isOpen,
  onClose,
  title,
  shareData,
  imageGenerator,
  posterComponent,
  showImagePreview = true,
  customActions = [],
  showDefaultShareButtons = true,
  showCopyLinkButton = true,
  onQrOverride,
  showCustomQrUpload = true
}: UniversalShareModalProps) {
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  
  // 用于动态调整预览容器高度的状态
  const [previewContainerHeight, setPreviewContainerHeight] = useState(400); 

  const { downloadImage } = useImageActions(generatedImage, shareData.title)

  // 使用 ResizeObserver 监测海报实际高度变化
  useEffect(() => {
    if (isOpen && posterRef.current) {
      const posterElement = posterRef.current;
      
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          // scrollHeight 是元素内容的完整高度
          const fullHeight = entry.target.scrollHeight;
          // 容器的高度应该是海报实际高度缩放后的大小
          setPreviewContainerHeight(fullHeight * 0.5);
        }
      });
      
      observer.observe(posterElement);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isOpen, posterComponent]); // 当模态框打开或海报组件变化时，重新监测


  const handleGenerateAndSave = useCallback(async () => {
    if (generatedImage) {
      downloadImage()
      return
    }

    if (!imageGenerator) return
    setIsGenerating(true)
    try {
      const imageDataUrl = await imageGenerator(posterRef.current)
      if (imageDataUrl) {
        setGeneratedImage(imageDataUrl)
        const link = document.createElement('a')
        link.href = imageDataUrl
        link.download = `${shareData.title}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast({ title: '下载成功', description: '图片已保存到本地' })
      } else {
        toast({
          title: '生成失败',
          description: '无法生成分享图片',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast({
        title: '生成失败',
        description: '无法生成分享图片',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [imageGenerator, generatedImage, downloadImage, shareData.title])

  useEffect(() => {
    if (isOpen) {
      setGeneratedImage('')
    }
  }, [isOpen])
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url)
    toast({ title: '复制成功', description: '链接已复制到剪贴板' })
  }
  
  const onQrScanSuccess = useCallback(
    (qrText: string) => {
      onQrOverride?.(qrText)
    },
    [onQrOverride]
  )
  
  const restoreDefaultQr = () => {
    onQrOverride?.('')
    toast({ title: '已还原默认二维码' })
  }
  
  const { fileInputRef, triggerUpload, handleFileChange } =
    useQrCodeScanner(onQrScanSuccess)

  const posterWithRef =
    posterComponent && isValidElement(posterComponent)
      ? cloneElement(posterComponent as React.ReactElement<{ ref: React.Ref<HTMLDivElement> }>, { ref: posterRef })
      : null

  const shareToTelegram = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareText)}`
    window.open(shareUrl, '_blank')
  }

  const shareToTwitter = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareData.url)}`
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {posterWithRef && showImagePreview && (
            <div className="relative p-4 bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
              <div style={{ 
                  width: '300px', 
                  height: `${previewContainerHeight}px`, // 使用动态高度
                  position: 'relative',
                  transition: 'height 0.2s ease-in-out' // 增加平滑过渡效果
              }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left'
                }}>
                    {posterWithRef}
                </div>
              </div>
              
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-sm text-slate-600">正在生成高清图...</p>
                </div>
              )}
            </div>
          )}

          {showCustomQrUpload && onQrOverride && (
             <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={triggerUpload}
                    className="w-full"
                  >
                    上传自定义二维码
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={restoreDefaultQr}
                  >
                    还原默认
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  提示：可上传包含二维码的图片，系统会自动解析并替换分享图中的二维码指向。
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {showImagePreview && (
              <Button
                onClick={handleGenerateAndSave}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? '正在处理...' : '保存分享海报'}
              </Button>
            )}

            {showCopyLinkButton && (
              <Button variant="outline" onClick={copyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </Button>
            )}

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

            {showDefaultShareButtons && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">分享到</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareToTelegram}
                    className="flex items-center justify-center"
                  >
                    <NextImage
                      src="/telegram.png"
                      alt="Telegram"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareToTwitter}
                    className="flex items-center justify-center"
                  >
                    <NextImage
                      src="/twitter.png"
                      alt="X"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    X
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