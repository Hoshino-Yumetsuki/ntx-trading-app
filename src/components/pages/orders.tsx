"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyOrders } from "@/src/services/payment";
import type { Order, PermissionGroupWithPackages } from "@/src/types/course";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft, Copy, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getPermissionGroups } from "@/src/services/courseService";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [groups, setGroups] = useState<PermissionGroupWithPackages[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyOrders();
      // Sort by created_at desc
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(sorted);
    } catch (e: any) {
      setError(e.message || "获取订单失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 获取权限组/套餐，用于将 package_id -> 套餐名称（group.name）
  useEffect(() => {
    const run = async () => {
      try {
        const data = await getPermissionGroups();
        setGroups(data);
      } catch (_) {}
    };
    run();
  }, []);

  const packageNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const g of groups) {
      for (const p of g.packages) {
        map[p.id] = g.group.name;
      }
    }
    return map;
  }, [groups]);

  // 仅待支付订单
  const _pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders],
  );

  // 打开支付弹窗
  const openPayDialog = async (order: Order) => {
    // 打开弹窗后立即刷新订单，更新倒计时/地址等信息
    setSelectedOrder(order);
    setShowPayDialog(true);
    setTimeLeft(0);
    try {
      const data = await getMyOrders();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(sorted);
      const latest = sorted.find((o) => o.id === order.id) || order;
      setSelectedOrder(latest);
      setTimeLeft(latest.remainingTimeSeconds || 0);
    } catch (_) {
      // 回退到旧数据
      setTimeLeft(order.remainingTimeSeconds || 0);
    }
  };

  // 倒计时处理
  useEffect(() => {
    if (!showPayDialog) return;
    if (!timeLeft) return;
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [showPayDialog, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="min-h-screen pb-6">
      <div className="px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-start mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mr-3 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">我的订单</h1>
            <p className="text-slate-600 text-sm">查看课程购买与支付状态</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" /> 刷新
          </Button>
        </div>
      </div>

      <div className="px-6 mt-6">
        <Card className="glass-card border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 text-xl font-bold">
              订单列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-slate-600">加载订单中...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-500">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-600">暂无订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-slate-800 font-medium">
                        订单 #{format(new Date(o.created_at), "yyyyMMdd")}0000
                        {o.id}
                        <span className="ml-2 text-xs text-slate-500">
                          套餐名称 {packageNameMap[o.package_id] ?? "-"}
                        </span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded border border-white/40 bg-white/60 text-slate-600">
                          {o.status === "pending"
                            ? "待支付"
                            : o.status === "confirmed"
                              ? "已完成"
                              : "已关闭"}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        套餐金额 {o.amount} {o.currency} · 实付金额{" "}
                        {o.paymentAmount} {o.currency}
                      </div>
                      <div className="text-xs text-slate-500">
                        创建时间 {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {o.status === "pending" &&
                        typeof o.remainingTimeSeconds === "number" && (
                          <div className="flex items-center text-xs text-slate-600 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" />
                            剩余时间{" "}
                            {formatTime(Math.max(0, o.remainingTimeSeconds))}
                          </div>
                        )}
                      {o.status === "pending" ? (
                        <Button
                          size="sm"
                          className="diffused-button"
                          onClick={() => openPayDialog(o)}
                        >
                          去支付
                        </Button>
                      ) : (
                        <div className="text-xs text-slate-500">
                          {o.status === "confirmed" ? "已完成" : "已关闭"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 支付弹窗 */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[460px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>支付信息</DialogTitle>
            <DialogDescription>
              请使用支持 USDT 的钱包进行链上转账
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">支付地址</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm break-all font-mono text-blue-900">
                    {selectedOrder.paymentAddress || "-"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(selectedOrder.paymentAddress)
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">支付金额</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-amber-900">
                    {selectedOrder.paymentAmount} {selectedOrder.currency}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(String(selectedOrder.paymentAmount))
                    }
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-xs text-red-700 mb-1 font-semibold">
                  注意
                </div>
                <div className="text-sm text-red-700 font-bold">
                  未在有效期内完成支付将导致订单关闭。
                </div>
              </div>

              {typeof timeLeft === "number" && (
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> 支付倒计时
                  </div>
                  <div
                    className={`font-mono ${timeLeft <= 60 ? "text-red-600" : "text-slate-800"}`}
                  >
                    {formatTime(Math.max(0, timeLeft))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
