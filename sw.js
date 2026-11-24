// سرویس‌ورکر سفارش‌گیر آلاز پلاستیک — برای تغییر در فایل‌ها، شماره‌ی نسخه را بالا ببرید
const CACHE = 'alaz-v3';
const ASSETS = ['./', './index.html', './order-app.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(a)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  const isDoc = r.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isDoc) {   // صفحه: اول اینترنت (برای آپدیت)، اگر نبود از حافظه
    e.respondWith(
      fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(r, c)); return res; })
        .catch(() => caches.match(r).then(m => m || caches.match('./')))
    );
    return;
  }
  // عکس‌ها، فونت و بقیه: اول حافظه، بعد اینترنت و ذخیره
  e.respondWith(
    caches.match(r).then(m => m || fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(r, c)); }
      return res;
    }).catch(() => m))
  );
});
