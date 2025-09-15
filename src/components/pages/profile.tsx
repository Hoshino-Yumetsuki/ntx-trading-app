"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/src/contexts/AuthContext";
import { UserService } from "@/src/services/user";
import type { UserInfo } from "@/src/types/user";
import { toast } from "sonner";
import { SecuritySettings } from "@/src/components/pages/profile/security-settings";
import AssetsPage from "@/src/components/pages/profile/assets";
import CommunityPage from "@/src/components/pages/profile/community";
import { BrokerPage } from "@/src/components/pages/broker";
import {
  ProfileHeader,
  InviteCodeCard,
  UserInfoCard,
  QuickActionsCard,
  ContactCard,
  LogoutCard,
  RewardsCard,
  StakeCard,
} from "@/src/components/pages/profile/index";

export function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const communityArrowId = useId();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    "profile" | "security" | "assets" | "community" | "broker"
  >("profile");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await UserService.getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.error("获取用户信息失败:", error);
        toast.error("获取用户信息失败");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("已退出登录");
      // 回到首页标签并跳转到根路径
      try {
        localStorage.setItem("ntx-active-tab", "home");
      } catch {}
      router.push("/");
    } catch (error) {
      console.error("退出登录失败:", error);
      toast.error("退出登录失败");
    }
  };

  const handleNavigate = (
    page: "assets" | "security" | "community" | "broker",
  ) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果当前页面是安全设置，渲染安全设置组件
  if (currentPage === "security") {
    return <SecuritySettings onBack={() => setCurrentPage("profile")} />;
  }

  // 如果当前页面是资产页面，渲染资产页面组件
  if (currentPage === "assets") {
    return <AssetsPage onBack={() => setCurrentPage("profile")} />;
  }

  // 如果当前页面是我的社区页面，渲染社区页面组件
  if (currentPage === "community") {
    return <CommunityPage onBack={() => setCurrentPage("profile")} />;
  }

  // 如果当前页面是经纪商页面，渲染经纪商页面组件（CSR 内切换）
  if (currentPage === "broker") {
    return <BrokerPage onBack={() => setCurrentPage("profile")} />;
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Profile Header */}
      <ProfileHeader userInfo={userInfo} />

      <div className="px-6 space-y-4 -mt-4">
        {/* User Info Card - 新增的用户信息卡片 */}
        <UserInfoCard userInfo={userInfo} />

        {/* 我的社区 图片卡片 */}
        <button
          type="button"
          className="relative w-full rounded-[16pt] overflow-hidden cursor-pointer select-none transition active:scale-[.99]"
          onClick={() => handleNavigate("community")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavigate("community");
            }
          }}
        >
          {/* 1029:216 比例占位 */}
          <div className="pt-[21%]"></div>
          {/* 背景图 */}
          <Image
            src="/Group34385@3x.png"
            alt="我的社区"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* 左侧文字覆盖 */}
          <div className="absolute inset-0 flex items-center justify-between">
            <div className="pl-4 md:pl-6">
              <span className="text-white text-lg font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                我的社区
              </span>
            </div>
            {/* 右侧“点击进入”和箭头 */}
            <div className="pr-4 md:pr-6 flex items-center">
              <span className="text-white text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] mr-1">
                点击进入
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                role="img"
                aria-labelledby={communityArrowId}
              >
                <title id={communityArrowId}>进入社区页面</title>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </button>

        {/* Invite Code Card */}
        <InviteCodeCard userInfo={userInfo} />

        {/* Rewards Card */}
        <RewardsCard userInfo={userInfo} onNavigate={handleNavigate} />

        {/* Stake Card */}
        <StakeCard userInfo={userInfo} onNavigate={handleNavigate} />

        {/* Quick Actions Card */}
        <QuickActionsCard onNavigate={handleNavigate} />

        {/* Contact Card */}
        <ContactCard />

        {/* Logout Card */}
        <LogoutCard onLogout={handleLogout} />
      </div>
    </div>
  );
}
