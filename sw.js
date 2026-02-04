/* ===============================
   Service Worker - Luiz do AutoZapp
   PWA + Firebase Cloud Messaging
================================ */

const CACHE_NAME = 'luiz-autozapp-cache-v1';
const OFFLINE_URL = '/';

// Arquivos essenciais para cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

/* ===============================
   INSTALL
================================ */
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Força ativação imediata
  self.skipWaiting();
});

/* ===============================
   ACTIVATE
================================ */
self.addEventListener('activate', event => {
  console.log('[SW] Ativado');

  event.waitUntil(
    Promise.all([
      // Remove caches antigos
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      ),
      // Assume controle imediato da página
      self.clients.claim()
    ])
  );
});

/* ===============================
   FETCH (offline-first simples)
================================ */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ===============================
   PUSH NOTIFICATION (FCM)
================================ */
self.addEventListener('push', event => {
  console.log('[SW] Push recebido');

  let data = {
    title: 'Luiz do AutoZapp',
    body: 'Você recebeu uma nova notificação',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    data = { ...data, ...event.data.json() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data
    })
  );
});

/* ===============================
   CLICK NA NOTIFICAÇÃO
================================ */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
