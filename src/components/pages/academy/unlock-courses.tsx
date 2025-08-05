'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'

export function UnlockCoursesPage() {
  return (
    <div className="space-y-6">
      <Card className="glass-card-strong border-white/50">
        <CardContent className="p-6 text-center">
          <h3 className="gradient-text font-bold text-lg mb-2">解锁完整课程</h3>
          <p className="text-slate-600 text-sm mb-4">
            程序化辅助工具：学员专属【筛选系统】，落地模型应用
          </p>
          <Button className="diffused-button text-white font-semibold border-0">
            获得机构级策略
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/30">
        <CardContent className="p-6">
          <h4 className="text-slate-800 font-semibold mb-4">课程包含内容</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  完整交易系统
                </h5>
                <p className="text-slate-600 text-xs">
                  包含入场、止损、止盈的完整交易决策框架
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  专属筛选工具
                </h5>
                <p className="text-slate-600 text-xs">
                  学员专属的程序化筛选系统，快速发现优质标的
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  实战案例分析
                </h5>
                <p className="text-slate-600 text-xs">
                  真实市场案例解析，理论与实践相结合
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h5 className="text-slate-800 font-medium text-sm">
                  持续更新支持
                </h5>
                <p className="text-slate-600 text-xs">
                  根据市场变化持续更新策略和工具
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/30">
        <CardContent className="p-6">
          <h4 className="text-slate-800 font-semibold mb-4">学员专享权益</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h5 className="text-blue-800 font-medium text-sm mb-1">
                VIP交流群
              </h5>
              <p className="text-blue-600 text-xs">
                与导师和优秀学员直接交流，分享交易心得
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h5 className="text-purple-800 font-medium text-sm mb-1">
                一对一指导
              </h5>
              <p className="text-purple-600 text-xs">
                针对个人交易问题提供专业指导建议
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <h5 className="text-green-800 font-medium text-sm mb-1">
                实时策略更新
              </h5>
              <p className="text-green-600 text-xs">
                第一时间获取最新的市场策略和信号提醒
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
