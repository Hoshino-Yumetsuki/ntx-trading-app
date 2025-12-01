'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import MarkdownIt from 'markdown-it'
import multimdTable from 'markdown-it-multimd-table'
import Image from 'next/image'
import { useLanguage } from '@/src/contexts/language-context'

interface ShareCardProps {
  title: string
  content: string
  summary: string
  publishDate: string
  qrCodeDataUrl?: string
  source?: string
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ title, content, qrCodeDataUrl }, ref) => {
    const { t, language } = useLanguage()
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    }).use(multimdTable, {
      multiline: true,
      rowspan: true,
      headerless: true
    })

    const titleContainerRef = useRef<HTMLDivElement>(null)
    const [titleHeight, setTitleHeight] = useState(0)

    useEffect(() => {
      const measureTitle = () => {
        if (titleContainerRef.current) {
          setTitleHeight(titleContainerRef.current.offsetHeight)
        }
      }
      measureTitle()
      window.addEventListener('resize', measureTitle)
      return () => window.removeEventListener('resize', measureTitle)
    }, [])

    const contentWrapperRef = useRef<HTMLDivElement>(null)
    const contentInnerRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [contentFontSize, setContentFontSize] = useState(22)
    const BASE_HEIGHT = 1068
    const TOP_SLICE = Math.floor(BASE_HEIGHT / 2)
    const BOTTOM_SLICE = BASE_HEIGHT - TOP_SLICE
    const [cardHeight, setCardHeight] = useState(BASE_HEIGHT)

    useEffect(() => {
      const fitContent = () => {
        const wrapper = contentWrapperRef.current
        const inner = contentInnerRef.current as HTMLDivElement | null
        const footer = footerRef.current
        if (!wrapper || !inner || !footer) return

        const available = footer.offsetTop - wrapper.offsetTop - 8
        const font = 22
        inner.style.fontSize = `${font}px`
        inner.style.lineHeight = '2.0'
        setContentFontSize(font)

        const overflow = Math.max(0, inner.scrollHeight - available)
        setCardHeight(BASE_HEIGHT + overflow)
      }

      const id = window.requestAnimationFrame(fitContent)
      window.addEventListener('resize', fitContent)
      return () => {
        window.cancelAnimationFrame(id)
        window.removeEventListener('resize', fitContent)
      }
    }, [])

    const renderMarkdown = (text: string) => {
      const withoutMdImages = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      const html = md.render(withoutMdImages)
      const withoutHtmlImages = html.replace(/<img[^>]*>/gi, '')
      return { __html: withoutHtmlImages }
    }

    const qrPlaceholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'>
  <rect width='100%' height='100%' fill='#ffffff'/>
  <rect x='8' y='8' width='134' height='134' rx='12' ry='12' fill='none' stroke='#E2E8F0' stroke-width='2'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94A3B8' font-family='system-ui, sans-serif' font-size='14'>QR Code</text>
</svg>`
    const qrSrc =
      qrCodeDataUrl && qrCodeDataUrl.trim() !== ''
        ? qrCodeDataUrl
        : `data:image/svg+xml;utf8,${encodeURIComponent(qrPlaceholderSvg)}`

    const formatDateYMD = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      if (language === 'zh') {
        return `${y}年${m}月${day}日`
      }
      return `${y}-${m}-${day}`
    }
    const todayLabel = formatDateYMD(new Date())

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          width: '600px',
          height: `${cardHeight}px`,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(2, 6, 23, 0.08)'
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-0"
          style={{
            height: `${TOP_SLICE}px`,
            backgroundImage: 'url(/share-card-bg.png)',
            backgroundSize: '600px 1068px',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-0"
          style={{
            height: `${BOTTOM_SLICE}px`,
            backgroundImage: 'url(/share-card-bg.png)',
            backgroundSize: '600px 1068px',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div
          aria-hidden
          className="absolute left-0 right-0 z-0"
          style={{
            top: `${TOP_SLICE}px`,
            bottom: `${BOTTOM_SLICE}px`,
            background: '#fefefe'
          }}
        />
        <div className="absolute left-8 top-6 z-30 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NTX Logo"
            width={240}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <div
          ref={titleContainerRef}
          className="absolute left-0 right-0 z-20 pointer-events-none overflow-visible px-8"
          style={{ top: '96px' }}
        >
          <h1 className="text-left whitespace-normal break-words text-[36px] font-extrabold text-slate-900 leading-snug">
            {title}
          </h1>
        </div>
        <div
          ref={contentWrapperRef}
          className="relative z-10 px-8 pb-[220px]"
          style={{ marginTop: Math.max(160, titleHeight + 120) }}
        >
          <div className="text-left text-slate-700 text-base select-none mb-2">
            {todayLabel}
          </div>
          <div className="content text-slate-700">
            <div
              ref={contentInnerRef}
              dangerouslySetInnerHTML={renderMarkdown(content)}
              style={{
                fontSize: contentFontSize,
                lineHeight: '2.0',
                textAlign: 'justify',
                textJustify: 'inter-ideograph' as any,
                wordBreak: 'break-word' as any,
                overflowWrap: 'anywhere' as any
              }}
            />
          </div>
        </div>

        <div
          ref={footerRef}
          className="absolute left-8 right-8 bottom-12 flex items-center justify-between"
        >
          <div className="text-left w-[280px] flex flex-col justify-center h-[170px]">
            <div className="flex justify-between text-[#1C55FF] font-bold text-[32px] leading-tight">
              <span>{t('news.shareCard.slogan1')}</span>
            </div>
            <div className="text-gray-600 text-[20px] mt-2 leading-tight w-full">
              {t('news.shareCard.slogan2')}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-sm">
              <Image
                src={qrSrc}
                alt={t('news.shareCard.qrAlt')}
                width={150}
                height={150}
                className="w-[150px] h-[150px]"
                priority
              />
            </div>
            <div className="text-slate-700 text-base font-medium">
              {t('news.shareCard.qrLabel')}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
