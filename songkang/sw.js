self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  return; // Lewatkan semua request ke jaringan
});
