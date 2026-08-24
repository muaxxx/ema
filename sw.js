/* EM · Service Worker — يجعل الموقع قابلاً للتثبيت كتطبيق ويعمل ملء الشاشة.
   يخزّن «قشرة» الصفحة فقط (network-first) للفتح دون إنترنت؛
   لا يعترض نداءات Supabase/الـAPI (تمرّ مباشرة دائماً للبيانات الحيّة). */
const CACHE = 'em-shell-v4';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // نتعامل فقط مع فتح الصفحة نفسها (التنقّل) — network-first مع رجوع للكاش دون إنترنت
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./', copy));
        return r;
      }).catch(() => caches.match('./').then(r => r || caches.match(req)))
    );
  }
});
