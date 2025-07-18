'use client'

import { useState, useEffect } from 'react'
import { SplashScreen } from '@/src/components/pages/splash-screen'
import { MainApp } from '@/src/components/mian'
import { LoginPage } from '@/src/components/pages/login'
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()

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

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <MainApp />
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
