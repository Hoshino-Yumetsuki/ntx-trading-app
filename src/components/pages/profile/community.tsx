'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Users, UserPlus, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { UserService } from '@/src/services/user'
import { AuthService } from '@/src/services/auth'
import type { CommunityResponse, UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

interface CommunityPageProps {
  onBack: () => void
}

export default function CommunityPage({ onBack }: CommunityPageProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [userInfoLoading, setUserInfoLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [communityData, setCommunityData] = useState<CommunityResponse>({
    communityUserCount: 0,
    directInviteCount: 0,
    communityUsers: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = AuthService.getToken()
        if (!token) {
          toast.error(t('common.pleaseLoginToView'))
          setCommunityData({
            communityUserCount: 0,
            directInviteCount: 0,
            communityUsers: []
          })
          return
        }
        const data = await UserService.getMyTeams()
        setCommunityData(data)
      } catch (err: any) {
        console.error('Failed to fetch community data:', err)
        toast.error(err?.message || t('profile.community.fetchFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setUserInfoLoading(true)
        const token = AuthService.getToken()
        if (!token) return

        const data = await UserService.getUserInfo()
        setUserInfo(data)
      } catch (err: any) {
        console.error('Failed to fetch user info:', err)
      } finally {
        setUserInfoLoading(false)
      }
    }
    fetchUserInfo()
  }, [])

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-12 pb-2 relative z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative w-28 h-9 md:w-32 md:h-10">
            <Image
              src="/logo.png"
              alt="NTX Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="px-6">
        <div className="relative mb-6 rounded-[16pt] overflow-visible">
          <div className="relative h-28">
            <div className="relative z-10 h-full flex items-center pl-1 pr-40">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">
                  {t('profile.community.title')}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {t('profile.community.subtitle') || t('profile.community.title')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-white/30 rounded-[16pt]">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 text-xs mb-1">
                {t('profile.community.communityUsers')}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {communityData.communityUserCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/30 rounded-[16pt]">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-slate-500 text-xs mb-1">
                {t('profile.community.directInviteUsers')}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {communityData.directInviteCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Inviter Section */}
      <div className="px-6 mb-6">
        <Card className="glass-card border-white/30 rounded-[16pt]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-slate-800">
                {t('profile.community.myInviter')}
              </h2>
            </div>

            {userInfoLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : userInfo?.invitedBy ? (
              <div className="flex items-center p-3 bg-slate-50/80 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium truncate">
                    {userInfo.invitedBy}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {t('profile.community.inviteCode')}: {userInfo.myInviteCode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-6">
                {t('profile.community.noInviter')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community Members Section */}
      <div className="px-6">
        <Card className="glass-card border-white/30 rounded-[16pt]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-800">
                {t('profile.community.communityUsers')}
              </h2>
              <span className="text-xs text-slate-400 ml-auto">
                {communityData.communityUsers.length} {t('profile.community.members') || '人'}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : communityData.communityUsers.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {communityData.communityUsers.map((user) => (
                  <div
                    key={`${user.email}-${user.id}`}
                    className="flex items-center p-3 bg-slate-50/80 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-3 shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {(user.nickname || user.email || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-800 font-medium truncate">
                          {user.nickname || user.email}
                        </p>
                        {user.isDirectInvite && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-[10px] rounded font-medium shrink-0">
                            {t('profile.community.directInvite') || '直邀'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-slate-400 mt-0.5">
                        <span className="truncate">UID: {user.id}</span>
                        {user.joined_at && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span className="truncate">
                              {new Date(user.joined_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-10">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>{t('profile.community.noCommunityUsers')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
