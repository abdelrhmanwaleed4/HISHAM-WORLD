/* global self, caches, fetch, URL */
// Versioned cache: remove the old site's stale HTML and image bundles on upgrade.
const CACHE = 'hisham-world-gh-pages-v1'
const BASE = new URL(self.registration.scope).pathname
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'images/rezk-portrait.webp', 'images/rezk-banner.webp'].map(path => BASE + path)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('hisham-world-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Stream audio straight from the server. Media byte-range requests (206)
  // should not be put into Cache Storage, or seeking may fail.
  if (url.pathname.startsWith(BASE + 'audio/')) return

  // Documents are network-first to avoid showing an old UI after a deploy.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone()
        void caches.open(CACHE).then(cache => cache.put(BASE + 'index.html', copy))
      }
      return response
    }).catch(async () => (await caches.match(BASE + 'index.html')) || Response.error()))
    return
  }

  // Static assets are cached, but a missing image/JS bundle never gets HTML as its response.
  event.respondWith(caches.match(request).then(async cached => {
    if (cached) return cached
    try {
      const response = await fetch(request)
      if (response.ok && response.type === 'basic') {
        const copy = response.clone()
        void caches.open(CACHE).then(cache => cache.put(request, copy))
      }
      return response
    } catch {
      return Response.error()
    }
  }))
})
