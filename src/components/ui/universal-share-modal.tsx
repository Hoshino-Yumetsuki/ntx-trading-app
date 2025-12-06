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
import { createPortal } from 'react-dom'
import { Button } from '@/src/components/ui/button'
import { Download, Share2, Copy, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import NextImage from 'next/image'
import jsqr from 'jsqr'
import { useLanguage } from '@/src/contexts/language-context'

export interface ShareData {
  title: string
  text: string
  url: string
  qrCodeUrl?: string
  fullText?: string
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
  onShare?: () => void
}

const useQrCodeScanner = (
  onQrScanSuccess: (text: string) => void,
  t: (key: string) => string
) => {
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
        if (!ctx) throw new Error('Unable to get canvas context')

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsqr(imageData.data, imageData.width, imageData.height)

        if (result?.data) {
          onQrScanSuccess(result.data)
          toast.success(t('profile.share.qrScanned'), {
            description: t('profile.share.qrScannedDesc')
          })
        } else {
          toast.error(t('profile.share.scanFailed'), {
            description: t('profile.share.qrNotFound')
          })
        }
      } catch (error) {
        console.error('QR code recognition failed:', error)
        toast.error(t('profile.share.scanFailed'), {
          description: t('profile.share.scanError')
        })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [onQrScanSuccess, t]
  )

  return { fileInputRef, triggerUpload, handleFileChange }
}

