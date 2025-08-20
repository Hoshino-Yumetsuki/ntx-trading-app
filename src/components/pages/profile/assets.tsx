'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/src/contexts/language-context'
import { toast } from 'sonner'
import { AuthService } from '@/src/services/auth'
import {
  getUserInfo,
  getWithdrawalRecords,
  getCommissionRecords
} from '@/src/services/user'
import { AssetsHeader } from '@/src/components/pages/assets/assets-header'
import { AssetsOverview } from '@/src/components/pages/assets/assets-overview'
import { WithdrawalHistory } from '@/src/components/pages/assets/withdrawal-history'
import { CommissionHistory } from '@/src/components/pages/assets/commission-history'
import { WithdrawDialog } from '@/src/components/pages/assets/withdraw-dialog'
import type {
  UserInfo,
  WithdrawalRecord,
  CommissionRecord
} from '@/src/types/user'

interface AssetsPageProps {
  onBack: () => void
}

export default function AssetsPage({ onBack }: AssetsPageProps) {
  const { t } = useLanguage()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawalRecords, setWithdrawalRecords] = useState<
    WithdrawalRecord[]
  >([])
  const [commissionRecords, setCommissionRecords] = useState<
    CommissionRecord[]
  >([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [loadingCommission, setLoadingCommission] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawType, setWithdrawType] = useState<'usdt' | 'ntx'>('usdt')
  const [_withdrawAmount, _setWithdrawAmount] = useState('')
  const [_withdrawAddress, _setWithdrawAddress] = useState('')
  const [_isWithdrawing, _setIsWithdrawing] = useState(false)
  const [currentView, setCurrentView] = useState<
    'assets' | 'history' | 'commission'
  >('assets')

  // 获取用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      toast.error(t('assets.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    const token = AuthService.getToken()
    if (token) {
      loadUserInfo()
    } else {
      setLoading(false)
      toast.error('请先登录')
    }
  }, [loadUserInfo])

  // 加载提现记录
  const loadWithdrawalRecords = useCallback(async () => {
    try {
      setLoadingRecords(true)
      const data = await getWithdrawalRecords()
      setWithdrawalRecords(data)
    } catch (error) {
      console.error('获取提现记录失败:', error)
    } finally {
      setLoadingRecords(false)
    }
  }, [])

  const loadCommissionRecords = useCallback(async () => {
    try {
      setLoadingCommission(true)
      const records = await getCommissionRecords()
      setCommissionRecords(records)
    } catch (error) {
      console.error('获取佣金记录失败:', error)
    } finally {
      setLoadingCommission(false)
    }
  }, [])

  // 处理提现
  const handleWithdraw = (type: 'usdt' | 'ntx') => {
    setWithdrawType(type)
    setShowWithdrawDialog(true)
  }

  const handleWithdrawSuccess = () => {
    loadUserInfo() // 刷新用户信息
    loadWithdrawalRecords() // 刷新提现记录
  }

  // 刷新数据
  const handleRefresh = () => {
    loadUserInfo()
    if (currentView === 'history') {
      loadWithdrawalRecords()
    } else if (currentView === 'commission') {
      loadCommissionRecords()
    }
  }

  // 切换视图时加载相应数据
  const handleViewChange = (view: 'assets' | 'history' | 'commission') => {
    setCurrentView(view)
    if (view === 'history' && withdrawalRecords.length === 0) {
      loadWithdrawalRecords()
    } else if (view === 'commission' && commissionRecords.length === 0) {
      loadCommissionRecords()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AssetsHeader
          onBack={onBack}
          currentView={currentView}
          onRefresh={handleRefresh}
          onViewChange={handleViewChange}
        />
        <div className="p-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-white">
        <AssetsHeader
          onBack={onBack}
          currentView={currentView}
          onRefresh={handleRefresh}
          onViewChange={handleViewChange}
        />
        <div className="p-4">
          <div className="max-w-md mx-auto text-center py-8">
            <p className="text-slate-600">获取用户信息失败，请重试</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AssetsHeader
        onBack={onBack}
        currentView={currentView}
        onRefresh={handleRefresh}
        onViewChange={handleViewChange}
      />

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {currentView === 'assets' ? (
            <AssetsOverview userInfo={userInfo} onWithdraw={handleWithdraw} />
          ) : currentView === 'history' ? (
            <WithdrawalHistory
              records={withdrawalRecords}
              loading={loadingRecords}
            />
          ) : (
            <CommissionHistory
              records={commissionRecords}
              loading={loadingCommission}
            />
          )}
        </div>
      </div>

      <WithdrawDialog
        isOpen={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        withdrawType={withdrawType}
        userInfo={userInfo}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  )
}
