"use client";

import { useState, useEffect, useId } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { withdrawUsdt, withdrawNtx } from "@/src/services/user";
import { useLanguage } from "@/src/contexts/language-context";
import type { UserInfo } from "@/src/types/user";
import { AlertCircle } from "lucide-react";

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawType: "usdt" | "ntx";
  userInfo: UserInfo | null;
  onSuccess: () => void;
}

export function WithdrawDialog({
  isOpen,
  onClose,
  withdrawType,
  userInfo,
  onSuccess,
}: WithdrawDialogProps) {
  const { t } = useLanguage();
  const amountId = useId();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount("");
    }
  }, [isOpen]);

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return "0.00";
    return balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const confirmWithdraw = async () => {
    if (!userInfo?.bscAddress) {
      toast.error("Please bind a wallet address in security settings first.");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error(t("assets.validation.amountRequired"));
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const availableBalance =
      withdrawType === "usdt"
        ? userInfo.usdtBalance
        : userInfo.ntxBalance;

    if (amount > availableBalance) {
      toast.error(t("assets.validation.insufficientBalance"));
      return;
    }

    try {
      setIsWithdrawing(true);
      const request = {
        amount: parseFloat(withdrawAmount),
        toAddress: userInfo.bscAddress,
      };

      if (withdrawType === "usdt") {
        await withdrawUsdt(request);
      } else {
        await withdrawNtx(request);
      }

      toast.success(t("assets.withdrawSuccess"));
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("assets.withdrawFailed"),
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!userInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {withdrawType.toUpperCase()} {t("assets.withdraw")}
          </DialogTitle>
          {!userInfo.bscAddress && (
            <DialogDescription className="text-red-500 flex items-center gap-2 pt-2">
              <AlertCircle className="w-4 h-4" />
              You must bind a wallet address before withdrawing.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor={amountId}>{t("assets.withdrawAmount")}</Label>
            <Input
              id={amountId}
              type="number"
              placeholder={t("assets.enterWithdrawAmount")}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-1"
              disabled={!userInfo.bscAddress}
            />
            <p className="text-sm text-slate-600 mt-1">
              {t("assets.availableBalance")}:{" "}
              {formatBalance(
                withdrawType === "usdt"
                  ? userInfo.usdtBalance
                  : userInfo.ntxBalance,
              )}{" "}
              {withdrawType.toUpperCase()}
            </p>
          </div>
          <div>
            <Label>{t("assets.withdrawAddress")}</Label>
            <div className="mt-1 p-3 bg-slate-100 rounded-md text-sm font-mono break-all">
              {userInfo.bscAddress || "No address bound"}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              ⚠️ {t("assets.addressWarning")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={confirmWithdraw}
            disabled={isWithdrawing || !userInfo.bscAddress}
            className="diffused-button"
          >
            {isWithdrawing ? t("assets.submitting") : t("assets.withdrawNow")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}