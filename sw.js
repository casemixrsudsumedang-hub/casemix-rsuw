// Service worker Buku Casemix: jaringan dulu (data selalu terbaru), cadangan dari cache saat offline.
var CACHE = 'buku-casemix-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // data.csv dipanggil dengan ?t=waktu; simpan di cache tanpa bagian itu
  var key = /data\.csv$/.test(url.pathname) ? url.origin + url.pathname : req.url;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(key, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (hit) { return hit || caches.match(url.origin + url.pathname) || Response.error(); });
    })
  );
});
