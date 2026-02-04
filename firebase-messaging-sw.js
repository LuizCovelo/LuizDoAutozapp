/* Firebase Messaging Service Worker */

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAbMHvsKgPIsopW_vSrPV7Io7bVbqWd4h0",
  authDomain: "luiz-do-autoapp-pwa-app.firebaseapp.com",
  projectId: "luiz-do-autoapp-pwa-app",
  storageBucket: "luiz-do-autoapp-pwa-app.appspot.com",
  messagingSenderId: "990638382810",
  appId: "1:990638382810:web:8442eb4df7da3da320cfe3"
});

const messaging = firebase.messaging();

/* Push em segundo plano */
messaging.onBackgroundMessage(payload => {
  console.log('[FCM] Background message:', payload);

  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || 'Luiz do AutoZapp',
    {
      body: notification.body || 'Nova notificação recebida',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: {
        url: '/'
      }
    }
  );
});

/* Assume controle imediatamente */
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
