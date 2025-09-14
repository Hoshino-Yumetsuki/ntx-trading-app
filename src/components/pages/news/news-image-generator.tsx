'use client'

import { useCallback, useState, useEffect } from 'react'
import { toSvg } from 'html-to-image'
import { svgAsPngUri } from 'save-svg-as-png'
import QRCode from 'qrcode'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'
import type { NewsItem } from '@/src/types/news'

/**
 * Hook to use the news image generator.
 * It now returns data and a function, but does not render anything.
 */
export function useNewsImageGenerator(
  newsItem: NewsItem | null,
  shareUrl?: string
) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [fullContent, setFullContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
  const [overrideQrText, setOverrideQrText] = useState<string>('')

  const fetchFullContent = useCallback(async () => {
    if (!newsItem) return
    if (newsItem.source === 'rss') {
      setFullContent(newsItem.content || '')
      return
    }
    setIsLoadingContent(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/academy/articles/${newsItem.id}`
      )
      if (response.ok) {
        const articleData = await response.json()
        setFullContent(articleData.content || newsItem.content || '')
      } else {
        setFullContent(newsItem.content || '')
      }
    } catch (_error) {
      setFullContent(newsItem.content || '')
    } finally {
      setIsLoadingContent(false)
    }
  }, [newsItem])

  useEffect(() => {
    if (newsItem) {
      fetchFullContent()
    }
  }, [newsItem, fetchFullContent])

  useEffect(() => {
    const generateQRCode = async () => {
      if (!newsItem) return
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
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    }
    generateQRCode()
  }, [newsItem, overrideQrText, shareUrl])

  const generateImage = useCallback(
    async (node: HTMLDivElement | null): Promise<string | null> => {
      if (!node || !newsItem) {
        console.error('生成图片的前置条件不足')
        return null
      }

      try {
        // 从DOM中收集图片URL并预加载
        const imageUrls = Array.from(node.querySelectorAll('img')).map(
          (img) => img.src
        )
        await preloadImages(imageUrls)
        await new Promise((resolve) => requestAnimationFrame(resolve))

        // --- 核心修改 ---
        // 1. 先生成 SVG Data URL
        const svgDataUrl = await toSvg(node, {
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: 2, // 保持2倍图以确保清晰度
          fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit'
          },
          width: node.scrollWidth,
          height: node.scrollHeight
        })

        // 2. 将 SVG 转换为 PNG Data URL
        const pngDataUrl = await svgAsPngUri(svgDataUrl, {
          scale: 2 // 确保输出的PNG也是2倍大小
        })
        // --- 修改结束 ---

        return pngDataUrl // 返回PNG格式的数据
      } catch (error) {
        console.error('生成新闻分享图片失败:', error)
        throw error
      }
    },
    [newsItem]
  )

  return {
    generateImage,
    setOverrideQrText,
    qrCodeDataUrl,
    fullContent,
    isLoadingContent
  }
}