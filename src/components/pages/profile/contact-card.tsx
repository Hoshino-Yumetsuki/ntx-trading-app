'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Copy } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'

export function ContactCard() {
  const { t } = useLanguage()

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  return (
    <Card className="glass-card border-white/30 rounded-[16pt]">
      <CardHeader>
        <CardTitle className="text-slate-800">
          {t('profile.contact.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 glass-card rounded-[16pt] hover:bg-white/40 transition-all">
          <div className="flex items-center space-x-3">
            <div className="premium-icon w-10 h-10 rounded-[16pt]">
              <svg
                className="w-5 h-5 text-slate-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Twitter Icon</title>
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-medium">
                {t('profile.contact.twitter.title')}
              </p>
              <p className="text-slate-600 text-sm">
                {t('profile.contact.twitter.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 text-sm">@NexTradeDao</span>
            <button
              type="button"
              onClick={() => copyToClipboard('@NexTradeDao', '已复制到剪贴板')}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 glass-card rounded-[16pt] hover:bg-white/40 transition-all">
          <div className="flex items-center space-x-3">
            <div className="premium-icon w-10 h-10 rounded-[16pt]">
              <svg
                className="w-5 h-5 text-slate-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Telegram Icon</title>
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 9.728-.896 9.728-.379 3.008-1.405 3.538-2.898 2.928 0 0-1.388-.63-3.659-1.947-1.066-.622-1.858-1.003-2.936-1.595-.633-.347-1.097-.608-1.371-1.003-.274-.394-.137-.622.137-.896.274-.274 3.659-3.384 7.318-6.768.274-.274.411-.685.137-.959-.274-.274-.685-.137-.959.137L8.16 15.84s-1.388 1.388-3.659 2.018c-.959.274-1.858-.137-1.858-.137s-1.388-.959-.137-2.018c0 0 6.768-4.892 9.728-7.043 1.388-1.003 2.936-1.388 2.936-1.388s1.858-.685 1.858 1.888z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-medium">
                {t('profile.contact.telegram.title')}
              </p>
              <p className="text-slate-600 text-sm">
                {t('profile.contact.telegram.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 text-sm">@NexTradeDao</span>
            <button
              type="button"
              onClick={() => copyToClipboard('@NexTradeDao', '已复制到剪贴板')}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
