'use client'

import { Card } from '@/src/components/ui/card'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/src/types/user'
import { ArrowRight } from 'lucide-react'
import { useState, useRef, useLayoutEffect } from 'react'
import { useLanguage } from '@/src/contexts/language-context'

interface RewardsCardProps {
  userInfo: UserInfo | null
  onNavigate?: (page: 'assets' | 'security' | 'community' | 'broker') => void
}

function AdaptiveBalance({
  balance,
  currency
}: {
  balance: number | string | null | undefined
  currency: string
}) {
  const pRef = useRef<HTMLParagraphElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const pElement = pRef.current
    const container = pElement?.parentElement
    if (pElement && container) {
      pElement.style.transform = 'scale(1)'
      const textWidth = pElement.scrollWidth
      const containerWidth = container.clientWidth
      if (textWidth > 0 && containerWidth > 0) {
        const nextScale = Math.min(1, containerWidth / textWidth)
        setScale(nextScale)
      } else {
        setScale(1)
      }
    } else {
      setScale(1)
    }
  }, [])

  const numericValue = Number(balance ?? 0)
  const formatted = Number.isFinite(numericValue)
    ? numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00'

  return (
    <div className="text-center">
      <p
        ref={pRef}
        className="text-[#2F5BFF] font-extrabold leading-tight transition-transform duration-150 inline-block whitespace-nowrap text-3xl md:text-4xl"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        title={numericValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      >
        {formatted}
      </p>
      <p className="text-slate-400 mt-1 text-sm">{currency}</p>
    </div>
  )
}

export function RewardsCard({ userInfo, onNavigate }: RewardsCardProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleWithdraw = () => {
    if (onNavigate) {
      onNavigate('assets')
      return
    }
    router.push('/withdraw')
  }

  return (
    <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
      <div className="p-5 md:p-6">
        <h3 className="text-slate-900 font-semibold mb-5">
          {t('profile.menu.assets.title')}
        </h3>

        <div className="grid grid-cols-2 gap-6 mb-6 md:mb-7">
          <AdaptiveBalance balance={userInfo?.ntxBalance} currency="NTX" />
          <AdaptiveBalance balance={userInfo?.usdtBalance} currency="USDT" />
        </div>

        <button
          type="button"
          className="w-[240px] h-[32px] bg-[#2F5BFF] hover:bg-[#2a52e6] text-white rounded-[8pt] flex items-center justify-center font-semibold transition-colors mx-auto text-sm"
          style={{
            fontFamily:
              '"PingFang SC Semibold", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
          }}
          onClick={handleWithdraw}
        >
          {t('profile.withdraw.button')} <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}
