'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { ExternalLink, UserX, UserPlus, Copy } from 'lucide-react'
import type { Exchange, UserExchange } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'
import { toast } from 'sonner'

interface ExchangeCardProps {
  exchanges: Exchange[]
  userExchanges: UserExchange[]
  exchangesLoading: boolean
  onBindExchange: (exchangeId: number, uid: string) => void
  onUnbindExchange: (exchangeId: number) => void
}

export function ExchangeCard({
  exchanges,
  userExchanges,
  exchangesLoading,
  onBindExchange,
  onUnbindExchange
}: ExchangeCardProps) {
  const { t } = useLanguage()
  const [bindingExchangeId, setBindingExchangeId] = useState<number | null>(
    null
  )
  const [uid, setUid] = useState('')
  const [isBindDialogOpen, setIsBindDialogOpen] = useState(false)
  const [isBindRequiredDialogOpen, setIsBindRequiredDialogOpen] =
    useState(false)

  const getUrls = (
    cexUrl: string | undefined
  ): { miningUrl: string; registerUrl: string; inviteCode: string } => {
    if (!cexUrl) {
      return { miningUrl: '#', registerUrl: '#', inviteCode: '' }
    }
    try {
      const firstScheme = cexUrl.indexOf('://')
      const secondScheme = cexUrl.indexOf('://', firstScheme + 3)
      if (firstScheme !== -1 && secondScheme !== -1) {
        const sep = cexUrl.lastIndexOf(':', secondScheme - 1)
        const normalizeUrl = (u: string) => {
          let s = u.trim()
          if (!s) return s
          if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return s
          s = s.replace(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/(?!\/)/, '$1://')
          if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return s
          s = s.replace(/^:\/+/, '')
          if (/^\/\//.test(s)) return `https:${s}`
          s = s.replace(/^\/+/, '')
          return `https://${s}`
        }

        const miningUrl = normalizeUrl(cexUrl.slice(0, sep))
        const rest = cexUrl.slice(sep + 1)
        const schemeIdx = rest.indexOf('://')
        const afterScheme = schemeIdx >= 0 ? schemeIdx + 3 : 0
        const codeSep = rest.indexOf(':', afterScheme)
        if (codeSep !== -1) {
          const registerUrl = normalizeUrl(rest.slice(0, codeSep))
          const inviteCode = rest.slice(codeSep + 1)
          return { miningUrl, registerUrl, inviteCode }
        }
        return { miningUrl, registerUrl: normalizeUrl(rest), inviteCode: '' }
      }
    } catch (_e) {}

    try {
      const normalizeUrl = (u: string) => {
        let s = u.trim()
        if (!s) return s
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return s
        s = s.replace(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/(?!\/)/, '$1://')
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return s
        s = s.replace(/^:\/+/, '')
        if (/^\/\//.test(s)) return `https:${s}`
        s = s.replace(/^\/+/, '')
        return `https://${s}`
      }
      const single = normalizeUrl(cexUrl)
      const url = new URL(single)
      const possibleParams = ['code', 'invite', 'inviteCode', 'ref', 'referral']
      let inviteCode = ''
      for (const p of possibleParams) {
        const v = url.searchParams.get(p)
        if (v) {
          inviteCode = v
          break
        }
      }
      return { miningUrl: single, registerUrl: single, inviteCode }
    } catch (_e) {
      return { miningUrl: cexUrl, registerUrl: cexUrl, inviteCode: '' }
    }
  }

  const handleBindClick = (exchangeId: number) => {
    setBindingExchangeId(exchangeId)
    setUid('')
    setIsBindDialogOpen(true)
  }

  const handleBindConfirm = () => {
    if (bindingExchangeId && uid.trim()) {
      onBindExchange(bindingExchangeId, uid.trim())
      setIsBindDialogOpen(false)
      setBindingExchangeId(null)
      setUid('')
    }
  }

  const handleUnbind = (exchangeId: number) => {
    onUnbindExchange(exchangeId)
  }

  return (
    <>
      <div className="flex flex-col">
        {exchangesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-xl animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-36" />
              </div>
            ))}
          </div>
        ) : exchanges.length > 0 ? (
          exchanges.map((exchange) => {
            const isUserBound = userExchanges.some(
              (ue) => ue.id === exchange.id
            )
            const { miningUrl } = getUrls(exchange.cex_url)
            return (
              <div
                key={exchange.id}
                className="flex items-center justify-between gap-3 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    {exchange.logo_url ? (
                      <Image
                        src={exchange.logo_url}
                        alt={exchange.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain rounded-full"
                      />
                    ) : (
                      <span className="text-slate-700 text-sm font-bold">
                        {exchange.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-slate-800 font-semibold text-base truncate">
                      {exchange.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {t('mining.exchange.efficiency')}:{' '}
                      {exchange.mining_efficiency.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (isUserBound) {
                        window.open(miningUrl, '_blank')
                      } else {
                        setBindingExchangeId(exchange.id)
                        setIsBindRequiredDialogOpen(true)
                      }
                    }}
                    className="h-8 px-3 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t('mining.exchange.goMining')}
                  </Button>

                  {isUserBound ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUnbind(exchange.id)}
                      className="h-8 px-3 text-xs"
                    >
                      <UserX className="w-3 h-3 mr-1" />
                      {t('mining.exchange.unbind')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleBindClick(exchange.id)}
                      className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      {t('mining.exchange.bind')}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {t('mining.exchange.noExchanges')}
            </p>
            <p className="text-sm text-gray-400">
              {t('mining.exchange.tryLater')}
            </p>
          </div>
        )}
      </div>

      {/* 绑定交易所弹窗 - 使用 Portal 渲染到 body */}
      {isBindDialogOpen && bindingExchangeId && typeof document !== 'undefined' && (() => {
        const exchange = exchanges.find((e) => e.id === bindingExchangeId)
        if (!exchange) return null
        const { registerUrl, inviteCode } = getUrls(exchange.cex_url)

        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 背景遮罩 */}
            <div
              role="button"
              tabIndex={0}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsBindDialogOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsBindDialogOpen(false)
                }
              }}
            />

            {/* 弹窗容器 */}
            <div className="relative z-10 w-full max-w-sm max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* 头部 */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {exchange.logo_url ? (
                    <Image
                      src={exchange.logo_url}
                      alt={exchange.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-700 text-xs font-bold">
                      {exchange.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm">{exchange.name}</div>
                  <div className="text-slate-500 text-xs truncate">{t('mining.exchange.bindSteps')}</div>
                </div>
                <div className="bg-blue-50 rounded-lg px-2 py-1 text-center flex-shrink-0">
                  <div className="text-[10px] text-blue-600">{t('mining.exchange.efficiency')}</div>
                  <div className="text-sm font-bold text-blue-600">{exchange.mining_efficiency.toFixed(2)}%</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBindDialogOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  <span className="text-slate-400 text-lg">×</span>
                </button>
              </div>

              {/* 可滚动内容区 */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
                {/* 步骤1 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-[#1C55FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <span className="font-medium text-sm text-slate-800">{t('mining.exchange.step1')}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => window.open(registerUrl, '_blank')}
                    className="w-full bg-[#1C55FF] hover:bg-[#1C55FF]/90 text-white h-9 rounded-lg text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('mining.exchange.goRegister')}
                  </Button>
                  {inviteCode && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">{t('mining.exchange.inviteCode')}</div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm font-semibold text-slate-800">{inviteCode}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteCode)
                            toast.success(t('mining.exchange.inviteCodeCopied'))
                          }}
                          className="h-6 px-2 text-xs text-[#1C55FF] hover:text-[#1C55FF]/80 hover:bg-blue-50"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {t('common.copy')}
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-orange-500 mt-1.5">⚠️ {t('mining.exchange.registerWarning')}</p>
                </div>

                {/* 步骤2 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-[#1C55FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <span className="font-medium text-sm text-slate-800">{t('mining.exchange.step2')}</span>
                  </div>
                  <Input
                    placeholder={t('mining.exchange.uidPlaceholder')}
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="w-full h-9 text-sm rounded-lg"
                  />
                  <p className="text-[11px] text-orange-500 mt-1.5">⚠️ {t('mining.exchange.uidWarning')}</p>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="flex gap-2 p-4 pt-3 border-t border-slate-100 flex-shrink-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBindDialogOpen(false)}
                  className="flex-1 h-9 rounded-lg text-sm text-slate-600 border-slate-200"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleBindConfirm}
                  disabled={!uid.trim()}
                  className="flex-1 h-9 rounded-lg text-sm bg-[#1C55FF] hover:bg-[#1C55FF]/90 text-white"
                >
                  {t('mining.exchange.bind')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      })()}

      {/* 需要绑定交易所提示弹窗 */}
      {isBindRequiredDialogOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div
            role="button"
            tabIndex={0}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsBindRequiredDialogOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsBindRequiredDialogOpen(false)
              }
            }}
          />

          {/* 弹窗容器 */}
          <div className="relative z-10 w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={() => setIsBindRequiredDialogOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <span className="text-slate-400 text-lg">×</span>
            </button>

            {/* 内容 */}
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-[#1C55FF]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {t('mining.exchange.bindRequired')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('mining.exchange.bindRequiredDesc')}
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 px-6 pb-6">
              <Button
                onClick={() => setIsBindRequiredDialogOpen(false)}
                variant="outline"
                className="flex-1 h-10 rounded-xl text-sm text-slate-600 border-slate-200"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => {
                  setIsBindRequiredDialogOpen(false)
                  if (bindingExchangeId !== null) {
                    handleBindClick(bindingExchangeId)
                  }
                }}
                className="flex-1 h-10 rounded-xl text-sm bg-[#1C55FF] hover:bg-[#1C55FF]/90 text-white"
              >
                {t('mining.exchange.bind')}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
