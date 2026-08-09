/* =====================================================================
   Gertie — P1800S Build Log · service worker · v1
   The barn is the whole point: no signal, hands dirty, phone in a pocket.

   Strategy, deliberately narrow:
   - Caches the SHELL only (this page and its icons). Never touches data —
     progress lives in localStorage and never passes through here.
   - SCOPE IS ./ — a worker at /gertie/sw.js controls /gertie/ ONLY. It must
     never reach up and intercept the CTT app sitting at the origin root.
   - Navigations are NETWORK-FIRST, so a fresh deploy arrives silently on
     the next online open; offline falls back to the cached page.
   - Bump CACHE on release-worthy edits or the old page sticks around.
   ===================================================================== */
const CACHE = 'gertie-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // never intercept anything off-origin

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req))
  );
});
