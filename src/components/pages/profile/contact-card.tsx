'use client'

import { Card } from '@/src/components/ui/card'
import { Copy } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'
import Image from 'next/image'

export function ContactCard() {
  const { t } = useLanguage()

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-800 font-medium">{t('profile.contactus')}</h3>
      </div>

      <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
        {/* Twitter */}
        <div className="flex items-center justify-between p-4 hover:bg-white/40 transition-all border-b border-white/20">
          <a
            href="https://twitter.com/NexTradeDao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4"
          >
            <div className="premium-icon w-10 h-10 rounded-[12pt] relative overflow-hidden">
              <Image
                src="/twitter.png"
                alt="Twitter Icon"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-slate-800 font-medium">
                {t('profile.contact.twitter.title')}
              </p>
              <p className="text-slate-600 text-sm">
                {t('profile.contact.twitter.description')}
              </p>
            </div>
          </a>
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

        {/* Telegram */}
        <div className="flex items-center justify-between p-4 hover:bg-white/40 transition-all">
          <a
            href="https://t.me/NexTradeDao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4"
          >
            <div className="premium-icon w-10 h-10 rounded-[12pt] relative overflow-hidden">
              <Image
                src="/telegram.png"
                alt="Telegram Icon"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-slate-800 font-medium">
                {t('profile.contact.telegram.title')}
              </p>
              <p className="text-slate-600 text-sm">
                {t('profile.contact.telegram.description')}
              </p>
            </div>
          </a>
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
      </Card>
    </div>
  )
}
