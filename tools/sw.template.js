/* Service Worker: macht die Lern-App offline nutzbar.
 * Automatisch erzeugt aus tools/sw.template.js (tools/build_sw.py) – nicht von Hand ändern. */
const CACHE = 'lemmalab-__VERSION__';
const FILES = __FILES__;
const CORE = ['index.html', 'fach.js', 'app.js', 'data.js', 'logic.js', 'physik.js', 'informatik.js', 'linalg.js', 'account.js'];   // Netz zuerst (für Updates), sonst Cache

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => (k.startsWith('lemmalab-') || k.startsWith('ana1-')) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // GitHub-API (Abgleich) nicht anfassen
  if (url.searchParams.has('check')) return;                   // Update-Prüfung immer übers Netz
  const path = url.pathname.split('/').pop() || 'index.html';
  const isCore = req.mode === 'navigate' || CORE.includes(path);
  if (isCore) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
        return res;
      }).catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req, { ignoreSearch: true }))
    );
  } else {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
