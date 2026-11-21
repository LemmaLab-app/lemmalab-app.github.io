/* Service Worker: macht die Lern-App offline nutzbar.
 * Automatisch erzeugt aus tools/sw.template.js (tools/build_sw.py) – nicht von Hand ändern. */
const CACHE = 'lemmalab-__VERSION__';
const FILES = __FILES__;
// Kerndateien: index.html und alle eigenen Skripte (alles .js ausserhalb von vendor/) – versioniert über ?v=

// install: Dateien immer frisch vom Server (nie eine alte Kopie aus dem Browser-Cache)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  const isCore = req.mode === 'navigate' || path === 'index.html' || (path.endsWith('.js') && !url.pathname.includes('/vendor/') && path !== 'sw.js');
  if (isCore) {
    const put = (key, res) => { if (res.ok && !res.redirected) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return res; };
    const net = () => fetch(req.mode === 'navigate' ? req.url : req, { cache: 'no-cache' }).then(res => res.redirected ? fetch(req) : res);
    if (req.mode === 'navigate' && !url.searchParams.has('v')) {
      // Seitenaufruf (Start, Fachwechsel): sofort aus dem Speicher, im Hintergrund auffrischen.
      // Neue Versionen erkennt die App selbst (checkUpdate) und lädt dann mit ?v= neu.
      e.respondWith(caches.match('index.html').then(hit => {
        const fresh = net().then(res => put('index.html', res));
        if (hit) { e.waitUntil(fresh.catch(() => { })); return hit; }
        return fresh;
      }));
    } else if (req.mode === 'navigate') {
      // Neuladen nach einem Update (?v=…): direkt vom Server
      e.respondWith(net().then(res => put('index.html', res)).catch(() => caches.match('index.html')));
    } else {
      // Kerndateien tragen ?v=<Version>: exakt diese Version aus dem Speicher, sonst vom Server
      e.respondWith(caches.match(req).then(hit => hit || net().then(res => put(req, res)))
        .catch(() => caches.match(req, { ignoreSearch: true })));
    }
  } else {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
