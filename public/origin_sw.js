var params = new URL(self.location).searchParams;
var VERSION = '__SW_VERSION__';
var API_TARGET = decodeURIComponent(params.get('apiTarget') || 'https://api.ntxdao.com/api');
var RSS_TARGET = decodeURIComponent(params.get('rssTarget') || 'https://rss.ntxdao.com/rss');
var CACHE_NAME = 'ntx-trading-v' + VERSION;

var FAKE_API_HOST = 'app.ntxdao.com';
var FAKE_API_PATH = '/api';
var FAKE_RSS_PATH = '/rss';

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name.startsWith('ntx-') && name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  if (!url.protocol.startsWith('http')) return;

  var proxyUrl = getProxyUrl(url);
  if (proxyUrl) {
    event.respondWith(proxyRequest(request, proxyUrl));
    return;
  }

  if (request.method !== 'GET') return;

  if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|css|js)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});

function getProxyUrl(url) {
  if (url.hostname === FAKE_API_HOST && url.pathname.startsWith(FAKE_API_PATH + '/')) {
    var path = url.pathname.substring(FAKE_API_PATH.length);
    return API_TARGET + path + url.search;
  }
  
  if (url.hostname === FAKE_API_HOST && url.pathname.startsWith(FAKE_RSS_PATH + '/')) {
    var path = url.pathname.substring(FAKE_RSS_PATH.length);
    return RSS_TARGET + path + url.search;
  }

  return null;
}

// 代理请求
function proxyRequest(originalRequest, targetUrl) {
  var headers = new Headers();
  originalRequest.headers.forEach(function(value, key) {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'referer') {
      headers.append(key, value);
    }
  });

  var init = {
    method: originalRequest.method,
    headers: headers,
    mode: 'cors',
    credentials: 'omit'
  };

  if (originalRequest.method !== 'GET' && originalRequest.method !== 'HEAD') {
    return originalRequest.clone().text().then(function(body) {
      if (body) init.body = body;
      return fetch(targetUrl, init);
    }).catch(function(err) {
      console.error('[SW] Proxy error:', err);
      return new Response(JSON.stringify({ error: 'Proxy failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }

  return fetch(targetUrl, init).catch(function(err) {
    console.error('[SW] Proxy error:', err);
    return new Response(JSON.stringify({ error: 'Proxy failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  });
}

function networkFirst(request) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, clone);
      });
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || new Response('Offline', { status: 503 });
    });
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return response;
    }).catch(function() {
      return new Response('Offline', { status: 503 });
    });
  });
}

console.log('[SW] Loaded');
