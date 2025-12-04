'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Home, Coins, User, Newspaper, BookOpen } from 'lucide-react'
import { HomePage } from '@/src/components/pages/home'
import { MiningPage } from '@/src/components/pages/mining'
import { ProfilePage } from '@/src/components/pages/profile'
import { NewsPage } from '@/src/components/pages/news'
import { AcademyPage } from '@/src/components/pages/academy'
import { BrokerPage } from '@/src/components/pages/broker'
import { NotificationsPage } from '@/src/components/pages/notifications'
import { useLanguage } from '@/src/contexts/language-context'
import { AppBackground } from '@/src/components/ui/app-background'
import { useAuth } from '@/src/contexts/AuthContext'
import { MissionPage } from './pages/mission'
import { AnnouncementModal } from '@/src/components/ui/announcement-modal'

export function MainApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const savedTab = localStorage.getItem('ntx-active-tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!searchParams) return
    const tab = searchParams.get('tab') || ''
    const newsId = searchParams.get('news')
    const validTabs = [
      'home',
      'news',
      'notifications',
      'academy',
      'mining',
      'profile',
      'broker',
      'mission'
    ]
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab)
    } else if (newsId) {
      setActiveTab('news')
    }
  }, [searchParams])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('ntx-active-tab', activeTab)
      const currentTab = searchParams?.get('tab')
      const newsId = searchParams?.get('news')
      if (currentTab && currentTab !== activeTab && !newsId) {
        router.replace('/', { scroll: false })
      }
    }
  }, [activeTab, isInitialized, searchParams, router])

  useEffect(() => {
    if (activeTab === 'profile' && !isAuthenticated) {
      setActiveTab('home')
    }
  }, [isAuthenticated, activeTab])

  // 处理查看公告的回调
  const handleViewAnnouncement = useCallback(
    (newsId: number) => {
      setActiveTab('notifications')
      router.push(`/?tab=notifications&news=${newsId}`, { scroll: false })
    },
    [router]
  )

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: Home, component: HomePage },
    { id: 'news', label: t('nav.news'), icon: Newspaper, component: NewsPage },
    {
      id: 'academy',
      label: t('nav.academy'),
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

  let ActiveComponent: any
  if (activeTab === 'broker') {
    ActiveComponent = BrokerPage
  } else if (activeTab === 'mission') {
    ActiveComponent = MissionPage
  } else if (activeTab === 'notifications') {
    ActiveComponent = NotificationsPage
  } else {
    const activeTabComponent = tabs.find(
      (tab) => tab.id === activeTab
    )?.component
    ActiveComponent = activeTabComponent || tabs[0].component
  }

  return (
    <div className="relative flex h-screen flex-1 flex-col overflow-hidden">
      <AppBackground />

      <AnnouncementModal onViewAnnouncement={handleViewAnnouncement} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-24">
        {activeTab === 'home' ? (
          <HomePage onNavigate={setActiveTab} />
        ) : (
          <ActiveComponent onNavigate={setActiveTab} />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 glass-card border-t-0 rounded-t-3xl md:left-1/2 md:-translate-x-1/2 md:max-w-md w-full backdrop-blur-xl bg-white/70">
        <div className="flex items-center justify-around py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'profile' && !isAuthenticated) {
                    router.push('/login?next=profile')
                    return
                  }
                  setActiveTab(tab.id)
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-white/40 backdrop-blur-sm shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/20'
                }`}
              >
                <div
                  className={`premium-icon w-6 h-6 rounded-full flex items-center justify-center mb-0.5 ${
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
      </footer>
    </div>
  )
}
