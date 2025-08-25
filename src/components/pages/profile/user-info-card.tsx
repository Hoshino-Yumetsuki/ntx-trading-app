'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import type { UserInfo } from '@/src/types/user'
import Image from 'next/image'

interface UserInfoCardProps {
  userInfo: UserInfo | null
}

export function UserInfoCard({ userInfo }: UserInfoCardProps) {
  const gntx = userInfo?.gntxBalance ?? 0
  const invites = userInfo?.invitedUserCount ?? 0
  const gProgress = Math.min(gntx / 1, 1)
  const iProgress = Math.min(invites / 100, 1)
  const brokerProgress = Math.min(gProgress, iProgress)
  const brokerPercent = Math.floor(brokerProgress * 100)
  const remainingGntx = Math.max(0, 1 - gntx)
  const remainingInvites = Math.max(0, 100 - invites)

  return (
    <Card className="glass-card border-white/30 relative rounded-[16pt]">
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
          <div className="text-sm text-slate-700">
            已邀请人数：
            <span className="text-blue-600">
              {(userInfo?.invitedUserCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 经验和用户组 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[16pt] p-4">
          {/* 经验值显示已移除 */}

          {/* 距离成为经纪商 */}
          <div className="mt-4">
            <div className="text-sm text-slate-700 mb-1">距离成为经纪商：</div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${brokerPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {brokerPercent}% 完成
            </div>
            <div className="text-xs text-slate-600 mt-1 text-right">
              <div>
                还需要{' '}
                <span className="text-blue-600">
                  {remainingGntx.toLocaleString(undefined, {
                    maximumFractionDigits: 4
                  })}
                </span>{' '}
                GNTX
              </div>
              <div>
                还需要邀请{' '}
                <span className="text-blue-600">
                  {remainingInvites.toLocaleString()}
                </span>{' '}
                人
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
