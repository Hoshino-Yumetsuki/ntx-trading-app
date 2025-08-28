'use client'

import { Card } from '@/src/components/ui/card'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/src/types/user'
import { ArrowRight } from 'lucide-react'

interface RewardsCardProps {
  userInfo: UserInfo | null
  onNavigate?: (page: 'assets' | 'security' | 'community' | 'broker') => void
}

export function RewardsCard({ userInfo, onNavigate }: RewardsCardProps) {
  const router = useRouter()

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
        <h3 className="text-slate-900 font-semibold mb-5">我的资产</h3>

        <div className="grid grid-cols-2 gap-6 mb-6 md:mb-7">
          <div className="text-center">
            <p className="text-[#2F5BFF] text-3xl md:text-4xl font-extrabold leading-tight">
              {userInfo?.gntxBalance?.toLocaleString() || '5645'}
            </p>
            <p className="text-slate-400 mt-1 text-sm">GNTX</p>
          </div>

          <div className="text-center">
            <p className="text-[#2F5BFF] text-3xl md:text-4xl font-extrabold leading-tight">
              {userInfo?.usdtBalance?.toLocaleString() || '3243'}
            </p>
            <p className="text-slate-400 mt-1 text-sm">USTD</p>
          </div>
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
          立即提现 <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}
