// Give the service worker access to Firebase Messaging.
// Note: We use the "compat" libraries here for simpler SW support without a bundler.
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. Initialize Firebase App (Compat)
// Hardcoded config is required here because SW runs outside the Vite build context.
const firebaseConfig = {
    apiKey: "AIzaSyA2SeEaod4ciM0oUufN-C0bT73MMr5jI8Y",
    authDomain: "lifehub-d322e.firebaseapp.com",
    projectId: "lifehub-d322e",
    storageBucket: "lifehub-d322e.appspot.com",
    messagingSenderId: "868390342036",
    appId: "1:868390342036:web:0cc18f05ee8d2065535381"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-v2.png',
        badge: '/icon-v2.png',
        tag: 'lifehub-notification',
        renotify: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
