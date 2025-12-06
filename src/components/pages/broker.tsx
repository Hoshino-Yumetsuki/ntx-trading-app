'use client'

import { useEffect, useState, useId } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import { AcademyMarkdownReader } from '@/src/components/pages/academy/academy-reader'
import type {
  Course,
  CoursePackage,
  CreateOrderResponse
} from '@/src/types/course'
import {
  getAllCourses,
  getPermissionGroups
} from '@/src/services/courseService'
import { createOrder } from '@/src/services/payment'
import { processCourses } from '@/src/utils/courseUtils'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Loader2,
  ShoppingCart,
  ExternalLink,
  Copy
} from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { useLanguage } from '@/src/contexts/language-context'
import { processText } from '@/src/utils/apiLocaleProcessor'

export function BrokerPage({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const packagesAnchorId = useId()
  const [unlocked, setUnlocked] = useState<Course[]>([])
  const [locked, setLocked] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState<Course | null>(null)
  const [pkgLoading, setPkgLoading] = useState(true)
  const [pkgError, setPkgError] = useState('')
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<CreateOrderResponse | null>(
    null
  )
  const [derivedGroups, setDerivedGroups] = useState<
    Array<{
      key: string
      groupId?: number
      groupName: string
      groupDescription?: string
      packages: CoursePackage[]
    }>
  >([])

  // 包装 processText，绑定当前语言
  const localProcessText = (text: string) => processText(text, language)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllCourses()
        const { unlockedCourses, lockedCourses } = processCourses(
          data,
          'broker'
        )
        setUnlocked(unlockedCourses)
        setLocked(lockedCourses)
      } catch (e: any) {
        setError(e.message || t('broker.error.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPkgLoading(true)
        setPkgError('')
        const [courses, allGroups] = await Promise.all([
          getAllCourses(),
          getPermissionGroups()
        ])
        const list: Array<{
          key: string
          groupId?: number
          groupName: string
          groupDescription?: string
          packages: CoursePackage[]
        }> = []

        for (const c of courses) {
          if (c?.course_type !== 'broker') continue
          if (c?.isUnlocked || !Array.isArray(c?.required_groups)) continue

          const pkgMap = new Map<number, CoursePackage>()
          let desc: string | undefined

          for (const rg of c.required_groups) {
            const hasId = typeof rg?.id === 'number'
            const matched = allGroups.find((g) =>
              hasId ? g.group.id === rg?.id : g.group.name === rg?.name
            )
            if (!matched) continue
            if (!desc && matched.group?.description)
              desc = matched.group.description
            for (const p of matched.packages ?? []) {
              pkgMap.set(p.id, p)
            }
          }

          const pkgs = Array.from(pkgMap.values())
          if (pkgs.length > 0) {
            list.push({
              key: `course:${c.id}`,
              groupName: c.name,
              groupDescription: c.description || desc,
              packages: pkgs
            })
          }
        }

        setDerivedGroups(list)
      } catch (e: any) {
        setPkgError(e.message || t('broker.error.loadPackagesFailed'))
      } finally {
        setPkgLoading(false)
      }
    }
    fetchPackages()
  }, [])

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
      alert(e.message || t('broker.error.createOrderFailed'))
    } finally {
      setCreatingOrder(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (_) {}
  }

  const featured = unlocked[0] || locked[0]

  const handleClick = (c: Course) => {
    if (c.link) {
      window.open(c.link, '_blank', 'noopener,noreferrer')
      return
    }
    if (!c.isUnlocked) {
      const anchor = document.getElementById(packagesAnchorId)
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (c.content) setViewing(c)
  }

  if (viewing?.content) {
    return (
      <AcademyMarkdownReader
        title={viewing.name}
        content={viewing.content}
        onBack={() => setViewing(null)}
      />
    )
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (onBack ? onBack() : router.back())}
              className="mr-3 text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </Button>
            <div className="relative mb-0.5 w-28 h-9 md:w-32 md:h-10">
              <Image
                src="/logo.png"
                alt="NTX Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <div
          className="relative overflow-hidden rounded-2xl h-32 p-5 text-white"
          style={{
            backgroundImage: "url('/academy-bg.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="flex items-center h-full">
            <div>
              <div className="text-2xl font-bold mb-1">{t('broker.banner.title')}</div>
              <div className="opacity-90">{t('broker.banner.subtitle')}</div>
            </div>
          </div>
        </div>
      </div>

      <div id={packagesAnchorId} className="px-6 mt-6">
        <Card className="glass-card border-white/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-800 text-xl font-bold">
              {t('broker.section.purchasePackage')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/orders')}
              className="text-slate-600 hover:text-slate-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" /> {t('common.orderList')}
            </Button>
          </CardHeader>
          <CardContent className="pb-6">
            {pkgLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-slate-600">{t('common.loading.packages')}</span>
              </div>
            ) : pkgError ? (
              <div className="text-center py-6">
                <p className="text-red-500">{pkgError}</p>
              </div>
            ) : derivedGroups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-600">{t('broker.noPackages')}</p>
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
                        {localProcessText(g.groupName)}
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
                                {t('common.price')}{p.price} {p.currency}
                              </div>
                              {(p.description || g.groupDescription) && (
                                <div className="text-xs text-slate-500 mt-1 whitespace-normal wrap-break-word">
                                  {localProcessText(p.description ?? g.groupDescription ?? '')}
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
                                  <ShoppingCart className="w-4 h-4 mr-2" /> {t('common.purchase')}
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
      </div>

      <div className="px-6 mt-6">
        <Card className="glass-card border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              {t('broker.section.materials')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {loading ? (
              <div className="text-center text-slate-600 py-10">{t('common.loading.default')}</div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
              featured && (
                <Card className="glass-card border-white/30 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-slate-800 font-semibold mb-1 line-clamp-1">
                          {localProcessText(featured.name)}
                        </div>
                        <div className="text-slate-600 text-sm line-clamp-2">
                          {localProcessText(featured.description)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleClick(featured)}
                        className={
                          featured.isUnlocked
                            ? 'shrink-0 bg-blue-600 hover:bg-blue-700 text-white'
                            : 'shrink-0 bg-gray-200 text-gray-500 cursor-not-allowed'
                        }
                        disabled={!featured.isUnlocked}
                      >
                        {featured.isUnlocked ? t('common.view') : t('common.locked')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payment.dialog.title')}</DialogTitle>
            <DialogDescription>{t('payment.dialog.description')}</DialogDescription>
          </DialogHeader>
          {paymentInfo && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">{t('payment.address')}</div>
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
                <div className="text-xs text-amber-700 mb-1">{t('payment.amount')}</div>
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
                <p>{t('payment.notice.amount')}</p>
                <p>{t('payment.notice.confirmation')}</p>
                <p>{t('payment.notice.contact')}{paymentInfo.orderId}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setPaymentOpen(false)
                    router.push('/orders')
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> {t('common.viewOrder')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentOpen(false)}
                >
                  {t('common.understood')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
