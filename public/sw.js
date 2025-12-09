// NTX Trading PWA Service Worker
const VERSION = new URL(self.location).searchParams.get('v') || '1.0.0'
const CACHE_NAME = 'ntx-trading-v' + VERSION

console.log('[SW] Version:', VERSION)

self.addEventListener('install', function() {
  console.log('[SW] Installed')
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name.startsWith('ntx-') && name !== CACHE_NAME
        }).map(function(name) {
          console.log('[SW] Deleting old cache:', name)
          return caches.delete(name)
        })
      )
    }).then(function() {
      console.log('[SW] Activated')
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', function(event) {
  var request = event.request
  if (request.method !== 'GET') return

  var url = new URL(request.url)
  if (!url.protocol.startsWith('http')) return
  if (url.pathname.startsWith('/api/')) return

  if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|css|js)/.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
  } else {
    event.respondWith(networkFirst(request))
  }
})

function networkFirst(request) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var clone = response.clone()
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, clone)
      })
    }
    return response
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || new Response('Offline', { status: 503 })
    })
  })
}

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached
    return fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone()
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, clone)
        })
      }
      return response
    }).catch(function() {
      return new Response('Offline', { status: 503 })
    })
  })
}

console.log('[SW] Loaded')
