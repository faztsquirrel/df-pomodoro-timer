var CACHE_NAME = 'pomodoro-cache';
var urlsToCache = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'beep.wav',
  'browserconfig.xml',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'index.html',
  'mstile-150x150.png',
  'pomodoro.css',
  'pomodoro.js',
  'pomodoro.webmanifest',
  'safari-pinned-tab.svg',
  'service_worker.js',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://cdnjs.cloudflare.com/ajax/libs/typicons/2.0.9/typicons.css',
  'https://cdn.jsdelivr.net/npm/reset-css@4.0.1/reset.min.css'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
