'use client'

import { useState, useEffect } from 'react'
import { SplashScreen } from '@/src/components/pages/splash-screen'
import { MainApp } from '@/src/components/main'
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext'
import { LanguageProvider } from '@/src/contexts/language-context'
import { Loader2 } from 'lucide-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 创建一个 client
const queryClient = new QueryClient()

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const { isLoading } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return <MainApp />
}

export default function HomePage() {
  return (
    // 在这里包裹 QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}