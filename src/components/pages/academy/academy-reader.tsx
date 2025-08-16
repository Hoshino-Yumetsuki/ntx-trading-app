'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import '@/src/styles/markdown.css'

interface AcademyMarkdownReaderProps {
  title: string
  content: string
  onBack: () => void
}

export function AcademyMarkdownReader({
  title,
  content,
  onBack
}: AcademyMarkdownReaderProps) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  })

  const html = md.render(content || '')
  const sanitized = DOMPurify.sanitize(html)

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-start mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> 返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-4">
        <Card className="glass-card border-white/30 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div
              className="markdown-content max-w-none"
              // biome-ignore lint: false
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
