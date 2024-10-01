const CACHE_NAME = 'aframe-app-cache-v1';
const urlsToCache = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    // Only cache GET requests, skip others (e.g., POST)
    return;
  }

  // Parse the URL of the request
  const requestUrl = new URL(event.request.url);

  // Check if the URL contains the parameter: ?cache=true
  if (requestUrl.searchParams.has('cache')) {
    // Perform caching logic only for URLs with the specific parameter
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response && !requestUrl.searchParams.has('refresh')) {
          return response;  // Return cached version if available
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;  // Skip caching non-200 responses or non-basic types
          }

          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Cache the response
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  } else {
    // If the URL doesn't contain the parameter, just fetch normally
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
