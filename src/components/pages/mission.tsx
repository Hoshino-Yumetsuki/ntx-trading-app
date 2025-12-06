'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  ArrowLeft,
  Gift,
  Loader2,
  Share2,
  Video,
  Users,
  CreditCard,
  UserPlus
} from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'
import { type Mission, MissionService } from '@/src/services/mission'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { processText } from '@/src/utils/apiLocaleProcessor'

interface MissionPageProps {
  onNavigate?: (page: string) => void
}

export function MissionPage({ onNavigate }: MissionPageProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<number | null>(null)

  // 包装 processText，绑定当前语言
  const localProcessText = useCallback(
    (text: string) => processText(text, language),
    [language]
  )

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true)
      const data = await MissionService.getMissionList()
      setMissions(data)
    } catch (error) {
      console.error('Failed to fetch missions:', error)
      toast.error(t('mission.error.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const handleClaim = async (mission: Mission) => {
    if (claimingId) return
    try {
      setClaimingId(mission.id)
      const res = await MissionService.claimReward(mission.id)
      toast.success(res.message || t('mission.success.claimed'))
      // Refresh list to update status
      fetchMissions()
    } catch (error: any) {
      toast.error(error.message || t('mission.error.claimFailed'))
    } finally {
      setClaimingId(null)
    }
  }

  const _handleAction = async (mission: Mission) => {
    // Report action if needed
    if (mission.task_type === 'DAILY_SHARE') {
      MissionService.reportAction('daily_share')
      // Simulate share or just inform user? Prompt says "don't tell user".
      // But maybe we should open a share sheet if possible?
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'NTX Trading',
            text: 'Come join me on NTX Trading!',
            url: window.location.origin
          })
        } catch (_e) {
          // ignore share error
        }
      }
    } else if (mission.task_type === 'DAILY_LIVE') {
      MissionService.reportAction('daily_live')
      // Redirect to live page if exists? For now just report.
      // Maybe redirect to Academy -> Loop (Live)?
      // router.push('/?tab=academy')
      // But "Academy -> Loop" is deep linking.
      // Let's just report for now.
    }

    // Navigation for other tasks
    if (mission.task_type === 'REGISTER') {
      // Already registered if seeing this?
    } else if (mission.task_type === 'BIND_EXCHANGE') {
      // Open bind dialog? Or go to mining page?
      // Since we are in a standalone page, we might need to use router or onNavigate
      // onNavigate is passed from MainApp usually.
      // But we are not sure if MissionPage will be used inside MainApp structure or standalone.
      // If it is used as a tab component, it gets onNavigate.
    }

    // Refresh to see if progress updated (though server might not update immediately for some types)
    setTimeout(fetchMissions, 1000)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'REGISTER':
        return <UserPlus className="w-6 h-6 text-blue-500" />
      case 'BIND_EXCHANGE':
        return <CreditCard className="w-6 h-6 text-purple-500" />
      case 'REFERRAL_COUNT':
      case 'TEAM_SIZE':
        return <Users className="w-6 h-6 text-orange-500" />
      case 'DAILY_LIVE':
        return <Video className="w-6 h-6 text-red-500" />
      case 'DAILY_SHARE':
        return <Share2 className="w-6 h-6 text-green-500" />
      default:
        return <Gift className="w-6 h-6 text-blue-500" />
    }
  }

  const getButton = (mission: Mission) => {
    // 已领取：灰色禁用状态
    if (mission.status === 'CLAIMED') {
      return (
        <Button
          disabled
          variant="secondary"
          className="w-24 bg-slate-100 text-slate-400"
        >
          {t('mission.status.claimed')}
        </Button>
      )
    }

    // 已完成：显示领取奖励按钮
    if (mission.status === 'COMPLETED') {
      return (
        <Button
          onClick={() => handleClaim(mission)}
          disabled={claimingId === mission.id}
          className="w-24 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
        >
          {claimingId === mission.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t('mission.status.claim')
          )}
        </Button>
      )
    }

    // 未完成（IN_PROGRESS / NOT_STARTED）：统一显示待完成，禁用状态
    return (
      <Button
        disabled
        variant="outline"
        className="w-24 border-slate-200 text-slate-400 bg-slate-50"
      >
        {t('mission.status.pending')}
      </Button>
    )
  }

  const activeMissions = missions.filter((m) => m.status !== 'CLAIMED')
  const claimedMissions = missions.filter((m) => m.status === 'CLAIMED')

  const renderMissionCard = (mission: Mission) => (
    <Card
      key={mission.id}
      className="border-none shadow-sm bg-white rounded-xl overflow-hidden mb-4"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-1">
              {getIcon(mission.task_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 truncate">
                  {localProcessText(mission.name)}
                </h3>
                {mission.is_daily && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded font-medium">
                    {t('mission.daily')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {localProcessText(mission.description)}
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center text-sm font-medium text-orange-500">
                  <span className="text-xs mr-1">{t('mission.reward')}</span>
                  {mission.reward_amount}{' '}
                  <span className="text-[10px] ml-0.5">NTX</span>
                </div>
                {mission.condition_value > 1 &&
                  mission.progress < mission.condition_value &&
                  mission.status !== 'COMPLETED' &&
                  mission.status !== 'CLAIMED' && (
                    <div className="text-xs text-slate-400">
                      {t('mission.progress')}: {mission.progress} /{' '}
                      {mission.condition_value}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center min-h-[60px]">
            {getButton(mission)}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen pb-6 bg-slate-50/50">
      <div className="px-4 pt-8 pb-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onNavigate) onNavigate('home')
                else router.push('/')
              }}
              className="mr-2 text-slate-600 hover:text-slate-800 -ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-slate-800">
              {t('mission.title')}
            </h1>
          </div>
          <div className="relative w-24 h-8">
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

      <div className="px-4 mt-6 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>{t('mission.loading')}</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Gift className="w-12 h-12 mb-2 opacity-20" />
            <p>{t('mission.empty')}</p>
          </div>
        ) : (
          <>
            {/* 未完成/可领取的部分 */}
            {activeMissions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-500 mb-3 px-1">
                  {t('mission.section.active')}
                </h2>
                {activeMissions.map(renderMissionCard)}
              </div>
            )}

            {/* 已完成/已领取的部分 */}
            {claimedMissions.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-500 mb-3 px-1">
                  {t('mission.section.completed')}
                </h2>
                {claimedMissions.map(renderMissionCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
