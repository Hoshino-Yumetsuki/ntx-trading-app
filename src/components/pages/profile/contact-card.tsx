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

      <Card
        className="glass-card border-white/30 rounded-[16pt] overflow-hidden"
        style={{ aspectRatio: '343/149' }}
      >
        {/* Twitter */}
        <div className="flex items-center justify-between p-3 hover:bg-white/40 transition-all border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="premium-icon w-8 h-8 rounded-[12pt] relative overflow-hidden">
              <Image
                src="/Frame32@3x.png"
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

        {/* Telegram */}
        <div className="flex items-center justify-between p-3 hover:bg-white/40 transition-all">
          <div className="flex items-center space-x-3">
            <div className="premium-icon w-8 h-8 rounded-[12pt] relative overflow-hidden">
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
      </Card>
    </div>
  )
}
