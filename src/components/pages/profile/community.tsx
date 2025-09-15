"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, User } from "lucide-react";
import { UserService } from "@/src/services/user";
import { AuthService } from "@/src/services/auth";
import type { CommunityResponse, UserInfo } from "@/src/types/user";

interface CommunityPageProps {
  onBack: () => void;
}

export default function CommunityPage({ onBack }: CommunityPageProps) {
  const [loading, setLoading] = useState(true);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [communityData, setCommunityData] = useState<CommunityResponse>({
    communityUserCount: 0,
    directInviteCount: 0,
    communityUsers: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // token 校验，避免无效请求
        const token = AuthService.getToken();
        if (!token) {
          toast.error("请先登录以查看社区信息");
          setCommunityData({
            communityUserCount: 0,
            directInviteCount: 0,
            communityUsers: [],
          });
          return;
        }
        const data = await UserService.getMyTeams();
        setCommunityData(data);
      } catch (err: any) {
        console.error("获取社区数据失败:", err);
        toast.error(err?.message || "获取社区数据失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 获取用户信息，包括邀请人信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setUserInfoLoading(true);
        const token = AuthService.getToken();
        if (!token) return;

        const data = await UserService.getUserInfo();
        setUserInfo(data);
      } catch (err: any) {
        console.error("获取用户信息失败:", err);
      } finally {
        setUserInfoLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-inter antialiased">
      {/* 顶部应用栏 */}
      <div className="w-full bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10 rounded-b-xl">
        <button
          type="button"
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">我的社区</h1>
        <div className="w-6" />
      </div>

      {/* 社区总览 + 我的邀请人 + 社区用户 */}
      <div className="max-w-4xl w-full space-y-8 bg-transparent mt-8 mb-8 px-4 sm:px-6 lg:px-8">
        {/* 社区总览 */}
        <div className="flex flex-col space-y-3 bg-white p-6 rounded-[16pt] shadow-xl border border-gray-100">
          <div className="flex flex-row gap-4 bg-blue-50 rounded-[16pt] p-5 items-center justify-around border border-blue-100">
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">
                社区用户
              </span>
              <div className="text-blue-600 text-2xl leading-6 font-bold mt-1">
                {communityData.communityUserCount.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">
                直邀用户
              </span>
              <div className="text-blue-600 text-2xl leading-6 font-bold mt-1">
                {communityData.directInviteCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 我的邀请人 */}
        <div className="bg-white p-6 rounded-[16pt] shadow-xl border border-gray-100">
          <div className="flex flex-row justify-between items-center mb-4 border-b pb-3 border-gray-100">
            <span className="text-gray-900 text-xl font-bold">我的邀请人</span>
          </div>

          {userInfoLoading ? (
            <div className="text-center text-gray-500 text-base py-6">
              加载中...
            </div>
          ) : userInfo?.invitedBy ? (
            <div className="flex items-center p-4 bg-gray-50 rounded-[16pt] border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold">
                  {userInfo.invitedBy}
                </p>
                <p className="text-gray-600 text-sm">
                  邀请码: {userInfo.myInviteCode}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-base py-6">
              暂无邀请人信息
            </div>
          )}
        </div>

        {/* 社区用户 */}
        <div className="bg-white p-6 rounded-[16pt] shadow-xl border border-gray-100">
          <div className="flex flex-row justify-between items-center mb-4 border-b pb-3 border-gray-100">
            <span className="text-gray-900 text-xl font-bold">社区用户</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 text-base py-10">
              加载中...
            </div>
          ) : communityData.communityUsers.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {communityData.communityUsers.map((user) => (
                <div
                  key={`${user.email}-${user.id}`}
                  className="flex flex-col p-4 bg-gray-50 rounded-[16pt] border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800 font-semibold text-lg">
                      {user.nickname || user.email}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-base text-blue-600">
                        UID: {user.id}
                      </span>
                      {user.isDirectInvite && (
                        <span className="text-xs text-green-600 mt-1">
                          直邀用户
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>邮箱: {user.email}</span>
                    {user.joined_at && (
                      <span>
                        加入时间: {new Date(user.joined_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-base py-10">
              暂无社区用户
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
