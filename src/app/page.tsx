"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/src/components/splash-screen"
import { MainApp } from "@/src/components/main-app"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return <MainApp />
}
