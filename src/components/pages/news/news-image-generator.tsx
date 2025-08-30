'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { ShareCard } from '@/src/components/ui/share-card'
import { API_BASE_URL } from '@/src/services/config'

interface NewsItem {
  id: number
  title: string
  content?: string
  summary: string
  publishDate: string
  source?: string
}

interface NewsImageGeneratorProps {
  newsItem: NewsItem | null
  onImageGenerated?: (imageUrl: string) => void
}

export function NewsImageGenerator({ newsItem }: NewsImageGeneratorProps) {
  const shareCardRef = useRef<HTMLDivElement>(null)

  if (!newsItem) return null

  return (
    <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
      <ShareCard
        ref={shareCardRef}
        title={newsItem.title}
        content={newsItem.content || ''}
        summary={newsItem.summary}
        publishDate={newsItem.publishDate}
        qrCodeDataUrl="" // 会在生成时动态生成
        source={newsItem.source}
      />
    </div>
  )
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
    if (!newsItem || newsItem.source === 'rss') {
      // RSS文章直接使用现有内容，API文章需要获取完整内容
      setFullContent(newsItem?.content || '')
      return newsItem?.content || ''
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
      } else {
        console.error('获取文章详情失败:', response.statusText)
        // 失败时使用现有内容
        setFullContent(newsItem.content || '')
        return newsItem.content || ''
      }
    } catch (error) {
      console.error('获取文章详情出错:', error)
      // 出错时使用现有内容
      setFullContent(newsItem.content || '')
      return newsItem.content || ''
    } finally {
      setIsLoadingContent(false)
    }
  }, [newsItem])

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (!newsItem) return ''

    try {
      const textToEncode =
        overrideQrText ||
        shareUrl ||
        `${window.location.origin}/news/${newsItem.id}`
      const qrDataUrl = await QRCode.toDataURL(textToEncode, {
        width: 120,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
      return qrDataUrl
    } catch (error) {
      console.error('生成二维码失败:', error)
      return ''
    }
  }, [newsItem, overrideQrText, shareUrl])

  // 等待卡片内图片加载完毕，避免截断，确保高度自适应
  const waitForImages = useCallback(async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
    if (imgs.length === 0) return

    const imgPromises = imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve()
          const onDone = () => {
            img.removeEventListener('load', onDone)
            img.removeEventListener('error', onDone)
            resolve()
          }
          img.addEventListener('load', onDone)
          img.addEventListener('error', onDone)
        })
    )

    // 全局超时，避免个别资源阻塞
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2500))
    await Promise.race([Promise.all(imgPromises), timeout])
  }, [])

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!shareCardRef.current || !newsItem) return null

    try {
      // 获取完整文章内容
      await fetchFullContent()

      // 生成二维码
      await generateQRCode()

      // 等待DOM更新（包括内容加载）
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 等待图片加载，确保高度自适应且不截断
      if (shareCardRef.current) {
        await waitForImages(shareCardRef.current)
      }

      if (shareCardRef.current) {
        const node = shareCardRef.current
        // ==================== 代码修改开始 ====================
        const dataUrl = await toPng(node, {
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: 2,
          // 修正属性名：fetchRequest -> fetchRequestInit
          fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit'
          },
          width: node.scrollWidth,
          height: node.scrollHeight
        })
        // ==================== 代码修改结束 ====================
        return dataUrl
      }
    } catch (error) {
      console.error('生成新闻分享图片失败:', error)
      throw error
    }

    return null
  }, [newsItem, fetchFullContent, generateQRCode, waitForImages])

  // 当newsItem变化时获取完整内容
  useEffect(() => {
    if (newsItem) {
      fetchFullContent()
    }
  }, [newsItem, fetchFullContent])

  // 当newsItem变化时生成二维码
  useEffect(() => {
    if (newsItem) {
      generateQRCode()
    }
  }, [newsItem, generateQRCode])

  const ImageGeneratorComponent = () => {
    if (!newsItem) return null

    return (
      <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
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