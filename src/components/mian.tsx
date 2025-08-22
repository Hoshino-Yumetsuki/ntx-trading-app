'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Coins, User, Newspaper, BookOpen } from 'lucide-react'
import { HomePage } from '@/src/components/pages/home'
import { MiningPage } from '@/src/components/pages/mining'
import { ProfilePage } from '@/src/components/pages/profile'
import { NewsPage } from '@/src/components/pages/news'
import { AcademyPage } from '@/src/components/pages/academy'
import { RecentNotifications } from '@/src/components/ui/recent-notifications' // Import RecentNotifications
import { useLanguage } from '@/src/contexts/language-context'
import { AppBackground } from '@/src/components/ui/app-background'
import { useAuth } from '@/src/contexts/AuthContext'

export function MainApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

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

  // 若在“我的”页且登出/未登录，则自动切回首页
  useEffect(() => {
    if (activeTab === 'profile' && !isAuthenticated) {
      setActiveTab('home')
    }
  }, [isAuthenticated, activeTab])

  const tabs = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
      component: () => <HomePage onNavigate={setActiveTab} />
    },
    { id: 'news', label: t('nav.news'), icon: Newspaper, component: NewsPage },
    {
      id: 'academy',
      label: '黑马学院',
      icon: BookOpen,
      component: AcademyPage
    },
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

  // 确定要显示的活动组件
  let ActiveComponent: any
  // 检查是否是主标签页中的一个
  const activeTabComponent = tabs.find((tab) => tab.id === activeTab)?.component
  if (activeTabComponent) {
    ActiveComponent = activeTabComponent
  } else {
    // 默认回到首页
    ActiveComponent = tabs[0].component
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {activeTab !== 'news' && <AppBackground />}
      <div className="flex-1 overflow-auto pb-28 pt-0">
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
                onClick={() => {
                  if (tab.id === 'profile') {
                    if (!isAuthenticated) {
                      router.push('/login?next=profile')
                      return
                    }
                  }
                  setActiveTab(tab.id)
                }}
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
