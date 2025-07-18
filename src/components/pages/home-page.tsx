'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  TrendingUp,
  Zap,
  ArrowRight,
  Target,
  Award,
  Pickaxe,
  GraduationCap,
  BookOpen,
  Brain,
  Mic
} from 'lucide-react'
import { SignalCarousel } from '@/src/components/signal-carousel'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">NTX</h1>
            <p className="text-slate-600 text-sm">交易即挖矿</p>
          </div>
          <div className="premium-icon w-10 h-10 rounded-full">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
            掌握机构操盘交易体系
            <br />
            <span className="gradient-text">提升你的交易能力</span>
          </h2>
        </div>
        <div className="space-y-3 mb-4">
          <Button className="w-full diffused-button text-white py-4 text-lg font-semibold rounded-xl border-0">
            <Pickaxe className="w-5 h-5 mr-2" />
            立即开始挖矿
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button className="w-full glass-card text-slate-700 hover:text-slate-800 py-4 text-lg font-semibold rounded-xl border-white/50 bg-white/30 hover:bg-white/40">
            <GraduationCap className="w-5 h-5 mr-2" />
            进入黑马学院
          </Button>
          <Button className="w-full glass-card text-slate-700 hover:text-slate-800 py-4 text-lg font-semibold rounded-xl border-white/50 bg-white/30 hover:bg-white/40">
            <Mic className="w-5 h-5 mr-2" />
            成为专业KOL
          </Button>
        </div>
      </div>

      <SignalCarousel />

      <div className="px-6 space-y-4">
        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  新手教程
                </h3>
                <p className="text-slate-600 text-sm">
                  快速入门，掌握平台核心功能
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              从零开始，一步步学习如何使用NTX平台进行交易挖矿和策略学习。
            </p>
            <Button size="sm" className="diffused-button text-white border-0">
              查看详情
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  机器学习预测
                </h3>
                <p className="text-slate-600 text-sm">
                  AI驱动，洞察市场未来趋势
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              利用先进的机器学习算法，为您提供精准的市场趋势预测，辅助交易决策。
            </p>
            <Button size="sm" className="diffused-button text-white border-0">
              点击试用
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  交易挖矿
                </h3>
                <p className="text-slate-600 text-sm">
                  每笔交易获得反佣和挖矿奖励
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              通过程序化工具捕捉市场信号，实现收益最大化
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  机构策略
                </h3>
                <p className="text-slate-600 text-sm">掌握机构交易思维</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              学习专业交易策略，提升交易胜率和纪律性
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">
                  持续回报
                </h3>
                <p className="text-slate-600 text-sm">让每一笔交易永远有回报</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              建立长期收益模式，实现财富稳定增长
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
