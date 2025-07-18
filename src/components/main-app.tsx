"use client"

import { useState } from "react"
import { Home, BookOpen, Coins, User, Newspaper } from "lucide-react" // Updated imports for BookOpen and Coins
import { HomePage } from "@/src/components/home-page"
import { MiningPage } from "@/src/components/mining-page"
import { AcademyPage } from "@/src/components/academy-page"
import { ProfilePage } from "@/src/components/profile-page"
import { NewsPage } from "@/src/components/news-page"
import { RecentNotifications } from "@/src/components/recent-notifications" // Import RecentNotifications

export function MainApp() {
  const [activeTab, setActiveTab] = useState("home")

  const tabs = [
    { id: "home", label: "主页", icon: Home, component: HomePage },
    { id: "news", label: "新闻", icon: Newspaper, component: NewsPage },
    { id: "academy", label: "黑马学院", icon: BookOpen, component: AcademyPage }, // Changed icon to BookOpen
    { id: "mining", label: "挖矿", icon: Coins, component: MiningPage }, // Changed icon to Coins
    { id: "profile", label: "我的", icon: User, component: ProfilePage },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || HomePage

  return (
    <div className="min-h-screen diffused-bg">
      {/* Main Content */}
      <div className="pb-20">
        {" "}
        {/* Keep pb-20 to ensure space for bottom nav */}
        <ActiveComponent />
      </div>

      {/* Recent Notifications at the bottom of the main content area */}
      {activeTab === "home" && <RecentNotifications onViewMore={() => setActiveTab("news")} />}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t-0 rounded-t-3xl">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-white/40 backdrop-blur-sm shadow-lg"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/20"
                }`}
              >
                {/* Apply premium-icon styling to the bottom navigation icons */}
                <div
                  className={`premium-icon w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    isActive ? "text-blue-600" : "text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {/* Icon size inside the premium-icon container */}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
