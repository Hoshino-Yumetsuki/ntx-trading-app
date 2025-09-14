'use client'

import { useCallback, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'
import type { NewsItem } from '@/src/types/news'

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
        // 等待下一帧与字体加载，减少文字排版差异
        await new Promise((resolve) => requestAnimationFrame(resolve))
        if ((document as any).fonts?.ready) {
          try {
            await (document as any).fonts.ready
          } catch {}
        }

        const scale = 1
        const width = 600
        let height = node.scrollHeight

        // 使用离屏克隆节点，避免受预览容器的 transform 等样式影响
        const offscreen = document.createElement('div')
        offscreen.style.position = 'absolute'
        offscreen.style.left = '-10000px'
        offscreen.style.top = '0'
        offscreen.style.width = `${width}px`
        offscreen.style.height = `${height}px`
        offscreen.style.backgroundColor = '#ffffff'
        offscreen.style.webkitTextSizeAdjust = '100%'
        const clone = node.cloneNode(true) as HTMLDivElement
        clone.style.transform = 'none'
        clone.style.transformOrigin = 'top left'
        clone.style.width = `${width}px`
        clone.style.height = `${height}px`
        clone.style.backgroundColor = '#ffffff'
        offscreen.appendChild(clone)
        document.body.appendChild(offscreen)

        // 确保克隆节点内的图片已解码，避免渲染空白
        const cloneImgs = Array.from(clone.querySelectorAll('img'))
        cloneImgs.forEach((img) => {
          try {
            ;(img as HTMLImageElement).loading = 'eager'
          } catch {}
        })
        try {
          await Promise.all(
            cloneImgs.map(
              (img) =>
                (img as HTMLImageElement).decode?.().catch(() => {}) ||
                Promise.resolve()
            )
          )
        } catch {}

        // 使用克隆后的实际高度，防止高度为 0 或截断
        height = clone.scrollHeight || height
        offscreen.style.height = `${height}px`

        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale,
          useCORS: true,
          allowTaint: false,
          width,
          height,
          imageTimeout: 15000,
          foreignObjectRendering: false,
          windowWidth: width,
          windowHeight: height,
          scrollX: 0,
          scrollY: 0
        })

        const dataUrl = canvas.toDataURL('image/png')
        try {
          document.body.removeChild(offscreen)
        } catch {}
        return dataUrl
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
