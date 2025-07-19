'use client'

import { useState } from 'react'
import { Home, BookOpen, Coins, User, Newspaper } from 'lucide-react' // Updated imports for BookOpen and Coins
import { HomePage } from '@/src/components/pages/home-page'
import { MiningPage } from '@/src/components/pages/mining-page'
import { AcademyPage } from '@/src/components/pages/academy-page'
import { ProfilePage } from '@/src/components/pages/profile-page'
import { NewsPage } from '@/src/components/pages/news-page'
import { RecentNotifications } from '@/src/components/ui/recent-notifications' // Import RecentNotifications

export function MainApp() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: '主页', icon: Home, component: HomePage },
    { id: 'news', label: '新闻', icon: Newspaper, component: NewsPage },
    {
      id: 'academy',
      label: '黑马学院',
      icon: BookOpen,
      component: AcademyPage
    },
    { id: 'mining', label: '挖矿', icon: Coins, component: MiningPage },
    { id: 'profile', label: '我的', icon: User, component: ProfilePage }
  ]

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || HomePage

  return (
    <div className="min-h-screen">
      <div className="flex-1 overflow-auto pb-28">
        <ActiveComponent />

        {activeTab === 'home' && (
          <RecentNotifications onViewMore={() => setActiveTab('news')} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-card border-t-0 rounded-t-3xl">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-white/40 backdrop-blur-sm shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/20'
                }`}
              >
                <div
                  className={`premium-icon w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
