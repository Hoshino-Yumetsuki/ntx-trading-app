"use client";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import type { UserInfo } from "@/src/types/user";
import { useLanguage } from "@/src/contexts/language-context";
import { useAuth } from "@/src/contexts/AuthContext";
import Image from "next/image";

interface ProfileHeaderProps {
  userInfo: UserInfo | null;
}

export function ProfileHeader({ userInfo }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="px-6 pt-8 pb-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        {t("profile.title") || "个人中心"}
      </h1>

      {/* 用户信息卡片，使用图片背景 */}
      <div
        className="text-white rounded-[16pt] p-6 shadow-lg mb-4 relative"
        style={{
          backgroundImage: "url(/Group72@3x.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          backgroundSize: "cover",
          aspectRatio: "1029 / 336",
        }}
      >
        {/* 右上角装饰 */}
        <Image
          src="/Frame29@3x.png"
          alt=""
          width={444}
          height={96}
          className="absolute top-0 right-0 w-[222px] h-auto opacity-80 pointer-events-none select-none"
          priority
        />
        <div className="flex items-center mb-3">
          <Avatar className="w-16 h-16 border-4 border-white/30">
            {/* <AvatarImage src="/placeholder.svg?height=80&width=80" /> */}
            <AvatarFallback className="bg-blue-700 text-white text-xl font-bold">
              {(userInfo?.nickname || user?.nickname || "U")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h2 className="text-xl font-bold">
              {userInfo?.nickname || user?.nickname || "User"}
            </h2>
            <p className="text-blue-100 text-sm">
              ID: {userInfo?.id || user?.id || "N/A"}
            </p>
          </div>
        </div>

        {/* 邮箱信息已隐藏 */}
      </div>
    </div>
  );
}
