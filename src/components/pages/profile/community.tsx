'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { UserService } from '@/src/services/user'
import { AuthService } from '@/src/services/auth'
import type { TeamMember } from '@/src/types/user'

interface CommunityPageProps {
  onBack: () => void
}

export default function CommunityPage({ onBack }: CommunityPageProps) {
  const [loading, setLoading] = useState(true)
  const [invitedUsers, setInvitedUsers] = useState<TeamMember[]>([])

  const totalCommunityUsers = invitedUsers.length
  // 后端暂无交易用户数量，按 Vue 逻辑与社区用户一致（或根据业务改为 0）
  const totalTradingUsers = invitedUsers.length

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // token 校验，避免无效请求
        const token = AuthService.getToken()
        if (!token) {
          toast.error('请先登录以查看社区信息')
          setInvitedUsers([])
          return
        }
        const data = await UserService.getMyTeams()
        setInvitedUsers(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error('获取社区数据失败:', err)
        toast.error(err?.message || '获取社区数据失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-inter antialiased">
      {/* 顶部应用栏 */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10 rounded-b-xl">
        <button
          type="button"
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">我的社区</h1>
        <div className="w-6" />
      </div>

      {/* 社区总览 + 我的邀请 */}
      <div className="max-w-4xl w-full space-y-8 bg-transparent mt-8 mb-8 px-4 sm:px-6 lg:px-8">
        {/* 社区总览 */}
        <div className="flex flex-col space-y-3 bg-white p-6 rounded-[16pt] shadow-xl border border-gray-100">
          <div className="flex flex-row gap-4 bg-blue-50 rounded-[16pt] p-5 items-center justify-around border border-blue-100">
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">
                社区用户
              </span>
              <div className="text-blue-600 text-2xl leading-6 font-bold mt-1">
                {totalCommunityUsers.toLocaleString()}
              </div>
            </div>
            <div className="h-12 w-px bg-blue-200" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">
                交易用户
              </span>
              <div className="text-blue-600 text-2xl leading-6 font-bold mt-1">
                {totalTradingUsers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 我的邀请 */}
        <div className="bg-white p-6 rounded-[16pt] shadow-xl border border-gray-100">
          <div className="flex flex-row justify-between items-center mb-4 border-b pb-3 border-gray-100">
            <span className="text-gray-900 text-xl font-bold">我的邀请</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 text-base py-10">
              加载中...
            </div>
          ) : invitedUsers.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {invitedUsers.map((user) => (
                <div
                  key={`${user.email}-${user.joined_at}`}
                  className="flex flex-col p-4 bg-gray-50 rounded-[16pt] border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800 font-semibold text-lg">
                      {user.nickname || user.email}
                    </span>
                    {user.id ? (
                      <span className="font-bold text-base text-blue-600">
                        UID: {user.id}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>邮箱: {user.email}</span>
                    {user.joined_at ? (
                      <span>
                        加入时间: {new Date(user.joined_at).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-base py-10">
              暂无邀请记录
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
