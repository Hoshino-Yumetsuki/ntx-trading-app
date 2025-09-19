'use client'

import { useCallback, useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'
import { generateImageWithRetry } from '@/src/utils/image-generation'
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
        // 1) 从 DOM 收集图片并预加载（包括 Next/Image 渲染出的 <img>）
        const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[]
        const imageUrls = imgs.map((img) => img.currentSrc || img.src)
        await preloadImages(imageUrls)

        // 2) 等待所有图片 complete+decode，避免截图过早
        await Promise.all(
          imgs.map(async (img) => {
            if (!img.complete) {
              await new Promise<void>((res) => {
                img.addEventListener('load', () => res(), { once: true })
                img.addEventListener('error', () => res(), { once: true })
              })
            }
            if ('decode' in img && typeof (img as any).decode === 'function') {
              try {
                await (img as any).decode()
              } catch {
                // ignore decode errors
              }
            }
          })
        )

        // 3) 等待字体与两帧 rAF，使排版稳定
        const fontsReady = (document as any)?.fonts?.ready
        if (fontsReady && typeof fontsReady.then === 'function') {
          try { await fontsReady } catch {}
        }
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))

        // 4) 等待高度稳定（连续多次高度一致）
        const waitForStableHeight = async (el: HTMLElement, tries = 20) => {
          let last = -1
          let stableCount = 0
          for (let i = 0; i < tries; i++) {
            const h = el.scrollHeight
            if (h === last) {
              stableCount += 1
              if (stableCount >= 2) break
            } else {
              stableCount = 0
            }
            last = h
            await new Promise((r) => setTimeout(r, 50))
          }
        }
        await waitForStableHeight(node)

        const width = 600
        const height = node.scrollHeight

        const result = await generateImageWithRetry(node, {
          width,
          height,
          pixelRatio: 2,
          minBlobSize: 50000,
          maxAttempts: 10,
          retryDelay: 500
        })

        return result
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
