var params = new URL(self.location).searchParams;
var VERSION = '__SW_VERSION__';
var API_TARGET = decodeURIComponent(params.get('apiTarget') || 'https://api.ntxdao.com/api');
var RSS_TARGET = decodeURIComponent(params.get('rssTarget') || 'https://rss.ntxdao.com/rss');
var CACHE_NAME = 'ntx-trading-v' + VERSION;
var API_CACHE_NAME = 'ntx-api-v' + VERSION;

var FAKE_API_HOST = 'app.ntxdao.com';
var FAKE_API_PATH = '/api';
var FAKE_RSS_PATH = '/rss';

// API 缓存过期时间（毫秒）- 10分钟
var API_CACHE_MAX_AGE = 10 * 60 * 1000;

// RSS 缓存过期时间（毫秒）- 15分钟（但离线时无限容忍）
var RSS_CACHE_MAX_AGE = 15 * 60 * 1000;

// 外部资源缓存过期时间（毫秒）- 30分钟（离线无限容忍）
var EXTERNAL_CACHE_MAX_AGE = 30 * 60 * 1000;
var EXTERNAL_CACHE_NAME = 'ntx-external-v' + VERSION;

// 需要预加载的 RSS 端点
var RSS_PREFETCH_PATHS = ['/hybrid'];

// 标记是否有过写操作（POST/PUT/DELETE/PATCH），用于决定是否强制刷新所有 API
var hasMutation = false;

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name.startsWith('ntx-') && 
            name !== CACHE_NAME && 
            name !== API_CACHE_NAME &&
            name !== EXTERNAL_CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      // 预加载 RSS 数据
      prefetchRss();
    })
  );
});

// 预加载 RSS 数据（用户进入时提前缓存，提升体验）
function prefetchRss() {
  RSS_PREFETCH_PATHS.forEach(function(path) {
    var fakeUrl = 'https://' + FAKE_API_HOST + FAKE_RSS_PATH + path;
    var targetUrl = RSS_TARGET + path;
    
    console.log('[SW] Prefetching RSS:', targetUrl);
    
    fetch(targetUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    }).then(function(response) {
      if (response.ok) {
        var responseHeaders = new Headers(response.headers);
        responseHeaders.set('sw-cached-at', Date.now().toString());
        var cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
        
        return caches.open(API_CACHE_NAME).then(function(cache) {
          cache.put(new Request(fakeUrl), cachedResponse);
          console.log('[SW] RSS prefetched:', path);
        });
      }
    }).catch(function(err) {
      console.log('[SW] RSS prefetch failed:', path, err);
    });
  });
}

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  if (!url.protocol.startsWith('http')) return;

  var proxyInfo = getProxyUrl(url);
  if (proxyInfo) {
    // 检测是否是写操作
    var isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].indexOf(request.method) !== -1;
    
    if (isMutation) {
      // 写操作：标记全局 mutation，直接代理不缓存
      hasMutation = true;
      event.respondWith(proxyRequest(request, proxyInfo.target));
    } else {
      // 读操作：使用 SWR 策略
      event.respondWith(swrProxyRequest(request, proxyInfo));
    }
    return;
  }

  if (request.method !== 'GET') return;

  // 外部资源缓存（任意外部域名的静态资源）
  if (url.origin !== self.location.origin && /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(externalCacheRequest(request));
    return;
  }

  if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|css|js)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});

