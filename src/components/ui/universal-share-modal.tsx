'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
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
import { toast } from 'sonner'
import NextImage from 'next/image'
import jsqr from 'jsqr'

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

const useQrCodeScanner = (onQrScanSuccess: (text: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerUpload = () => fileInputRef.current?.click()

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const img = new window.Image()
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
          toast.success('二维码识别成功', {
            description: '将使用自定义二维码内容'
          })
        } else {
          toast.error('识别失败', {
            description: '未能识别到二维码'
          })
        }
      } catch (error) {
        console.error('二维码识别异常:', error)
        toast.error('识别失败', {
          description: '处理图片时发生错误'
        })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [onQrScanSuccess]
  )

  return { fileInputRef, triggerUpload, handleFileChange }
}

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
  const [previewContainerHeight, setPreviewContainerHeight] = useState(400)

  const [isIOS, setIsIOS] = useState(false)
  useEffect(() => {
    const platform = navigator.platform
    const userAgent = navigator.userAgent

    let isIOSDevice =
      /iPad|iPhone|iPod/.test(platform) ||
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (!isIOSDevice) {
      isIOSDevice = /iPhone|iPad|iPod/.test(userAgent)
    }

    setIsIOS(isIOSDevice)
  }, [])

  const downloadImage = useCallback(
    (imageToDownload: string, sharePayload: ShareData) => {
      if (!imageToDownload) {
        toast.error('图片尚未生成', {
          description: '请稍后再试'
        })
        return
      }

      if (isIOS) {
        // --- MODIFICATION START: New Enhanced iOS Share Page ---
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>分享海报</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
                <style>
                  body { margin: 0; background-color: #F0F8FF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 100vh; padding: 20px; box-sizing: border-box; }
                  .poster-container { width: 100%; text-align: center; }
                  .poster { max-width: 100%; height: auto; max-height: 70vh; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
                  .actions-container { width: 100%; max-width: 380px; padding: 15px 0; }
                  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
                  button { display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #ffffff; color: #007aff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; -webkit-appearance: none; transition: background-color 0.2s, transform 0.1s; }
                  button:active { transform: scale(0.97); background-color: #f0f0f0; }
                  button.primary { background-color: #007aff; color: white; border: none; }
                  .tip { color: #8a8a8e; font-size: 15px; text-align: center; margin-top: 25px; }
                </style>
              </head>
              <body>
                <div class="poster-container">
                  <img src="${imageToDownload}" alt="分享海报" class="poster">
                </div>

                <div class="actions-container">
                  <p class="tip">如果要保存到相册，请长按图片，选择“保存图片”</p>
                    <div class="actions">
                        <a id="downloadLink" href="${imageToDownload}" download="${sharePayload.title}.png" style="text-decoration: none;">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <span>下载图片</span>
                            </button>
                        </a>
                        <button class="primary" onclick="shareImage()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>分享海报</span>
                        </button>
                    </div>
                </div>

                <script>
                  async function shareImage() {
                    const dataUrl = "${imageToDownload}";
                    const title = \`${sharePayload.title.replace(/`/g, '\\`')}\`;
                    const text = \`${sharePayload.text.replace(/`/g, '\\`')}\`;
                    
                    try {
                      const response = await fetch(dataUrl);
                      const blob = await response.blob();
                      const file = new File([blob], title + '.png', { type: blob.type });

                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: title,
                          text: text,
                        });
                      } else {
                        alert('您的浏览器不支持分享文件，请长按图片保存。');
                      }
                    } catch (err) {
                      console.error('分享失败:', err);
                      alert('分享失败，您可以尝试长按图片进行保存。');
                    }
                  }
                </script>
              </body>
            </html>
          `)
          newWindow.document.close()
        }
        // --- MODIFICATION END ---
      } else {
        // Non-iOS devices standard download logic
        const link = document.createElement('a')
        link.href = imageToDownload
        link.download = `${sharePayload.title}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('下载成功', {
          description: '图片已保存到您的设备'
        })
      }
    },
    [isIOS]
  )

  useEffect(() => {
    if (isOpen && posterRef.current) {
      const posterElement = posterRef.current
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          const fullHeight = entry.target.scrollHeight
          setPreviewContainerHeight(fullHeight * 0.5)
        }
      })
      observer.observe(posterElement)
      return () => {
        observer.disconnect()
      }
    }
  }, [isOpen])

  const handleGenerateAndSave = useCallback(async () => {
    if (generatedImage) {
      downloadImage(generatedImage, shareData)
      return
    }

    if (!imageGenerator) return
    setIsGenerating(true)
    try {
      const imageDataUrl = await imageGenerator(posterRef.current)
      if (imageDataUrl) {
        setGeneratedImage(imageDataUrl)
        downloadImage(imageDataUrl, shareData)
      } else {
        toast.error('生成失败', {
          description: '无法生成分享图片'
        })
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error('生成失败', {
        description: '无法生成分享图片'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [imageGenerator, generatedImage, downloadImage, shareData])

  useEffect(() => {
    if (isOpen) {
      setGeneratedImage('')
    }
  }, [isOpen])

  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url)
    toast.success('复制成功', {
      description: '链接已复制到剪贴板'
    })
  }

  const onQrScanSuccess = useCallback(
    (qrText: string) => {
      onQrOverride?.(qrText)
    },
    [onQrOverride]
  )

  const restoreDefaultQr = () => {
    onQrOverride?.('')
    toast.success('已还原默认二维码')
  }

  const { fileInputRef, triggerUpload, handleFileChange } =
    useQrCodeScanner(onQrScanSuccess)

  const posterWithRef =
    posterComponent && isValidElement(posterComponent)
      ? cloneElement(
          posterComponent as React.ReactElement<{
            ref: React.Ref<HTMLDivElement>
          }>,
          { ref: posterRef }
        )
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
              <div
                style={{
                  width: '300px',
                  height: `${previewContainerHeight}px`,
                  position: 'relative',
                  transition: 'height 0.2s ease-in-out'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left'
                  }}
                >
                  {posterWithRef}
                </div>
              </div>

              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-sm text-slate-600">
                    正在生成高清图...
                  </p>
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
                {isGenerating ? '正在处理...' : '保存/分享海报'}
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
