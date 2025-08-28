'use client'

import { Card } from '@/src/components/ui/card'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/src/types/user'
import { ArrowRight } from 'lucide-react'
import { useState, useRef, useLayoutEffect } from 'react' // 引入 React Hooks

interface RewardsCardProps {
  userInfo: UserInfo | null
  onNavigate?: (page: 'assets' | 'security' | 'community' | 'broker') => void
}

// 1. 将数字格式化函数直接放在本文件中
// 这个函数用于将大数字缩写 (例如 1000 -> 1k)
function formatLargeNumber(num: number | string | null | undefined, digits = 1) {
  if (num === null || num === undefined) return '0'
  const numericValue = Number(num);
  if (isNaN(numericValue)) return '0';

  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
  ]

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = si.slice().reverse().find(item => numericValue >= item.value)
  
  return item
    ? (numericValue / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : numericValue.toString()
}

// 2. 创建一个可自适应字体大小的内部组件
function AdaptiveBalance({ balance, currency }: { balance: number | string | null | undefined; currency: string }) {
  const pRef = useRef<HTMLParagraphElement>(null)
  // 默认使用最大的字体class
  const defaultFontSizeClasses = 'text-3xl md:text-4xl'
  const [fontSizeClasses, setFontSizeClasses] = useState(defaultFontSizeClasses)

  // 使用 useLayoutEffect 可以在浏览器绘制前同步执行，避免闪烁
  useLayoutEffect(() => {
    const pElement = pRef.current
    const container = pElement?.parentElement
    if (pElement && container) {
      // 检查文本内容的实际宽度是否大于容器的可见宽度
      if (pElement.scrollWidth > container.clientWidth) {
        // 如果超出了，就换用小一号的字体
        setFontSizeClasses('text-2xl md:text-3xl')
      } else {
        // 否则，恢复默认字体大小
        setFontSizeClasses(defaultFontSizeClasses)
      }
    }
  }, [balance]) // 依赖项是 balance，每次余额变化时重新计算

  const formattedBalance = formatLargeNumber(balance);

  return (
    <div className="text-center">
      <p
        ref={pRef}
        className={`text-[#2F5BFF] font-extrabold leading-tight transition-all duration-200 ${fontSizeClasses}`}
        title={Number(balance).toLocaleString()} // title 属性显示完整数字
      >
        {formattedBalance || '0'}
      </p>
      <p className="text-slate-400 mt-1 text-sm">{currency}</p>
    </div>
  )
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
          {/* 3. 在主组件中使用新的 AdaptiveBalance 组件 */}
          <AdaptiveBalance balance={userInfo?.ntxBalance} currency="NTX" />
          <AdaptiveBalance balance={userInfo?.usdtBalance} currency="USDT" />
        </div>

        <button
          type="button"
          className="w-[240px] h-[32px] bg-[#2F5BFF] hover:bg-[#2a52e6] text-white rounded-[8pt] flex items-center justify-center font-semibold transition-colors mx-auto text-sm"
          style={{
            fontFamily:
              '"PingFang SC Semibold", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          }}
          onClick={handleWithdraw}
        >
          立即提现 <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}