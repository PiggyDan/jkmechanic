// Garage 84 service worker: makes the site installable and shows an offline page when there
// is no connection. Pages, API calls (bookings, chats, admin) and assets always come from the
// network, so nothing is ever served stale.
const CACHE = 'g84-offline-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  // The offline page is a nice extra: if caching fails (private mode, full storage),
  // install anyway so the site stays installable.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(async () => (await caches.match(OFFLINE_URL).catch(() => null)) ?? Response.error()),
  )
})
