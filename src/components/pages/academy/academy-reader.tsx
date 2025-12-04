'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import MarkdownIt from 'markdown-it'
import multimdTable from 'markdown-it-multimd-table'
import DOMPurify from 'dompurify'
import '@/src/styles/markdown.css'
import { useLanguage } from '@/src/contexts/language-context'
import { processLocaleString } from '@/src/utils/apiLocaleProcessor'

/**
 * 清除文本中的控制标记 [Sort:数字]、[Link:...] 和 [Show]
 */
function cleanControlTags(text: string): string {
  return text
    .replace(/\[Sort:\d+\]/g, '')
    .replace(/\[Link:[^\]]+\]/g, '')
    .replace(/\[Show\]/gi, '')
}

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
  const { t, language } = useLanguage()
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  }).use(multimdTable, {
    multiline: true,
    rowspan: true,
    headerless: true
  })

  // 先清除控制标记，再处理多语言标记
  const cleanedContent = cleanControlTags(content || '')
  const processedContent = processLocaleString(cleanedContent, language)

  // 同样处理标题
  const cleanedTitle = cleanControlTags(title || '')
  const processedTitle = processLocaleString(cleanedTitle, language)

  const html = md.render(processedContent)
  const sanitized = DOMPurify.sanitize(html)

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-start mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> {t('common.back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              {processedTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-6 mt-4">
        <Card className="glass-card border-white/30 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div
              className="markdown-content max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
