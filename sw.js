/* ===========================================================
 * sw.js
 * ========================================================== */
const CACHE_PREFIX = 'xyteng-blog-';
const CACHE_VERSION = 'v2';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

const PRECACHE_LIST = [
  '/',
  '/offline.html',
  '/css/bootstrap.min.css',
  '/css/hux-blog.min.css',
  '/js/jquery.min.js',
  '/js/bootstrap.min.js',
  '/js/hux-blog.min.js',
  '/js/snackbar.js',
  '/img/icon_wechat.png'
];

const STATIC_ASSET_EXT = /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff2|woff|ttf|webp)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_LIST))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match('/offline.html');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (STATIC_ASSET_EXT.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});