"use client"

import { Card, CardContent } from "@/src/components/ui/card"
import { ArrowRight, TrendingUp, TrendingDown, Zap, Target } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export function SignalCarousel() {
  const signals = [
    {
      title: "上涨1+3策略",
      description: "捕捉强势上涨趋势，精准入场时机",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "下跌1+3策略",
      description: "识别下跌反转机会，逆势获利",
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      title: "黑马出世模型",
      description: "发现潜力币种，抓住爆发机会",
      icon: Zap,
      color: "text-yellow-600",
    },
    {
      title: "强势定价模型",
      description: "识别强势主导的价格走势，把握大机构建仓机会",
      icon: Target,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="px-6 py-8">
      <h2 className="text-slate-800 text-xl font-bold mb-6">信号策略</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
        {signals.map((signal, index) => {
          const Icon = signal.icon
          return (
            <Card key={index} className="glass-card border-white/50 min-w-[280px] flex-shrink-0">
              <CardContent className="p-5 flex flex-col items-start">
                <div className={`premium-icon w-12 h-12 rounded-xl mb-4 ${signal.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">{signal.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{signal.description}</p>
                <Button size="sm" className="diffused-button text-white border-0">
                  查看详情
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
