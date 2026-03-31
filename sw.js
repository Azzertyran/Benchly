const CACHE = 'benchly-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Installation : mise en cache des assets de base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : network first, fallback cache
self.addEventListener('fetch', e => {
  // Ne pas intercepter les requêtes Supabase et externes
  if (e.request.url.includes('supabase.co') ||
      e.request.url.includes('openstreetmap.org') ||
      e.request.url.includes('unpkg.com') ||
      e.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