function getProxyUrl(url) {
  if (url.hostname === FAKE_API_HOST && url.pathname.startsWith(FAKE_API_PATH + '/')) {
    var path = url.pathname.substring(FAKE_API_PATH.length);
    return { target: API_TARGET + path + url.search, type: 'api', path: path };
  }
  
  if (url.hostname === FAKE_API_HOST && url.pathname.startsWith(FAKE_RSS_PATH + '/')) {
    var path = url.pathname.substring(FAKE_RSS_PATH.length);
    return { target: RSS_TARGET + path + url.search, type: 'rss', path: path };
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

// 外部资源缓存请求（如 assets.ntxdao.com）
// 30分钟缓存，过期后优先返回缓存+后台更新，离线无限容忍
function externalCacheRequest(request) {
  var cacheKey = new Request(request.url);
  
  return caches.open(EXTERNAL_CACHE_NAME).then(function(cache) {
    return cache.match(cacheKey).then(function(cachedResponse) {
      // 检查缓存是否过期
      var cacheExpired = false;
      var cacheAge = 0;
      if (cachedResponse) {
        var cachedDate = cachedResponse.headers.get('sw-cached-at');
        if (cachedDate) {
          cacheAge = Date.now() - parseInt(cachedDate, 10);
          cacheExpired = cacheAge > EXTERNAL_CACHE_MAX_AGE;
        }
      }
      
      console.log('[SW] External cache lookup:', request.url,
        'found:', !!cachedResponse,
        'expired:', cacheExpired,
        'age:', Math.round(cacheAge / 1000) + 's');
      
      var fetchPromise = fetch(request).then(function(networkResponse) {
        if (networkResponse.ok) {
          // 缓存时添加时间戳
          var responseHeaders = new Headers(networkResponse.headers);
          responseHeaders.set('sw-cached-at', Date.now().toString());
          var cachedResponseToStore = new Response(networkResponse.clone().body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: responseHeaders
          });
          cache.put(cacheKey, cachedResponseToStore);
        }
        return networkResponse;
      }).catch(function(err) {
        console.error('[SW] External fetch error:', err);
        // 离线时返回缓存（无限容忍）
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Offline', { status: 503 });
      });
      
      // 有缓存就立即返回（不管过期没），后台更新
      if (cachedResponse) {
        fetchPromise; // 后台静默更新
        return cachedResponse;
      }
      
      // 无缓存，等待网络
      return fetchPromise;
    });
  });
}

// SWR (Stale-While-Revalidate) 代理请求
// API: 缓存 10 分钟，过期后必须等网络（离线回退缓存）
// RSS: 缓存 15 分钟，过期后也优先返回缓存（后台更新），离线无限容忍
function swrProxyRequest(originalRequest, proxyInfo) {
  var targetUrl = proxyInfo.target;
  var isRss = proxyInfo.type === 'rss';
  var maxAge = isRss ? RSS_CACHE_MAX_AGE : API_CACHE_MAX_AGE;
  var cacheKey = new Request(originalRequest.url); // 用原始 URL 作为缓存 key
  
  // RSS 不受 mutation 影响
  var needsFreshData = !isRss && hasMutation;
  
  // 读取后清除 mutation 标记（只影响第一次读取）
  if (needsFreshData) {
    hasMutation = false;
  }
  
  return caches.open(API_CACHE_NAME).then(function(cache) {
    return cache.match(cacheKey).then(function(cachedResponse) {
      // 检查缓存是否过期
      var cacheExpired = false;
      var cacheAge = 0;
      if (cachedResponse) {
        var cachedDate = cachedResponse.headers.get('sw-cached-at');
        if (cachedDate) {
          cacheAge = Date.now() - parseInt(cachedDate, 10);
          cacheExpired = cacheAge > maxAge;
        } else {
          // 没有时间戳的旧缓存，视为过期
          cacheExpired = true;
        }
      }
      
      console.log('[SW] Cache lookup:', originalRequest.url, 
        'type:', proxyInfo.type,
        'found:', !!cachedResponse, 
        'expired:', cacheExpired,
        'age:', Math.round(cacheAge / 1000) + 's');
      
      // 构建网络请求
      var headers = new Headers();
      originalRequest.headers.forEach(function(value, key) {
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'referer') {
          headers.append(key, value);
        }
      });
      
      var fetchPromise = fetch(targetUrl, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'omit'
      }).then(function(networkResponse) {
        // 只缓存成功的响应
        if (networkResponse.ok) {
          console.log('[SW] Caching response for:', originalRequest.url);
          // 克隆响应并添加缓存时间戳
          var responseHeaders = new Headers(networkResponse.headers);
          responseHeaders.set('sw-cached-at', Date.now().toString());
          var cachedResponseToStore = new Response(networkResponse.clone().body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: responseHeaders
          });
          cache.put(cacheKey, cachedResponseToStore);
        }
        return networkResponse;
      }).catch(function(err) {
        console.error('[SW] SWR network error:', err);
        // 网络失败，如果有缓存就返回缓存
        if (cachedResponse) {
          return cachedResponse;
        }
        // 无缓存，返回离线错误
        return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      });
      
      // SWR 策略：
      // API:
      //   - 有 mutation 标记 → 等待网络
      //   - 无缓存 → 等待网络
      //   - 缓存过期（超过10分钟）→ 等待网络（离线时回退缓存）
      //   - 有新鲜缓存 → 立即返回，后台静默更新
      // RSS:
      //   - 无缓存 → 等待网络
      //   - 有缓存（不管是否过期）→ 立即返回，后台更新（离线无限容忍）
      
      if (isRss) {
        // RSS: 只要有缓存就立即返回，后台更新
        if (cachedResponse) {
          // 后台静默更新（不阻塞）
          fetchPromise;
          return cachedResponse;
        }
        // 无缓存，等待网络
        return fetchPromise;
      }
      
      // API: 严格的过期策略
      if (needsFreshData || !cachedResponse || cacheExpired) {
        return fetchPromise;
      }
      
      // 有新鲜缓存（10分钟内）：立即返回缓存，后台更新
      // 注意：这里不 await fetchPromise，让它在后台执行
      return cachedResponse;
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
