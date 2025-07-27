'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

export function SplashScreen() {
  const { t } = useLanguage()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className={`text-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto glass-card-strong rounded-2xl flex items-center justify-center mb-4">
            <Image
              src="/ntx_1_1.jpg"
              alt="NTX Logo"
              width={96}
              height={96}
              className="object-contain rounded-xl"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 gradient-text">
          {t('splash.title')}
        </h1>

        <div className="space-y-3 mb-8">
          <p className="text-xl font-semibold text-slate-700">
            {t('splash.subtitle')}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-blue-700 max-w-xs mx-auto leading-relaxed animate-pulse">
            {t('splash.description')}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <TrendingUp className="w-5 h-5 animate-bounce" />
          <span className="text-sm">{t('splash.loading')}</span>
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}
