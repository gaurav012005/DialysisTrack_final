// DialysisTrack Service Worker
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `dialysistrack-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `dialysistrack-images-${CACHE_VERSION}`;
const API_CACHE = `dialysistrack-api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('dialysistrack-') &&
                            cacheName !== STATIC_CACHE &&
                            cacheName !== IMAGE_CACHE &&
                            cacheName !== API_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // API requests - Network First strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }

    // Images - Cache First strategy
    if (request.destination === 'image') {
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
        return;
    }

    // Static assets (JS, CSS, HTML) - Cache First with network fallback
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
});

// Cache First Strategy - for static assets and images
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] Cache hit:', request.url);
            return cachedResponse;
        }

        console.log('[SW] Cache miss, fetching:', request.url);
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);

        // Return offline page for navigation requests
        if (request.destination === 'document') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) {
                return offlinePage;
            }
        }

        throw error;
    }
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request, cacheName) {
    try {
        console.log('[SW] Network first for API:', request.url);
        const networkResponse = await fetch(request);

        // Cache successful API responses (with short expiration)
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] Returning cached API response');
            return cachedResponse;
        }

        // Return error response for failed API calls
        return new Response(
            JSON.stringify({
                error: 'Network error',
                message: 'You are offline. Please check your internet connection.',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Background sync for future enhancement
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-queue') {
        event.waitUntil(syncQueueData());
    }
});

async function syncQueueData() {
    // Placeholder for future background sync implementation
    console.log('[SW] Syncing queue data...');
}

// Push notifications for future enhancement
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'DialysisTrack';
    const options = {
        body: data.body || 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: data.data || {}
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
