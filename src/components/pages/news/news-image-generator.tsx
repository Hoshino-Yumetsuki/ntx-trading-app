'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { ShareCard } from '@/src/components/ui/share-card'
import { API_BASE_URL } from '@/src/services/config'
import { preloadImages } from '@/src/utils/image' // 导入预加载函数

interface NewsItem {
  id: number
  title: string
  content?: string
  summary: string
  publishDate: string
  source?: string
}
interface NewsImageGeneratorProps {
  newsItem: NewsItem | null;
  onImageGenerated?: (imageUrl: string) => void;
}

// ... NewsImageGenerator component remains the same ...
export function NewsImageGenerator({ newsItem }: NewsImageGeneratorProps) {
  if (!newsItem) return null
  return (
    <div className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none">
      <ShareCard
        title={newsItem.title}
        content={newsItem.content || ''}
        summary={newsItem.summary}
        publishDate={newsItem.publishDate}
        qrCodeDataUrl=""
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
      const content = newsItem?.content || '';
      setFullContent(content);
      return content;
    }
    setIsLoadingContent(true)
    try {
      const response = await fetch(`${API_BASE_URL}/user/academy/articles/${newsItem.id}`)
      if (response.ok) {
        const articleData = await response.json()
        const content = articleData.content || newsItem.content || '';
        setFullContent(content);
        return content;
      }
      const content = newsItem.content || '';
      setFullContent(content);
      return content;
    } catch (error) {
      const content = newsItem.content || '';
      setFullContent(content);
      return content;
    } finally {
      setIsLoadingContent(false)
    }
  }, [newsItem])

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (!newsItem) return ''
    try {
      const textToEncode = overrideQrText || shareUrl || `${window.location.origin}/news/${newsItem.id}`
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
        console.error('生成图片的前置条件不足');
        return null;
    }

    try {
      // 步骤 1: 获取所有动态数据（文章内容和二维码URL）
      await Promise.all([fetchFullContent(), generateQRCode()]);

      // 步骤 2: 等待 React 将最新的 state (fullContent, qrCodeDataUrl) 更新到 DOM
      await new Promise((resolve) => requestAnimationFrame(resolve));
      
      const node = shareCardRef.current;
      if (!node) return null;

      // 步骤 3: 从更新后的 DOM 中收集所有图片 URL
      const imageUrls = Array.from(node.querySelectorAll('img')).map(img => img.src);
      
      // 步骤 4: 【核心】执行预加载
      await preloadImages(imageUrls);

      // 步骤 5: 再次等待一帧，确保浏览器绘制从缓存中读取的图片
      await new Promise((resolve) => requestAnimationFrame(resolve));

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
      });

      return dataUrl;
    } catch (error) {
      console.error('生成新闻分享图片失败:', error);
      throw error;
    }
  }, [newsItem, fetchFullContent, generateQRCode]);

  useEffect(() => {
    if (newsItem) {
      fetchFullContent();
      generateQRCode();
    }
  }, [newsItem, fetchFullContent, generateQRCode]);

  const ImageGeneratorComponent = () => {
    if (!newsItem) return null;
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
    );
  };

  return { generateImage, ImageGeneratorComponent, setOverrideQrText };
}