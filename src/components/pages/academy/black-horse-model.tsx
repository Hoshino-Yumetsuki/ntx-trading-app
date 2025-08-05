'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { TrendingUp } from 'lucide-react'

export function BlackHorseModelPage() {
  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            黑马模型
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="premium-icon w-16 h-16 rounded-lg mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-slate-800 font-semibold text-lg mb-2">
              黑马模型即将上线
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              我们正在开发全新的黑马模型系统，敬请期待更多精彩内容。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
