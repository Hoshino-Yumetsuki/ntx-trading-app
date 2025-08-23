'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Award } from 'lucide-react'
import type { UserInfo } from '@/src/types/user'
import Image from 'next/image'

interface UserInfoCardProps {
  userInfo: UserInfo | null
}

export function UserInfoCard({ userInfo }: UserInfoCardProps) {
  return (
    <Card className="glass-card border-white/30 relative">
      {/* 右上角装饰 */}
      <Image
        src="/Frame29@3x.png"
        alt=""
        width={444}
        height={96}
        className="absolute top-0 right-0 w-[180px] h-auto opacity-80 pointer-events-none select-none"
        priority
      />

      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-slate-800 flex items-center"></CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 顶部信息：会员角色与GNTX持有 */}
        <div className="space-y-1">
          <div className="text-base font-medium text-slate-800">
            会员角色：
            <span className="text-green-600">
              {userInfo?.role || 'Normal User'}
            </span>
          </div>
          <div className="text-sm text-slate-700">
            当前 GNTX 持有：{userInfo?.gntxBalance?.toLocaleString() || '0'}
          </div>
        </div>

        {/* 经验和用户组 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex text-sm text-slate-700 mb-1">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-blue-600" />
              <span>EXP: {userInfo?.exp || 0}</span>
            </div>
          </div>
          <div className="h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${Math.min(((userInfo?.exp || 0) / 100) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
