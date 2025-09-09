'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import MarkdownIt from 'markdown-it'
import Image from 'next/image'

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
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    // 标题高度测量（用于推开正文），允许换行
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

    // 正文根据长度自动缩放字号以适配高度
    const contentWrapperRef = useRef<HTMLDivElement>(null)
    const contentInnerRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [contentFontSize, setContentFontSize] = useState(18)
    // 允许根据内容动态增长的整体高度
    const BASE_HEIGHT = 1068
    // 尽可能从中间对半分开：上下切片各占一半原图高度
    const TOP_SLICE = Math.floor(BASE_HEIGHT / 2)
    const BOTTOM_SLICE = BASE_HEIGHT - TOP_SLICE
    const [cardHeight, setCardHeight] = useState(BASE_HEIGHT)

    useEffect(() => {
      const fitContent = () => {
        const wrapper = contentWrapperRef.current
        const inner = contentInnerRef.current as HTMLDivElement | null
        const footer = footerRef.current
        if (!wrapper || !inner || !footer) return

        // 计算正文字区可用高度（到底部浮层顶部）
        const available = footer.offsetTop - wrapper.offsetTop - 8
        // 从基础字号开始递减，直到内容高度不再溢出或到达下限
        let font = 18
        inner.style.fontSize = `${font}px`
        inner.style.lineHeight = '1.9'
        let guard = 0
        while (inner.scrollHeight > available && font > 14 && guard < 24) {
          font -= 1
          inner.style.fontSize = `${font}px`
          guard++
        }
        setContentFontSize(font)

        // 若仍溢出，则拉长卡片高度：保留头尾装饰，中间用 #fefefe 延展
        const overflow = Math.max(0, inner.scrollHeight - available)
        setCardHeight(BASE_HEIGHT + overflow)
      }

      // 等待一帧，确保 DOM 布局完成后再测量
      const id = window.requestAnimationFrame(fitContent)
      window.addEventListener('resize', fitContent)
      return () => {
        window.cancelAnimationFrame(id)
        window.removeEventListener('resize', fitContent)
      }
    }, [])

    const renderMarkdown = (text: string) => {
      // 移除 Markdown 图片与 HTML img，保证版式稳定
      const withoutMdImages = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      const html = md.render(withoutMdImages)
      const withoutHtmlImages = html.replace(/<img[^>]*>/gi, '')
      return { __html: withoutHtmlImages }
    }

    // 二维码占位（当无数据时使用）
    const qrPlaceholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'>
  <rect width='100%' height='100%' fill='#ffffff'/>
  <rect x='8' y='8' width='134' height='134' rx='12' ry='12' fill='none' stroke='#E2E8F0' stroke-width='2'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94A3B8' font-family='system-ui, sans-serif' font-size='14'>QR Code</text>
</svg>`
    const qrSrc =
      qrCodeDataUrl && qrCodeDataUrl.trim() !== ''
        ? qrCodeDataUrl
        : `data:image/svg+xml;utf8,${encodeURIComponent(qrPlaceholderSvg)}`

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          fontFamily: 'system-ui, sans-serif',
          width: '600px',
          height: `${cardHeight}px`,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(2, 6, 23, 0.08)'
        }}
      >
        {/* 背景切片：上、下固定装饰，中间 #fefefe 可延展 */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-0"
          style={{
            height: `${TOP_SLICE}px`,
            backgroundImage: 'url(/Frame35.png)',
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
            backgroundImage: 'url(/Frame35.png)',
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
        {/* Header: absolute logo top-left, compact title on the right */}
        <div className="absolute top-6 left-6 pointer-events-none select-none z-10">
          <Image
            src="/Frame17@3x.png"
            alt="NTX Logo"
            width={200}
            height={200}
            priority
            loading="eager"
            unoptimized
          />
          {/* Scoped styles for markdown content spacing */}
          <style jsx>{`
          .content :global(p) {
            margin: 0 0 1em 0; /* 段与段之间空一行 */
            text-indent: 0; /* 移除首行缩进 */
          }
          .content :global(ul),
          .content :global(ol) {
            margin: 0 0 1em 1.25em;
          }
        `}</style>
        </div>

        <div
          ref={titleContainerRef}
          className="absolute left-0 right-0 z-20 pointer-events-none overflow-visible px-8"
          style={{ top: '96px' }}
        >
          <h1 className="text-left whitespace-normal break-words text-[32px] font-extrabold text-slate-900 leading-snug">
            {title}
          </h1>
          {/* 简介已移除，不再渲染 */}
        </div>

        {/* Content */}
        <div
          ref={contentWrapperRef}
          className="relative z-10 px-8 pb-[220px]"
          style={{ marginTop: Math.max(160, titleHeight + 120) }}
        >
          <div className="content text-slate-700">
            <div
              ref={contentInnerRef}
              // biome-ignore lint: false
              dangerouslySetInnerHTML={renderMarkdown(content)}
              style={{
                fontSize: contentFontSize,
                lineHeight: '1.9'
              }}
            />
          </div>
        </div>

        {/* Bottom overlay: Left slogan, Right QR */}
        <div
          ref={footerRef}
          className="absolute left-8 right-8 bottom-12 flex items-center justify-between"
        >
          {/* 左侧文案区 */}
          <div className="text-left w-[280px] flex flex-col justify-center h-[170px]">
            <div className="flex justify-between text-[#1C55FF] font-bold text-[32px] leading-tight">
              <span>连接用户 聚合资源</span>
            </div>
            <div className="text-gray-600 text-[20px] mt-2 leading-tight w-full">
              挖掘你的 Web3 机会
            </div>
          </div>

          {/* 右侧二维码区（更大） */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-sm">
              <Image
                src={qrSrc}
                alt="二维码"
                width={150}
                height={150}
                className="w-[150px] h-[150px]"
                unoptimized
                priority
              />
            </div>
            <div className="text-slate-700 text-base font-medium">扫码注册</div>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
