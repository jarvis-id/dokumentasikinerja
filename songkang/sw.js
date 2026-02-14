self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Biarkan trafik lewat tanpa caching agar selalu update
  e.respondWith(fetch(e.request));
});
