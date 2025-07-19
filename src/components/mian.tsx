'use client'

import { useState, useEffect } from 'react'
import { Home, Coins, User, Newspaper } from 'lucide-react' // Updated imports for BookOpen and Coins
import { HomePage } from '@/src/components/pages/home-page'
import { MiningPage } from '@/src/components/pages/mining-page'
import { ProfilePage } from '@/src/components/pages/profile-page'
import { NewsPage } from '@/src/components/pages/news-page'
import { RecentNotifications } from '@/src/components/ui/recent-notifications' // Import RecentNotifications
import { LanguageSwitcher } from '@/src/components/ui/language-switcher'
import { useLanguage } from '@/src/contexts/language-context'

export function MainApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()

  // 从 localStorage 恢复页面状态
  useEffect(() => {
    const savedTab = localStorage.getItem('ntx-active-tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
    setIsInitialized(true)
  }, [])

  // 保存页面状态到 localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('ntx-active-tab', activeTab)
    }
  }, [activeTab, isInitialized])

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: Home, component: HomePage },
    { id: 'news', label: t('nav.news'), icon: Newspaper, component: NewsPage },
    //{
    //  id: 'academy',
    //  label: '黑马学院',
    //  icon: BookOpen,
    //  component: AcademyPage
    //},
    {
      id: 'mining',
      label: t('nav.mining'),
      icon: Coins,
      component: MiningPage
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: User,
      component: ProfilePage
    }
  ]

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || HomePage

  return (
    <div className="min-h-screen">
      {/* Language Switcher Header */}
      <div className="fixed top-0 right-0 z-50 p-4">
        <LanguageSwitcher />
      </div>

      <div className="flex-1 overflow-auto pb-28 pt-16">
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
