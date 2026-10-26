const CACHE = 'mojidensha-20261026204823', VOICE = 'mojidensha-voice';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './manifest.webmanifest', './icon-180.png']))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== VOICE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const p = new URL(e.request.url).pathname;
  if ((p.includes('/v/') && p.endsWith('.mp3')) || (p.includes('/p/') && p.endsWith('.jpg'))) {
    e.respondWith(caches.open(VOICE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
    return;
  }
  // GitHub Pages は 10ぷん キャッシュさせるので、サーバーに かわったか たしかめてから つかう（no-cache）
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).catch(() => fetch(e.request))
    .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});