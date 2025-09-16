"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/src/contexts/language-context";
import {
  getWithdrawalRecords,
  getCommissionRecords,
} from "@/src/services/user";
import { AssetsHeader } from "@/src/components/pages/assets/assets-header";
import { AssetsOverview } from "@/src/components/pages/assets/assets-overview";
import { WithdrawalHistory } from "@/src/components/pages/assets/withdrawal-history";
import { CommissionHistory } from "@/src/components/pages/assets/commission-history";
import { WithdrawDialog } from "@/src/components/pages/assets/withdraw-dialog";
import type {
  UserInfo,
  WithdrawalRecord,
  CommissionRecord,
} from "@/src/types/user";

interface AssetsPageProps {
  onBack: () => void;
  userInfo: UserInfo | null;
  onNavigate?: (page: "security") => void; // 添加 onNavigate 属性
}

export default function AssetsPage({
  onBack,
  userInfo,
  onNavigate,
}: AssetsPageProps) {
  const { t } = useLanguage();
  const [withdrawalRecords, setWithdrawalRecords] = useState<
    WithdrawalRecord[]
  >([]);
  const [commissionRecords, setCommissionRecords] = useState<
    CommissionRecord[]
  >([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawType, setWithdrawType] = useState<"usdt" | "ntx">("usdt");
  const [currentView, setCurrentView] = useState<
    "assets" | "history" | "commission"
  >("assets");

  const loadWithdrawalRecords = useCallback(async () => {
    try {
      setLoadingRecords(true);
      const data = await getWithdrawalRecords();
      setWithdrawalRecords(data);
    } catch (error) {
      console.error("获取提现记录失败:", error);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const loadCommissionRecords = useCallback(async () => {
    try {
      setLoadingCommission(true);
      const records = await getCommissionRecords();
      setCommissionRecords(records);
    } catch (error) {
      console.error("获取佣金记录失败:", error);
    } finally {
      setLoadingCommission(false);
    }
  }, []);

  const handleWithdraw = (type: "usdt" | "ntx") => {
    setWithdrawType(type);
    setShowWithdrawDialog(true);
  };

  const handleWithdrawSuccess = () => {
    loadWithdrawalRecords();
  };

  const handleRefresh = () => {
    if (currentView === "history") {
      loadWithdrawalRecords();
    } else if (currentView === "commission") {
      loadCommissionRecords();
    }
  };

  const handleViewChange = (view: "assets" | "history" | "commission") => {
    setCurrentView(view);
    if (view === "history" && withdrawalRecords.length === 0) {
      loadWithdrawalRecords();
    } else if (view === "commission" && commissionRecords.length === 0) {
      loadCommissionRecords();
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen">
        <AssetsHeader
          onBack={onBack}
          currentView={currentView}
          onRefresh={handleRefresh}
          onViewChange={handleViewChange}
        />
        <div className="p-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-[16pt] p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-[16pt] p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AssetsHeader
        onBack={onBack}
        currentView={currentView}
        onRefresh={handleRefresh}
        onViewChange={handleViewChange}
      />

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {currentView === "assets" ? (
            <AssetsOverview
              userInfo={userInfo}
              onWithdraw={handleWithdraw}
              onNavigate={onNavigate}
            />
          ) : currentView === "history" ? (
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
  );
}