// Service Worker for offline functionality
const CACHE_NAME = 'weather-app-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/WF.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('cdnjs.cloudflare.com')) {
    
    // For API requests, try network first, then cache
    if (event.request.url.includes('api.openweathermap.org') || 
        event.request.url.includes('api.opencagedata.com')) {
      
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response
            const resClone = response.clone();
            
            // Open cache
            caches.open(CACHE_NAME)
              .then(cache => {
                // Add response to cache
                cache.put(event.request, resClone);
              });
            return response;
          }).catch(() => {
            // If network fails, try to get from cache
            return caches.match(event.request);
          })
      );
    } else {
      // For static assets, try cache first, then network
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Return cache hit if found
            if (response) {
              return response;
            }
            
            // Otherwise fetch from network
            return fetch(event.request)
              .then(response => {
                // Return the response immediately
                if (!response || response.status !== 200 || response.type !== 'basic') {
                  return response;
                }
                
                // Clone the response
                const responseToCache = response.clone();
                
                // Add to cache for next time
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                
                return response;
              });
          })
      );
    }
  }
});

// Listen for messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for deferred requests when offline
self.addEventListener('sync', event => {
  if (event.tag === 'sync-weather-data') {
    event.waitUntil(syncWeatherData());
  }
});

// Function to handle background sync
async function syncWeatherData() {
  try {
    // Get deferred requests from IndexedDB
    const deferredRequests = await getDBData('deferred-requests');
    
    if (!deferredRequests || deferredRequests.length === 0) {
      return;
    }
    
    // Process each deferred request
    for (const request of deferredRequests) {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    // Clear deferred requests
    await clearDBStore('deferred-requests');
    
    // Notify client that sync is complete
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_COMPLETED'
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helper functions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WeatherAppDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('deferred-requests')) {
        db.createObjectStore('deferred-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getDBData(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function clearDBStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
} 