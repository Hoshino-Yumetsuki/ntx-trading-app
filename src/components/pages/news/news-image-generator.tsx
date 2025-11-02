'use client'

import { useCallback, useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image'
import { generateImageWithRetry } from '@/src/utils/image-generation'
import type { NewsItem } from '@/src/types/news'
import { useAuth } from '@/src/contexts/AuthContext'
import { getUserInfo } from '@/src/services/user'

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin)
    return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

export function useNewsImageGenerator(
  newsItem: NewsItem | null,
  shareUrl?: string
) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [fullContent, setFullContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
  const [overrideQrText, setOverrideQrText] = useState<string>('')
  const { user } = useAuth()
  const [inviteCode, setInviteCode] = useState<string>('')

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
    const loadInvite = async () => {
      try {
        const info = await getUserInfo()
        setInviteCode(info.myInviteCode || '')
      } catch {
        setInviteCode('')
      }
    }
    loadInvite()
  }, [user?.id])

  useEffect(() => {
    const generateQRCode = async () => {
      if (!newsItem) return
      try {
        const textToEncode = overrideQrText ||
          `${getBaseUrl()}/register${inviteCode ? `?invite=${inviteCode}` : ''}`
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
  }, [newsItem, overrideQrText, inviteCode])

  const generateImage = useCallback(
    async (node: HTMLDivElement | null): Promise<string | null> => {
      if (!node || !newsItem) {
        console.error('生成图片的前置条件不足')
        return null
      }

      try {
        const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[]
        const imageUrls = imgs.map((img) => img.currentSrc || img.src)
        await preloadImages(imageUrls)

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
              }
            }
          })
        )

        const fontsReady = (document as any)?.fonts?.ready
        if (fontsReady && typeof fontsReady.then === 'function') {
          try { await fontsReady } catch {}
        }
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))

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
