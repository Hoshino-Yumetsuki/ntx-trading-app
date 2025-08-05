'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Target, Star } from 'lucide-react'

export function StrategySignalsPage() {
  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/50">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            机构操盘策略信号系统
          </CardTitle>
          <p className="text-slate-600 text-sm ml-11">
            基于机构行为的趋势系统+程序化工具，清晰捕捉中期趋势
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <h4 className="text-slate-800 font-semibold mb-3 flex items-center">
            <div className="premium-icon w-6 h-6 rounded mr-2">
              <Star className="w-3 h-3 text-yellow-600" />
            </div>
            信号实例展示
          </h4>

          <div className="grid gap-4">
            <div className="p-4 glass-card rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-slate-800 font-medium">趋势确认信号</h5>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  多头
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                基于多周期共振原理，识别主力资金流向和趋势确立点位
              </p>
            </div>

            <div className="p-4 glass-card rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-slate-800 font-medium">风险控制信号</h5>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  警告
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                实时监控市场风险变化，提供精准的止损和减仓建议
              </p>
            </div>

            <div className="p-4 glass-card rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-slate-800 font-medium">机会捕捉信号</h5>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  机会
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                识别市场回调中的优质买入机会，把握最佳入场时机
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
