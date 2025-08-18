'use client'

import { forwardRef } from 'react'
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
  ({ title, content, summary, publishDate, qrCodeDataUrl }, ref) => {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    const renderMarkdown = (text: string) => {
      return { __html: md.render(text) }
    }

    return (
      <div
        ref={ref}
        className="bg-white p-8 shadow-2xl rounded-xl relative"
        style={{
          fontFamily: 'system-ui, sans-serif',
          width: '600px',
          margin: '0 auto'
        }}
      >
        {/* Header with NTX branding */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* NTX Logo */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                <Image
                  src="/ntx_1_1.jpg"
                  alt="NTX Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                  loading="eager"
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-gray-800 font-bold text-lg leading-tight">
                  NTX DAO
                </div>
                <div className="text-gray-500 text-xs leading-tight">
                  NEXTRADE DAO
                </div>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              {new Date(publishDate).toLocaleDateString('zh-CN')}
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {summary && (
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none mb-8">
          <div
            className="text-gray-800 leading-relaxed"
            // biome-ignore lint: false
            dangerouslySetInnerHTML={renderMarkdown(content)}
            style={{
              fontSize: '14px',
              lineHeight: '1.6'
            }}
          />
        </div>

        {/* Footer with QR code and slogan */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-end justify-between">
          {/* QR Code - Bottom Left */}
          <div className="flex flex-col items-center">
            {qrCodeDataUrl ? (
              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <Image
                  src={qrCodeDataUrl}
                  alt="二维码"
                  width={60}
                  height={60}
                  className="w-15 h-15"
                  priority
                  loading="eager"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-15 h-15 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">二维码</span>
              </div>
            )}
            <span className="text-gray-500 text-xs mt-1">扫码了解更多</span>
          </div>

          {/* Slogan - Bottom Right */}
          <div className="text-right">
            <div className="text-gray-700 font-medium text-sm leading-tight">
              聪明的投资者
              <br />
              绝不浪费每分本金
            </div>
            <div className="text-gray-500 text-xs mt-1">NTX DAO</div>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
