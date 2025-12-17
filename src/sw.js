import { precacheAndRoute } from 'workbox-precaching';

// Precaches all the files Vite generates
precacheAndRoute(self.__WB_MANIFEST);

// 1. Listen for Push Notifications (Online/Server-sent)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'To-Do Update', body: 'Check your tasks!' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
    })
  );
});

// 2. Local Notifications (Can be triggered offline via app logic)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/pwa-192x192.png',
    });
  }
});

// src/sw.js
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/') // Opens the app even if offline
  );
});