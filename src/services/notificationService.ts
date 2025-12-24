export const notificationService = {
    // Check permission
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    // Send immediate notification
    send(title: string, body?: string, tag?: string) {
        if (Notification.permission === 'granted') {
            // Use ServiceWorker if available (better for PWA) - fallback to new Notification
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: '/icon-symbol.png', // Ensure this exists
                        badge: '/icon-symbol.png',
                        vibrate: [200, 100, 200],
                        tag,
                        renotify: true
                    });
                });
            } else {
                new Notification(title, {
                    body,
                    icon: '/icon-symbol.png',
                    tag,
                    renotify: true
                });
            }
        }
    },

    // Schedule a local check (Client-side poller)
    // Real scheduling would use Push API, but client-side poller works if app is open
    // This is handled by the consumer (Dashboard/Context) calling check()
};
