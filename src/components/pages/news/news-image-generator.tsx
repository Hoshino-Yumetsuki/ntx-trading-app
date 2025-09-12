'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { ShareCard } from '@/src/components/ui/share-card'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'
// 1. 导入我们之前创建的统一 NewsItem 类型
import type { NewsItem } from '@/src/types/news'



// Hook to use the news image generator
export function useNewsImageGenerator(
  newsItem: NewsItem | null,
  shareUrl?: string
) {
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [fullContent, setFullContent] = useState<string>('')
  const [_isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
  const [overrideQrText, setOverrideQrText] = useState<string>('')

  // 获取完整文章内容 (此函数逻辑保持不变)
  const fetchFullContent = useCallback(async () => {
    if (!newsItem || newsItem.source === 'rss') {
      const content = newsItem?.content || ''
      setFullContent(content)
      return content
    }
    setIsLoadingContent(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/academy/articles/${newsItem.id}`
      )
      if (response.ok) {
        const articleData = await response.json()
        const content = articleData.content || newsItem.content || ''
        setFullContent(content)
        return content
      }
      const content = newsItem.content || ''
      setFullContent(content)
      return content
    } catch (_error) {
      const content = newsItem.content || ''
      setFullContent(content)
      return content
    } finally {
      setIsLoadingContent(false)
    }
  }, [newsItem])

  // 生成二维码 (核心修改点)
  const generateQRCode = useCallback(async () => {
    // 3. 确保 shareUrl 存在才继续
    if (!shareUrl) {
        setQrCodeDataUrl('')
        return ''
    }

    try {
      // 4. 优先使用 overrideQrText，否则直接使用从外部传入的 shareUrl
      const textToEncode = overrideQrText || shareUrl

      const qrDataUrl = await QRCode.toDataURL(textToEncode, {
        width: 120,
        margin: 2,
        color: { dark: '#1e40af', light: '#ffffff' }
      })
      setQrCodeDataUrl(qrDataUrl)
      return qrDataUrl
    } catch (error) {
      console.error('生成二维码失败:', error)
      return ''
    }
  }, [overrideQrText, shareUrl]) // 5. 移除对 newsItem 的依赖

  const generateImage = useCallback(async (): Promise<string | null> => {
    // ... (此函数逻辑保持不变) ...
    if (!shareCardRef.current || !newsItem) {
      console.error('生成图片的前置条件不足')
      return null
    }

    try {
      await Promise.all([fetchFullContent(), generateQRCode()])
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const node = shareCardRef.current
      if (!node) return null
      const imageUrls = Array.from(node.querySelectorAll('img')).map(
        (img) => img.src
      )
      await preloadImages(imageUrls)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => setTimeout(resolve, 50));
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
      console.error('生成新闻分享图片失败:', error)
      throw error
    }
  }, [newsItem, fetchFullContent, generateQRCode])

  useEffect(() => {
    if (newsItem) {
      fetchFullContent()
      generateQRCode()
    }
  }, [newsItem, fetchFullContent, generateQRCode])

  const ImageGeneratorComponent = () => {
    if (!newsItem) return null
    return (
      <div className="fixed top-0 left-0 opacity-0 pointer-events-none -z-10">
        <ShareCard
          ref={shareCardRef}
          title={newsItem.title}
          content={fullContent || newsItem.content || ''}
          summary={newsItem.summary}
          publishDate={newsItem.publishDate}
          qrCodeDataUrl={qrCodeDataUrl}
          source={newsItem.source}
        />
      </div>
    )
  }

  return { generateImage, ImageGeneratorComponent, setOverrideQrText }
}