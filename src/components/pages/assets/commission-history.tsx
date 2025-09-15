"use client";

import { Wallet, History } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/contexts/language-context";
import type { CommissionRecord } from "@/src/types/user";

interface CommissionHistoryProps {
  records: CommissionRecord[];
  loading: boolean;
}

export function CommissionHistory({
  records,
  loading,
}: CommissionHistoryProps) {
  const { t } = useLanguage();

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return "0.00";
    return balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">{t("assets.noCommissionRecords")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record.id} className="bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800">
                    {t("assets.inviteCommission")}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {formatDate(record.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-green-600">
                  +{formatBalance(record.amount)} USDT
                </span>
              </div>
            </div>
            {/* 邀请人与邮箱信息已隐藏，仅保留时间显示 */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
