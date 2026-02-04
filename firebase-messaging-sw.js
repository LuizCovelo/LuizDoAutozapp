importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAbMHvsKgPIsopW_vSrPV7Io7bVbqWd4h0",
  authDomain: "luiz-do-autoapp-pwa-app.firebaseapp.com",
  projectId: "luiz-do-autoapp-pwa-app",
  storageBucket: "luiz-do-autoapp-pwa-app.firebasestorage.app",
  messagingSenderId: "990638382810",
  appId: "1:990638382810:web:8442eb4df7da3da320cfe3",
  measurementId: "G-H407LF08EC"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] Mensagem recebida em segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
