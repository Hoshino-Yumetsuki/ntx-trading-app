'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { ExternalLink, UserX, UserPlus } from 'lucide-react'
import type { Exchange, UserExchange } from '@/src/services/mining'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'

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

  // 解析官网链接和邀请链接
  const getUrls = (
    cexUrl: string | undefined
  ): { miningUrl: string; registerUrl: string } => {
    if (!cexUrl) {
      return { miningUrl: '#', registerUrl: '#' }
    }
    // 根据 "官网链接:邀请链接" 的格式来解析
    const lastHttpIndex = cexUrl.lastIndexOf('http')
    if (lastHttpIndex > 0) {
      const separatorIndex = lastHttpIndex - 1
      if (cexUrl[separatorIndex] === ':') {
        const miningUrl = cexUrl.substring(0, separatorIndex)
        const registerUrl = cexUrl.substring(lastHttpIndex)
        return { miningUrl, registerUrl }
      }
    }
    // 兼容旧的单链接格式
    return { miningUrl: cexUrl, registerUrl: cexUrl }
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
      <Card className="glass-card border-white/50">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <div className="premium-icon w-8 h-8 rounded-lg mr-3">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            {t('mining.exchangeList.title')}
          </CardTitle>
          <p className="text-slate-600 text-sm ml-11"></p>
        </CardHeader>
        <CardContent className="space-y-4">
          {exchangesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 data-card rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          ) : exchanges.length > 0 ? (
            exchanges.map((exchange, _index) => {
              const isUserBound = userExchanges.some(
                (ue) => ue.id === exchange.id
              )
              const { miningUrl } = getUrls(exchange.cex_url)
              return (
                <div
                  key={exchange.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 data-card rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                      {exchange.logo_url ? (
                        <Image
                          src={exchange.logo_url}
                          alt={exchange.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-slate-700 text-sm font-bold">
                          {exchange.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-lg">
                        {exchange.name}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {t('mining.exchange.efficiency')}:{' '}
                        {exchange.mining_efficiency.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {isUserBound ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => window.open(miningUrl, '_blank')}
                          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t('mining.exchange.goMining') || '去挖矿'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUnbind(exchange.id)}
                          className="w-full sm:w-auto px-4 py-2"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          {t('mining.exchange.unbind') || '解绑'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleBindClick(exchange.id)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        {t('mining.exchange.bind') || '绑定'}
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
        </CardContent>
      </Card>

      {/* 绑定对话框 */}
      <Dialog open={isBindDialogOpen} onOpenChange={setIsBindDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[480px] max-h-[80vh] overflow-y-auto">
          {bindingExchangeId &&
            (() => {
              const exchange = exchanges.find((e) => e.id === bindingExchangeId)
              if (!exchange) return null
              const { registerUrl } = getUrls(exchange.cex_url)

              return (
                <>
                  <DialogHeader className="text-center pb-6">
                    <div className="flex flex-col items-center space-y-4">
                      {/* 交易所图标 */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center">
                        {exchange.logo_url ? (
                          <Image
                            src={exchange.logo_url}
                            alt={exchange.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-700 text-lg font-bold">
                            {exchange.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* 交易所名称 */}
                      <DialogTitle className="text-xl font-bold text-slate-800">
                        {exchange.name}{' '}
                      </DialogTitle>

                      {/* 描述 */}
                      <DialogDescription className="text-center text-slate-600">
                        {t('mining.exchange.bindSteps') ||
                          '绑定您的交易所账户以开始挖矿。'}
                      </DialogDescription>
                    </div>
                  </DialogHeader>

                  {/* 绑定说明文案 */}
                  <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-slate-700">
                    <p className="font-medium mb-2">
                      请务必完成以下操作以开始挖矿收益：
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        打开 {exchange.name || 'HTX'} 交易所 APP/Web
                        的「个人中心」
                      </li>
                      <li>找到并复制您的 UID</li>
                      <li>回到 NTXTrade DAO，粘贴 UID 完成绑定！</li>
                    </ol>
                    <p className="mt-3 font-bold text-red-600">
                      未绑定 UID 将无法参与挖矿！
                    </p>
                  </div>

                  {/* 挖矿效率显示 */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[120px]">
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        {t('mining.exchange.efficiency') || '挖矿效率'}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {exchange.mining_efficiency.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* 第一步：注册 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <h3 className="font-semibold text-slate-800">
                          {t('mining.exchange.step1') || '第一步：通过链接注册'}
                        </h3>
                      </div>

                      <div className="ml-8 space-y-3">
                        <Button
                          type="button"
                          onClick={() => window.open(registerUrl, '_blank')}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t('mining.exchange.goRegister') || '去注册'}
                        </Button>

                        <p className="text-xs text-orange-600 flex items-start space-x-1">
                          <span>⚠️</span>
                          <span>
                            {t('mining.exchange.registerWarning') ||
                              '仅通过本链接注册的新用户可以进行绑定'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* 第二步：绑定UID */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <h3 className="font-semibold text-slate-800">
                          {t('mining.exchange.step2') ||
                            '第二步：绑定交易所UID：绑定UID'}
                        </h3>
                      </div>

                      <div className="ml-8 space-y-3">
                        <Input
                          placeholder={
                            t('mining.exchange.uidPlaceholder') ||
                            '请输入交易所UID'
                          }
                          value={uid}
                          onChange={(e) => setUid(e.target.value)}
                          className="w-full"
                        />

                        <p className="text-xs text-orange-600 flex items-start space-x-1">
                          <span>⚠️</span>
                          <span>
                            {t('mining.exchange.uidWarning') ||
                              '仅绑定通过本链接注册的交易所UID，其他UID无法参与挖矿'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBindDialogOpen(false)}
                      className="flex-1"
                    >
                      {t('common.cancel') || '取消'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleBindConfirm}
                      disabled={!uid.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t('mining.exchange.bind') || '绑定'}
                    </Button>
                  </DialogFooter>
                </>
              )
            })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
