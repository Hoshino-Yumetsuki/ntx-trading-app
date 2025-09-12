'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { ShareCard } from '@/src/components/ui/share-card'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'

interface NewsItem {
  id: number
  title: string
  content?: string
  summary: string
  publishDate: string
  source?: string
}

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

  // 获取完整文章内容
  const fetchFullContent = useCallback(async () => {
    // ... (此函数保持不变)
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

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    // ... (此函数保持不变)
    if (!newsItem) return ''
    try {
      const textToEncode =
        overrideQrText ||
        shareUrl ||
        `${window.location.origin}/news/${newsItem.id}`
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
  }, [newsItem, overrideQrText, shareUrl])

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!shareCardRef.current || !newsItem) {
      console.error('生成图片的前置条件不足')
      return null
    }

    try {
      // 步骤 1: 获取动态数据
      await Promise.all([fetchFullContent(), generateQRCode()])

      // 步骤 2: 等待React更新DOM
      await new Promise((resolve) => requestAnimationFrame(resolve))

      const node = shareCardRef.current
      if (!node) return null

      // 步骤 3: 从更新后的DOM中收集所有图片URL
      const imageUrls = Array.from(node.querySelectorAll('img')).map(
        (img) => img.src
      )

      // 步骤 4: 执行预加载
      await preloadImages(imageUrls)

      // 步骤 5: 再次等待帧绘制
      await new Promise((resolve) => requestAnimationFrame(resolve))
      
      // 额外增加一个小的延时，作为iOS Safari的最后保障
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 步骤 6: 执行截图
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
    //  ======= 核心修改点 =======
    //  将 -top-[9999px] 修改为 opacity-0
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