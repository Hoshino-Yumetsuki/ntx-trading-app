'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/src/components/ui/dialog'
import { toast } from 'sonner'
import { withdrawUsdt, withdrawNtx } from '@/src/services/user'
import { useLanguage } from '@/src/contexts/language-context'
import type { UserInfo } from '@/src/types/user'

interface WithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  withdrawType: 'usdt' | 'ntx'
  userInfo: UserInfo
  onSuccess: () => void
}

export function WithdrawDialog({
  isOpen,
  onClose,
  withdrawType,
  userInfo,
  onSuccess
}: WithdrawDialogProps) {
  const { t } = useLanguage()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount('')
      setWithdrawAddress(userInfo?.bscAddress || '')
      setAddressError('')
    }
  }, [isOpen, userInfo?.bscAddress])

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return '0.00'
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  // 验证BSC地址格式
  const validateBscAddress = (address: string) => {
    if (!address) {
      return t('assets.validation.addressRequired')
    }

    // BSC地址必须以0x开头，后面跟40个十六进制字符，总长度42位
    const bscAddressRegex = /^0x[a-fA-F0-9]{40}$/

    if (!bscAddressRegex.test(address)) {
      return t('assets.validation.invalidBscAddress')
    }

    return ''
  }

  const handleAddressChange = (address: string) => {
    setWithdrawAddress(address)
    const error = validateBscAddress(address)
    setAddressError(error)
  }

  const confirmWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error(t('assets.validation.amountRequired'))
      return
    }

    const addressValidationError = validateBscAddress(withdrawAddress)
    if (addressValidationError) {
      setAddressError(addressValidationError)
      return
    }

    const amount = parseFloat(withdrawAmount)
    const availableBalance =
      withdrawType === 'usdt' ? userInfo.usdtBalance : userInfo.ntxBalance

    if (amount > availableBalance) {
      toast.error(t('assets.validation.insufficientBalance'))
      return
    }

    try {
      setIsWithdrawing(true)

      if (withdrawType === 'usdt') {
        const _response = await withdrawUsdt({
          amount: parseFloat(withdrawAmount),
          toAddress: withdrawAddress
        })
      } else {
        const _response = await withdrawNtx({
          amount: parseFloat(withdrawAmount),
          toAddress: withdrawAddress
        })
      }

      toast.success(t('assets.withdrawSuccess'))
      onSuccess()
      onClose()
    } catch (error) {
      console.error('提现失败:', error)
      toast.error(
        error instanceof Error ? error.message : t('assets.withdrawFailed')
      )
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {withdrawType.toUpperCase()} {t('assets.withdraw')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">{t('assets.withdrawAmount')}</Label>
            <Input
              id="amount"
              type="number"
              placeholder={t('assets.enterWithdrawAmount')}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-slate-600 mt-1">
              {t('assets.availableBalance')}:{' '}
              {formatBalance(
                withdrawType === 'usdt'
                  ? userInfo.usdtBalance
                  : userInfo.ntxBalance
              )}{' '}
              {withdrawType.toUpperCase()}
            </p>
          </div>
          <div>
            <Label htmlFor="address">{t('assets.withdrawAddress')}</Label>
            <Input
              id="address"
              placeholder={t('assets.enterBscAddress')}
              value={withdrawAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="mt-1"
            />
            <div className="mt-1">
              {addressError && (
                <p className="text-sm text-red-500">{addressError}</p>
              )}
              {withdrawAddress &&
                !addressError &&
                withdrawAddress.length === 42 &&
                withdrawAddress.startsWith('0x') && (
                  <p className="text-sm text-green-600">
                    ✓ {t('assets.addressFormatCorrect')}
                  </p>
                )}
              <p className="text-sm text-slate-600 mt-1">
                ⚠️ {t('assets.addressWarning')}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmWithdraw}
            disabled={isWithdrawing}
            className="diffused-button"
          >
            {isWithdrawing ? t('assets.submitting') : t('assets.withdrawNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
