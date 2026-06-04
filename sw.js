// EL FARO — Service Worker v2
// Solo cachea archivos que definitivamente existen
const CACHE = 'elfaro-v11';
const ASSETS = [
  '/elfaro-app/',
  '/elfaro-app/index.html',
  '/elfaro-app/app.js',
  '/elfaro-app/style.css',
  '/elfaro-app/manifest.json',
  '/elfaro-app/sync.js',
  '/elfaro-app/firebase-config.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('script.google.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('/elfaro-app/index.html'))
  );
});
