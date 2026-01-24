/**
 * Service Worker Push Notification Handler
 * This file is included in the service worker to handle push events
 */

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "Opticore",
    body: "You have a new notification",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: "default",
    // iOS/Android notification center settings
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
  };

  // Parse push data
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || "Opticore",
        body: data.body || "You have a new notification",
        icon: data.icon || "/pwa-192.png",
        badge: data.badge || "/pwa-192.png",
        tag: data.tag || "default",
        data: data.data || {},
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
        vibrate: data.vibrate || [200, 100, 200],
        silent: data.silent || false,
      };
    } catch (e) {
      // If not JSON, try text
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Show notification in device notification center
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Handle action clicks
  if (event.action === "update") {
    event.waitUntil(
      clients.openWindow("/").then(() => {
        // Reload all clients
        return clients.matchAll().then((clientList) => {
          clientList.forEach((client) => {
            client.postMessage({ type: "UPDATE_APP" });
          });
        });
      })
    );
    return;
  }

  if (event.action === "dismiss") {
    return;
  }

  // Default: open the app
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle messages from the app
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("Received SKIP_WAITING message, activating new service worker");
    self.skipWaiting();
  }
});

// Force immediate activation and control of clients
self.addEventListener("install", (event) => {
  console.log("Service worker installing, skipping waiting...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating, claiming clients...");
  event.waitUntil(self.clients.claim());
});
