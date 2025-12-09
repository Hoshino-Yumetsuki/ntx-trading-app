'use client'

import { useEffect } from 'react'

// 检测运行环境
function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    // 原生 App 不需要 Service Worker
    if (isNativeApp()) {
      console.log('[PWA] Running in native app, skipping Service Worker')
      return
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          // 将版本号作为查询参数传递给 Service Worker
          const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
          navigator.serviceWorker
            .register(`/sw.js?v=${version}`, { scope: '/' })
            .then((registration) => {
              console.log(`[PWA] Service Worker v${version} registered:`, registration.scope)

              // 定期检查更新（每小时）
              setInterval(() => {
                registration.update()
              }, 60 * 60 * 1000)
            })
            .catch((error) => {
              console.error('[PWA] Service Worker registration failed:', error)
            })
        }, 1000)
      })
    }
  }, [])

  return null
}
