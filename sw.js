/* Service worker SILAHAR: menyimpan "kerangka" aplikasi agar terbuka cepat/offline.
   Data (Apps Script, Google, Drive) TIDAK pernah disimpan di cache. */
const VERSI = 'silahar-1793505684523';
const ASET = ['./', 'index.html', 'manifest.webmanifest', 'icons/silahar-192.png', 'icons/silahar-512.png', 'icons/silahar-ios-180.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSI).then((c) => c.addAll(ASET)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('silahar-') && k !== VERSI).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // API/Google/font: langsung ke jaringan
  if (r.mode === 'navigate') { // jaringan dulu agar pembaruan cepat terlihat; cadangan: cache
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(VERSI).then((c) => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(VERSI).then((c) => c.put(r, cp)); } return res; })));
});
