/* Siyer Atlas Service Worker v1.0 */
const CACHE_NAME = 'siyer-atlas-v4';
const BASE = '/siyer-atlas/';

/* Assets to pre-cache on install */
const PRECACHE = [
  BASE,
  `${BASE}manifest.json`,
  `${BASE}favicon.svg`,
];

/* Cache-first patterns (static assets) */
const CACHE_FIRST = [
  /\.(?:js|css|woff2?|ttf|otf)$/,
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

/* Network-first patterns (data that may update) */
const NETWORK_FIRST = [
  /\/data\/.*\.json$/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET */
  if (request.method !== 'GET') return;

  /* Skip chrome-extension, etc. */
  if (!url.protocol.startsWith('http')) return;

  /* Network-first for JSON data */
  if (NETWORK_FIRST.some((re) => re.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Cache-first for static assets */
  if (CACHE_FIRST.some((re) => re.test(url.pathname) || re.test(url.href))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* Navigation requests → network with fallback to cached index */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(BASE))
    );
    return;
  }

  /* Default: network with cache fallback */
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
