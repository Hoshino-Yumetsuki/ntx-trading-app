'use client'

import { Card } from '@/src/components/ui/card'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/src/types/user'
import Image from 'next/image'

interface StakeCardProps {
  userInfo: UserInfo | null
  onNavigate?: (page: 'assets' | 'security' | 'community' | 'broker') => void
}

export function StakeCard({ userInfo: _userInfo, onNavigate }: StakeCardProps) {
  const router = useRouter()

  const handleBroker = () => {
    if (onNavigate) {
      onNavigate('broker')
      return
    }
    router.push('/broker')
  }

  return (
    <Card className="glass-card border-white/30 rounded-[16pt] overflow-hidden">
      <div className="p-5 md:p-6">
        <h3 className="text-slate-900 font-semibold mb-5">我的资产</h3>

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
              <p className="text-[#2F5BFF] text-2xl md:text-3xl font-extrabold leading-tight">
                1000
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
              <p className="text-[#2F5BFF] text-2xl md:text-3xl font-extrabold leading-tight">
                1
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
          质押 / 释放
        </button>
      </div>
    </Card>
  )
}
