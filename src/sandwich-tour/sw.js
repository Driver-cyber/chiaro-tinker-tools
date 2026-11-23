/* =====================================================================
   Sandwich Tour · service worker · v1
   The shell works with one bar of signal in a deli corner.

   - Caches the SHELL only (this page, manifest, icons). Never touches data:
     entries live in localStorage, photos in IndexedDB, neither passes here.
   - SCOPE IS ./ — a worker at /sandwich-tour/sw.js controls /sandwich-tour/
     ONLY. It must never reach up and intercept CTT at the origin root.
   - Navigations are NETWORK-FIRST, so a fresh deploy arrives silently on the
     next online open; offline falls back to the cached page.
   - Bump CACHE on release-worthy edits or the old page sticks around.
   ===================================================================== */
const CACHE = 'sandwich-tour-v1';
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
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sandwich-tour-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // never intercept anything off-origin
  if (!url.pathname.startsWith('/sandwich-tour/')) return;    // belt and braces: never CTT's files
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
