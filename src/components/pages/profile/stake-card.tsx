'use client'

import { Card } from '@/src/components/ui/card'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/src/types/user'
import Image from 'next/image'
import { toast } from 'sonner'
import { useLanguage } from '@/src/contexts/language-context'

interface StakeCardProps {
  userInfo: UserInfo | null
  onNavigate?: (page: 'assets' | 'security' | 'community' | 'broker') => void
}

export function StakeCard({ userInfo }: StakeCardProps) {
  const _router = useRouter()
  const { t } = useLanguage()

  const handleBroker = () => {
    toast.info(t('profile.stake.notAvailable'), {
      position: 'top-center',
      duration: 2000
    })
  }

  if (!userInfo) {
    return (
      <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
        <div className="p-5 md:p-6 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 rounded mb-5"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-32 bg-slate-200 rounded-md"></div>
            <div className="h-12 w-12 bg-slate-200 rounded-md"></div>
            <div className="h-12 w-32 bg-slate-200 rounded-md"></div>
          </div>
          <div className="h-8 w-[240px] bg-slate-200 rounded-[8pt] mx-auto"></div>
        </div>
      </Card>
    )
  }

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return '0'

    if (balance >= 1000000) {
      return `${(balance / 1000000).toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })}M`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })}K`
    }

    return balance.toLocaleString('en-US', {
      maximumFractionDigits: 2
    })
  }

  const ntxDisplayBalance = formatBalance(userInfo.ntxBalance)
  const gntxDisplayBalance = formatBalance(userInfo.gntxBalance)

  return (
    <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
      <div className="p-5 md:p-6">
        <h3 className="text-slate-900 font-semibold mb-5">{t('profile.stake.myStake')}</h3>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="relative w-10 h-10 md:w-12 md:h-12 mr-3 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src="/image42@3x.png"
                alt="NTX"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">NTX</p>
              <p
                className="text-[#2F5BFF] font-extrabold leading-tight truncate"
                style={{
                  fontSize: 'clamp(1rem, 4vw, 1.875rem)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {ntxDisplayBalance}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 border border-dashed border-slate-300 rounded-md bg-white">
            <div className="flex flex-col leading-none">
              <span className="text-[#2F5BFF]">→</span>
              <span className="text-[#2F5BFF]">←</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative w-10 h-10 md:w-12 md:h-12 mr-3 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src="/image43@3x.png"
                alt="GNTX"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">GNTX</p>
              <p
                className="text-[#2F5BFF] font-extrabold leading-tight truncate"
                style={{
                  fontSize: 'clamp(1rem, 4vw, 1.875rem)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {gntxDisplayBalance}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="w-[240px] h-[32px] bg-[#2F5BFF] hover:bg-[#2a52e6] text-white rounded-[8pt] flex items-center justify-center font-semibold transition-colors mx-auto text-sm"
          style={{
            fontFamily:
              '"PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
          }}
          onClick={handleBroker}
        >
          {t('profile.stake.title')}
        </button>
      </div>
    </Card>
  )
}
