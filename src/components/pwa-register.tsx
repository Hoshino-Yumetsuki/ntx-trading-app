'use client'

import { useEffect } from 'react'

function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

async function registerServiceWorker(swUrl: string, version: string) {
  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations.map((registration) => {
      const scope = registration.scope
      const scriptUrl = registration.active?.scriptURL ?? ''

      const isSameOriginScope = scope.startsWith(window.location.origin)
      const isOldSw = scriptUrl.includes('/sw.js') && !scriptUrl.includes(`v=${version}`)

      if (isSameOriginScope && isOldSw) {
        return registration.unregister()
      }

      return Promise.resolve()
    })
  )

  const registration = await navigator.serviceWorker.register(swUrl, {
    scope: '/',
    updateViaCache: 'none'
  })

  console.log(`[PWA] Service Worker v${version} registered:`, registration.scope)

  return registration
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (isNativeApp()) {
      console.log('[PWA] Running in native app, skipping Service Worker')
      return
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
          const apiTarget = process.env.NEXT_PUBLIC_API_PROXY_TARGET || 'https://api.ntxdao.com/api'
          const rssTarget = process.env.NEXT_PUBLIC_RSS_PROXY_TARGET || 'https://rss.ntxdao.com/rss'

          const swUrl = `/sw.js?apiTarget=${encodeURIComponent(apiTarget)}&rssTarget=${encodeURIComponent(rssTarget)}`
          
          registerServiceWorker(swUrl, version)
            .then((registration) => {
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
