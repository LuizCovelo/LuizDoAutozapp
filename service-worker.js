/* ===============================================================
   service-worker.js — Luiz do AutoZapp
   Cache offline (Cache First) + Firebase Messaging (background)
   =============================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

/* ---------------------------------------------------------------
   1. CACHE OFFLINE
--------------------------------------------------------------- */
const CACHE_NAME = 'luiz-autozapp-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* Install: pré-cacheia os arquivos estáticos */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* Activate: remove caches antigos e assume controle imediato */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: Cache First → Network Fallback */
self.addEventListener('fetch', event => {
  /* Ignora requisições não-GET e chamadas de API externas */
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Ignora requisições cross-origin (Firebase, Google Fonts, etc.) */
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log('[SW] Servindo do cache:', event.request.url);
        return cached;
      }

      return fetch(event.request)
        .then(networkResponse => {
          /* Cacheia dinamicamente apenas respostas válidas */
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          /* Fallback offline: retorna index.html para navegação */
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

/* ---------------------------------------------------------------
   2. FIREBASE MESSAGING (push em segundo plano)
--------------------------------------------------------------- */
firebase.initializeApp({
  apiKey: "AIzaSyAbMHvsKgPIsopW_vSrPV7Io7bVbqWd4h0",
  authDomain: "luiz-do-autoapp-pwa-app.firebaseapp.com",
  projectId: "luiz-do-autoapp-pwa-app",
  storageBucket: "luiz-do-autoapp-pwa-app.appspot.com",
  messagingSenderId: "990638382810",
  appId: "1:990638382810:web:8442eb4df7da3da320cfe3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[FCM] Background message:', payload);

  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || 'Luiz do AutoZapp',
    {
      body: notification.body || 'Nova notificação recebida',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: notification.click_action || '/'
      }
    }
  );
});

/* Ao clicar na notificação, abre/foca a aba do site */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
