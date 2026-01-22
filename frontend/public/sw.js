// sw.js - Service Worker for ARG Academy
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

let reminderTimeout = null;

self.addEventListener('message', (event) => {
    if (event.data.type === 'SCHEDULE_REMINDER') {
        const delay = event.data.delay || 5000; // 5 seconds default

        // Clear any existing timeout
        if (reminderTimeout) {
            clearTimeout(reminderTimeout);
        }

        reminderTimeout = setTimeout(() => {
            self.registration.showNotification('ARG Academy', {
                body: '¡No te rindas! Completa las actividades para seguir subiendo de nivel.',
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'activity-reminder',
                renotify: true,
                data: { url: '/dashboard' }
            });
            reminderTimeout = null;
        }, delay);
    }

    if (event.data.type === 'CANCEL_REMINDER') {
        if (reminderTimeout) {
            clearTimeout(reminderTimeout);
            reminderTimeout = null;
        }
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
