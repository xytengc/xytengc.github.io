/* ===========================================================
 * sw.js (优化版)
 * ========================================================== */
const CACHE_NAMESPACE = 'main-';
const CACHE = CACHE_NAMESPACE + 'precache-then-runtime';
const PRECACHE_LIST = ["./", "./offline.html", 
  "./js/jquery.min.js", 
  "./js/bootstrap.min.js", 
  "./js/hux-blog.min.js", 
  "./js/snackbar.js", 
  "./img/icon_wechat.png", 
  "./img/狸猫.png", 
  "./img/home-bg.jpg", 
  "./img/404-bg.jpg", 
  "./css/hux-blog.min.css", 
  "./css/bootstrap.min.css"];
const HOSTNAME_WHITELIST = [self.location.hostname, "huangxuan.me", "yanshuo.io", "cdnjs.cloudflare.com"];

// 工具函数：日志
const logger = {
  log: (msg) => console.log(`[SW] ${new Date().toISOString()} - ${msg}`),
  error: (msg, err) => console.error(`[SW] ${new Date().toISOString()} - ${msg}`, err)
};

// 工具函数：缓存击穿 URL
const getCacheBustingUrl = (req) => {
  const now = Date.now();
  const url = new URL(req.url);
  url.protocol = self.location.protocol;
  // 仅非静态资源加缓存击穿
  const isStatic = /\.(js|css|png|jpg|jpeg|gif|ico|woff2|woff|ttf)$/i.test(url.pathname);
  if (!isStatic) {
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  }
  return url.href;
};

// 工具函数：判断导航请求
const isNavigationReq = (req) => (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html')));

// 工具函数：缓存大小限制
const trimCache = async (cacheName, maxSize = 50) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxSize);
  }
};

// 安装事件
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE_LIST))
      .then(() => {
        logger.log('预缓存成功');
        return self.skipWaiting();
      })
      .catch(err => {
        logger.error('预缓存失败', err);
        self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => 
        cacheNames.filter(name => !name.startsWith(CACHE_NAMESPACE))
                  .map(name => caches.delete(name))
      ),
      self.clients.claim()
    ]).then(() => logger.log('SW 激活完成，旧缓存已清理'))
  );
});

// Fetch 事件
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (HOSTNAME_WHITELIST.indexOf(url.hostname) === -1) return;

  event.respondWith(
    (async () => {
      try {
        // 优先请求网络（带缓存击穿）
        const fetchResponse = await fetch(getCacheBustingUrl(event.request), { cache: "no-store" });
        // 更新缓存（仅成功响应）
        if (fetchResponse.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, fetchResponse.clone());
          await trimCache(CACHE); // 限制缓存大小
        }
        return fetchResponse;
      } catch (err) {
        // 网络失败时读取缓存
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || caches.match('offline.html');
      }
    })()
  );
});