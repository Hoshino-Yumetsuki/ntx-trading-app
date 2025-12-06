'use client'

import { useEffect, useState, useId } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/src/components/ui/dialog'
import {
  Loader2,
  ShoppingCart,
  ExternalLink,
  Copy,
  Lock,
  BookOpen,
  BadgeCheck
} from 'lucide-react'
import {
  getPermissionGroups,
  getAllCourses
} from '@/src/services/courseService'
import { createOrder } from '@/src/services/payment'
import type { CoursePackage, CreateOrderResponse } from '@/src/types/course'
import { useAuth } from '@/src/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/src/contexts/language-context'
import { processLocaleString } from '@/src/utils/apiLocaleProcessor'

export function UnlockCoursesPage({
  onNavigateTab,
  hideInfoCards = false,
  hideDescription = false
}: {
  onNavigateTab?: (tabId: string) => void
  showHiddenOnly?: boolean
  hideInfoCards?: boolean
  hideDescription?: boolean
}) {
  const { t, language } = useLanguage()
  const packagesSectionId = useId()
  const [derivedGroups, setDerivedGroups] = useState<
    Array<{
      key: string
      groupId?: number
      groupName: string
      groupDescription?: string
      packages: CoursePackage[]
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<CreateOrderResponse | null>(
    null
  )

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const [courses, allGroups] = await Promise.all([
          getAllCourses(),
          getPermissionGroups()
        ])

        const byKey = new Map<
          string,
          {
            key: string
            groupId?: number
            groupName: string
            groupDescription?: string
            packages: CoursePackage[]
          }
        >()
        for (const c of courses) {
          if (c?.course_type === 'broker') continue
          if (c?.isUnlocked || !Array.isArray(c?.required_groups)) continue
          for (const rg of c.required_groups) {
            const hasId = typeof rg?.id === 'number'
            const key = hasId
              ? `id:${rg?.id}`
              : rg?.name
                ? `name:${rg?.name}`
                : ''
            if (!key) continue
            if (!byKey.has(key)) {
              const matched = allGroups.find((g) =>
                hasId ? g.group.id === rg?.id : g.group.name === rg?.name
              )
              byKey.set(key, {
                key,
                groupId: hasId ? rg?.id : undefined,
                groupName: rg?.name || `权限组 ${hasId ? rg?.id : ''}`,
                groupDescription: matched?.group?.description,
                packages: matched?.packages ?? []
              })
            }
          }
        }

        setDerivedGroups(
          Array.from(byKey.values()).filter((x) => x.packages.length > 0)
        )
      } catch (e: any) {
        setError(e.message || t('academy.error.fetchPackagesFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  const handleBuy = async (packageId: number) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    try {
      setCreatingOrder(packageId)
      const res = await createOrder(packageId)
      setPaymentInfo(res)
      setPaymentOpen(true)
    } catch (e: any) {
      alert(e.message || t('academy.error.createOrderFailed'))
    } finally {
      setCreatingOrder(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_) {}
  }

  return (
    <div className="space-y-6">
      {!hideInfoCards && (
        <Card className="glass-card-strong border-white/50">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-inner">
              <Lock className="h-6 w-6 text-slate-700" />
            </div>
            <h3 className="gradient-text font-bold text-lg mb-2">
              {t('academy.unlock.title')}
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              {t('academy.unlock.subtitle')}
            </p>
            <Button
              className="diffused-button text-white font-semibold border-0 bg-linear-to-r from-fuchsia-500 to-indigo-500 hover:shadow-lg"
              onClick={() => {
                const el = document.getElementById(packagesSectionId)
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {t('academy.unlock.cta')}
            </Button>
          </CardContent>
        </Card>
      )}

      {!hideInfoCards && (
        <Card className="glass-card border-white/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-slate-800 font-semibold">
                {t('academy.unlock.includes.title')}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h5 className="text-slate-800 font-medium text-sm">
                    {t('academy.unlock.includes.system.title')}
                  </h5>
                  <p className="text-slate-600 text-xs">
                    {t('academy.unlock.includes.system.desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h5 className="text-slate-800 font-medium text-sm">
                    {t('academy.unlock.includes.tools.title')}
                  </h5>
                  <p className="text-slate-600 text-xs">
                    {t('academy.unlock.includes.tools.desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h5 className="text-slate-800 font-medium text-sm">
                    {t('academy.unlock.includes.cases.title')}
                  </h5>
                  <p className="text-slate-600 text-xs">
                    {t('academy.unlock.includes.cases.desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h5 className="text-slate-800 font-medium text-sm">
                    {t('academy.unlock.includes.support.title')}
                  </h5>
                  <p className="text-slate-600 text-xs">
                    {t('academy.unlock.includes.support.desc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div id={packagesSectionId} className="mt-2" />
      <Card className="glass-card border-white/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-800 text-xl font-bold">
            {t('academy.unlock.packages.title')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab?.('orders')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ExternalLink className="w-4 h-4 mr-1" />{' '}
            {t('academy.unlock.packages.list')}
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-600">
                {t('academy.unlock.packages.loading')}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : derivedGroups.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600">
                {t('academy.unlock.packages.noData')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {derivedGroups.map((g) => (
                <Card
                  key={g.key}
                  className="glass-card border-white/30 overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-800 text-base">
                      {processLocaleString(g.groupName, language)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3">
                      {g.packages.map((p: CoursePackage) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-slate-800 font-medium">
                              {p.duration_days > 10000
                                ? t('common.permanent')
                                : `${p.duration_days} ${t('common.days')}`}
                            </div>
                            <div className="text-sm text-slate-600">
                              {t('common.price')} {p.price} {p.currency}
                            </div>
                            {!hideDescription &&
                              (p.description || g.groupDescription) && (
                                <div className="text-xs text-slate-500 mt-1 whitespace-normal wrap-break-word">
                                  {processLocaleString(p.description ?? g.groupDescription ?? '', language)}
                                </div>
                              )}
                          </div>
                          <Button
                            className="min-w-24 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleBuy(p.id)}
                            disabled={creatingOrder === p.id}
                          >
                            {creatingOrder === p.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('common.ordering')}
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />{' '}
                                {t('common.buy')}
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!hideInfoCards && (
        <Card className="glass-card border-white/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
                <BadgeCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <h4 className="text-slate-800 font-semibold">
                {t('academy.unlock.benefits.title')}
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-lg bg-linear-to-r from-fuchsia-600 to-purple-700 text-white shadow-sm">
                <h5 className="font-medium text-sm mb-1">
                  {t('academy.unlock.benefits.vipGroup.title')}
                </h5>
                <p className="text-xs text-white/90">
                  {t('academy.unlock.benefits.vipGroup.desc')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-sm">
                <h5 className="font-medium text-sm mb-1">
                  {t('academy.unlock.benefits.guidance.title')}
                </h5>
                <p className="text-xs text-white/90">
                  {t('academy.unlock.benefits.guidance.desc')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-sm">
                <h5 className="font-medium text-sm mb-1">
                  {t('academy.unlock.benefits.updates.title')}
                </h5>
                <p className="text-xs text-white/90">
                  {t('academy.unlock.benefits.updates.desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('academy.unlock.payment.title')}</DialogTitle>
            <DialogDescription>
              {t('academy.unlock.payment.desc')}
            </DialogDescription>
          </DialogHeader>
          {paymentInfo && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">
                  {t('academy.unlock.payment.address')}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm break-all font-mono text-blue-900">
                    {paymentInfo.paymentAddress}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentInfo.paymentAddress)}
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> {t('common.copy')}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">
                  {t('academy.unlock.payment.amount')}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-amber-900">
                    {paymentInfo.paymentAmount} {paymentInfo.currency}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${paymentInfo.paymentAmount} ${paymentInfo.currency}`
                      )
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> {t('common.copy')}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>{t('academy.unlock.payment.notice1')}</p>
                <p>{t('academy.unlock.payment.notice2')}</p>
                <p>
                  {t('academy.unlock.payment.notice3')}
                  {paymentInfo.orderId}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setPaymentOpen(false)
                    onNavigateTab?.('orders')
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />{' '}
                  {t('common.viewOrder')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentOpen(false)}
                >
                  {t('common.known')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
