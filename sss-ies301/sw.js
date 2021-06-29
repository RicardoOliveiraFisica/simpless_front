
const staticCacheName = 'sss-diario-8';
var filesToCache = [
  '/',
  '/index.html',
  '/selectturmacham.html',
  '/selectturmanot.html',
  '/setcham.html',
  '/setnota.html',
  '/selectoption.html',
  '/selectreg.html',
  '/selectcham.html',  
  '/selectnot.html',
  '/selectdiario.html',
  '/js/main.js',
  '/js/mainIndex.js',
  '/js/mainSelectOption.js',
  '/js/mainSelectCham.js',  
  '/js/mainSelectDiario.js',
  '/js/mainSelectTurmaCham.js',
  '/js/mainSelectTurmaNot.js',
  '/js/mainSetCham.js',
  '/js/mainSetNota.js',
  '/js/print.js',
  '/css/style.css',
  '/images/sss-icon-152.png',
  '/images/sss-icon-144.png',
  '/manifest.json'
];

// Cache on install
this.addEventListener("install", event => {
  this.skipWaiting();

  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
    })
  )
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

// Clear cache on activate
this.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => (cacheName.startsWith('sss-diario-')))
          .filter(cacheName => (cacheName !== staticCacheName))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});