const toPlainText = (formattedText: string): string => {
  if (!formattedText) return ''

  let text = formattedText

  try {
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      text = tempDiv.textContent || tempDiv.innerText || ''
    } else {
      text = text.replace(/<[^>]*>?/gm, '')
    }
  } catch (_e) {
    text = text.replace(/<[^>]*>?/gm, '')
  }

  text = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')

  text = text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
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
  showCustomQrUpload = true,
  onShare
}: UniversalShareModalProps) {
  const { t } = useLanguage()
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
        toast.error(t('profile.share.imageNotReady'), {
          description: t('profile.share.pleaseWait')
        })
        return
      }

      if (isIOS) {
        // Get translated strings for iOS popup
        const iosTitle = t('profile.share.iosTitle')
        const iosSaveTip = t('profile.share.iosSaveTip')
        const iosDownload = t('profile.share.iosDownload')
        const iosShare = t('profile.share.iosShare')
        const iosBrowserNotSupport = t('profile.share.iosBrowserNotSupport')
        const iosShareFailed = t('profile.share.iosShareFailed')
        
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${iosTitle}</title>
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
                  <img src="${imageToDownload}" alt="${iosTitle}" class="poster">
                </div>

                <div class="actions-container">
                  <p class="tip">${iosSaveTip}</p>
                    <div class="actions">
                        <a id="downloadLink" href="${imageToDownload}" download="${sharePayload.title}.png" style="text-decoration: none;">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <span>${iosDownload}</span>
                            </button>
                        </a>
                        <button class="primary" onclick="shareImage()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>${iosShare}</span>
                        </button>
                    </div>
                </div>

                <script>
                  async function shareImage() {
                    const dataUrl = "${imageToDownload}";
                    const title = \`${sharePayload.title.replace(/`/g, '\\`')}\`;
                    const text = \`${sharePayload.text.replace(/`/g, '\\`')}\`;
                    const browserNotSupport = "${iosBrowserNotSupport}";
                    const shareFailed = "${iosShareFailed}";

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
                        alert(browserNotSupport);
                      }
                    } catch (err) {
                      console.error('Share failed:', err);
                      alert(shareFailed);
                    }
                  }
                </script>
              </body>
            </html>
          `)
          newWindow.document.close()
        }
      } else {
        const link = document.createElement('a')
        link.href = imageToDownload
        link.download = `${sharePayload.title}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(t('profile.share.downloadSuccess'), {
          description: t('profile.share.imageSaved')
        })
      }
    },
    [isIOS, t]
  )

  // 计算预览高度的函数
  const updatePreviewHeight = useCallback(() => {
    if (posterRef.current) {
      const fullHeight = posterRef.current.scrollHeight
      setPreviewContainerHeight(fullHeight * 0.47)
    }
  }, [])

  // 监听 posterComponent 变化并更新高度
  useEffect(() => {
    // 使用 posterComponent 来触发更新（检查是否存在）
    if (!posterComponent) return
    // 延迟更新以等待 DOM 渲染
    const timeoutId = setTimeout(updatePreviewHeight, 50)
    return () => clearTimeout(timeoutId)
  }, [posterComponent, updatePreviewHeight])

  useEffect(() => {
    if (isOpen && posterRef.current) {
      const posterElement = posterRef.current
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          const fullHeight = entry.target.scrollHeight
          setPreviewContainerHeight(fullHeight * 0.47)
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
        toast.error(t('profile.share.generateFailed'), {
          description: t('profile.share.cannotGenerate')
        })
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error(t('profile.share.generateFailed'), {
        description: t('profile.share.cannotGenerate')
      })
    } finally {
      setIsGenerating(false)
    }
  }, [imageGenerator, generatedImage, downloadImage, shareData, t])

  useEffect(() => {
    if (isOpen) {
      setGeneratedImage('')
    }
  }, [isOpen])

  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url)
    toast.success(t('profile.copy.success'), {
      description: t('profile.share.linkCopied')
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
    toast.success(t('profile.share.qrRestored'))
  }

  const { fileInputRef, triggerUpload, handleFileChange } = useQrCodeScanner(
    onQrScanSuccess,
    t
  )

  const posterWithRef =
    posterComponent && isValidElement(posterComponent)
      ? cloneElement(
          posterComponent as React.ReactElement<{
            ref: React.Ref<HTMLDivElement>
          }>,
          { ref: posterRef }
        )
      : null

  const buildSharePayload = useCallback(() => {
    const rawTitle = (shareData.title || '').trim()
    const rawContent = (shareData.fullText || shareData.text || '').trim()
    const plainTextContent = toPlainText(rawContent)

    return {
      title: rawTitle || document.title || '',
      text: plainTextContent,
      url: shareData.url
    }
  }, [shareData.title, shareData.text, shareData.fullText, shareData.url])

  const shareToTelegram = () => {
    onShare?.()
    const payload = buildSharePayload()
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`
    window.open(shareUrl, '_blank')
  }

  const shareToTwitter = () => {
    onShare?.()
    const payload = buildSharePayload()
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(shareUrl, '_blank')
  }

  const shareToWhatsApp = () => {
    onShare?.()
    const payload = buildSharePayload()
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(shareUrl, '_blank')
  }

  const shareNative = async () => {
    onShare?.()
    const shareDataPayload = buildSharePayload()
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareDataPayload.title,
          text: `${shareDataPayload.title}\n\n${shareDataPayload.text}\n\n${shareDataPayload.url}`
        })
      } else {
        copyLink()
      }
    } catch (error) {
      console.error('Share failed:', error)
      copyLink()
    }
  }

  return (
    <>
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* 弹窗内容 */}
          <div 
            className="relative bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-white rounded-t-2xl px-4 py-3 border-b border-gray-100 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-3 pt-2 pb-3 space-y-3">
              {posterWithRef && showImagePreview && (
                <div className="relative bg-gray-50 rounded-xl overflow-hidden flex justify-center items-center p-2">
                  <div
                    style={{
                      width: '280px',
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
                        transform: 'scale(0.47)',
                        transformOrigin: 'top left'
                      }}
                    >
                      {posterWithRef}
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-xl">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1C55FF]" />
                      <p className="mt-2 text-sm text-slate-600">
                        {t('profile.share.generatingHD')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {showImagePreview && (
                  <Button
                    onClick={handleGenerateAndSave}
                    disabled={isGenerating}
                    className="w-full bg-[#1C55FF] hover:bg-[#1545DD] text-white rounded-xl h-11"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating
                      ? t('profile.share.generating')
                      : t('profile.share.savePoster')}
                  </Button>
                )}

                {showCopyLinkButton && (
                  <Button 
                    variant="outline" 
                    onClick={copyLink} 
                    className="w-full rounded-xl h-11 border-gray-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('profile.share.copyLink')}
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
                          className={action.className || 'w-full rounded-xl h-11'}
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
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">
                      {t('profile.share.shareTo')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={shareToTelegram}
                        className="flex items-center justify-center rounded-xl h-10 border-gray-200"
                      >
                        <NextImage
                          src="/icon-telegram.png"
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
                        className="flex items-center justify-center rounded-xl h-10 border-gray-200"
                      >
                        <NextImage
                          src="/icon-twitter.png"
                          alt="X"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        X
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={shareToWhatsApp}
                        className="flex items-center justify-center rounded-xl h-10 border-gray-200"
                      >
                        <NextImage
                          src="/icon-whatsapp.svg"
                          alt="WhatsApp"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={shareNative}
                        className="flex items-center justify-center rounded-xl h-10 border-gray-200"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('profile.share.more')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {showCustomQrUpload && onQrOverride && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={triggerUpload}
                        className="w-full rounded-xl h-10 border-gray-200"
                      >
                        {t('profile.share.uploadCustomQr')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl h-10"
                        onClick={restoreDefaultQr}
                      >
                        {t('profile.share.restoreDefault')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {t('profile.share.qrUploadTip')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
