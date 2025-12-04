'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

export function SplashScreen() {
  const { t } = useLanguage()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/splash-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className={`text-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mb-8 relative">
          <div className="relative w-72 h-72 mx-auto flex items-center justify-center mb-6">
            <Image
              src="/splash-logo.png"
              alt="Loading Illustration"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center">
          <div className="relative w-28 h-9 md:w-32 md:h-10">
            <Image
              src="/logo.png"
              alt="NTX Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <p className="text-lg md:text-xl font-medium text-slate-800">
            {t('splash.subtitle')}
          </p>
          <p className="text-xl md:text-2xl font-bold text-[#1C55FF] max-w-xs mx-auto leading-relaxed">
            {t('splash.description')}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{t('splash.loading')}</span>
        </div>
      </div>
    </div>
  )
}
