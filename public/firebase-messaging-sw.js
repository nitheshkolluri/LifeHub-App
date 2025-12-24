import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// 1. Initialize Firebase App in Service Worker
// NOTE: We cannot use import.meta.env or window.env here easily without complex build steps.
// However, the Service Worker runs in a separate thread.
// We must hardcode the config OR use a script import trick.
// For Simplicity & Reliability in this specific PWA Context:
// We will use "importScripts" to load the env-config.js if possible, or just hardcode for now to ensure it works, 
// BUT better pattern is to pass config from Client to SW via postMessage, or use the standard pattern.

// Standard Pattern:
// The SW needs the config.
// Let's use the same config as the main app.
// Since this is a static file in public/, it doesn't get built by Vite.
// We need to fetch the config.

const firebaseConfig = {
    apiKey: "AIzaSyA2SeEaod4ciM0oUufN-C0bT73MMr5jI8Y", // Public
    authDomain: "lifehub-d322e.firebaseapp.com",
    projectId: "lifehub-d322e",
    storageBucket: "lifehub-d322e.appspot.com",
    messagingSenderId: "868390342036",
    appId: "1:868390342036:web:0cc18f05ee8d2065535381"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-symbol.png',
        badge: '/icon-symbol.png',
        tag: payload.notification.tag || 'lifehub-notification',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
