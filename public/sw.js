const CACHE = 'glassline-shell-v3';
const SHELL = ['/manifest.webmanifest', '/icon.svg', '/assets/data-landscape.avif', '/assets/data-landscape.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/index.html', { cache: 'reload' });
    const html = await response.clone().text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await Promise.all([cache.put('/', response.clone()), cache.put('/index.html', response)]);
    await cache.addAll([...SHELL, ...builtAssets]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter((url) => {
    try { return new URL(url).origin === location.origin; } catch { return false; }
  });
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(urls)));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(async () => {
      if (event.request.mode === 'navigate') return (await caches.match('/index.html')) || Response.error();
      return Response.error();
    });
  }));
});
