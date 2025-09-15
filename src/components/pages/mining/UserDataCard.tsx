"use client";

import { Hammer, Database } from "lucide-react";
import {
  formatCurrency,
  type UserData,
  type DailyUserData,
} from "@/src/services/mining";
import { useLanguage } from "@/src/contexts/language-context";

interface UserDataCardProps {
  user: any;
  userData: UserData | null;
  dailyData: DailyUserData | null;
  userLoading: boolean;
}

export function UserDataCard({
  user,
  userData,
  dailyData,
  userLoading,
}: UserDataCardProps) {
  const { t } = useLanguage();

  return (
    <>
      {!user ? (
        <div className="text-center py-8">
          <div className="premium-icon w-12 h-12 rounded-lg mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{t("mining.user.loginPrompt")}</p>
          <p className="text-sm text-gray-400">
            {t("mining.user.loginDescription")}
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-base font-medium text-slate-700 mb-3">
            {t("mining.user.title") || "我的数据"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div
              className="data-card p-5 rounded-xl text-left"
              style={{
                border: "none",
                backgroundImage: "url(/Group69@3x.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "96px",
              }}
            >
              <Hammer className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm text-[#4D576A] mb-1">
                {t("mining.user.totalMining")}
              </p>
              <p
                className={`text-[14pt] font-din-black text-[#4D576A] ${userLoading ? "animate-pulse bg-gray-200 rounded h-7 w-28" : ""}`}
              >
                {userLoading
                  ? ""
                  : userData && userData.total_mining !== undefined
                    ? formatCurrency(userData.total_mining, "NTX")
                    : "--"}
              </p>
            </div>
            <div
              className="data-card p-5 rounded-xl text-left"
              style={{
                border: "none",
                backgroundImage: "url(/Group69@3x.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "96px",
              }}
            >
              <Database className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm text-[#4D576A] mb-1">
                {t("mining.user.totalTradingCost")}
              </p>
              <p
                className={`text-[14pt] font-din-black text-[#4D576A] ${userLoading ? "animate-pulse bg-gray-200 rounded h-7 w-28" : ""}`}
              >
                {userLoading
                  ? ""
                  : userData && userData.total_trading_cost !== undefined
                    ? formatCurrency(userData.total_trading_cost, "USDT")
                    : "--"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="data-card p-5 rounded-xl text-left"
              style={{
                border: "none",
                backgroundImage: "url(/Group69@3x.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "96px",
              }}
            >
              <Hammer className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm text-[#4D576A] mb-1">
                {t("mining.user.dailyMining")}
              </p>
              <p
                className={`text-[14pt] font-din-black text-[#4D576A] ${userLoading ? "animate-pulse bg-gray-200 rounded h-6 w-24" : ""}`}
              >
                {userLoading
                  ? ""
                  : dailyData && dailyData.mining_output !== undefined
                    ? formatCurrency(dailyData.mining_output, "NTX")
                    : "--"}
              </p>
            </div>
            <div
              className="data-card p-5 rounded-xl text-left"
              style={{
                border: "none",
                backgroundImage: "url(/Group69@3x.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "96px",
              }}
            >
              <Database className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm text-[#4D576A] mb-1">
                {t("mining.user.dailyTradingCost")}
              </p>
              <p
                className={`text-[14pt] font-din-black text-[#4D576A] ${userLoading ? "animate-pulse bg-gray-200 rounded h-6 w-24" : ""}`}
              >
                {userLoading
                  ? ""
                  : dailyData && dailyData.total_trading_cost !== undefined
                    ? formatCurrency(dailyData.total_trading_cost, "USDT")
                    : "--"}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
