/**
 * Notification Service for Push Notifications
 * Handles subscription, permission requests, and notification display
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("Notification permission denied");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  try {
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return null;
    }

    // Request notification permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn("Notification permission not granted");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ""
      ),
    });

    // Send subscription to backend
    const response = await fetch(`${API_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription");
    }

    console.log("Successfully subscribed to push notifications");
    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Remove subscription from backend
      await fetch(`${API_URL}/notifications/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(subscription),
      });

      console.log("Successfully unsubscribed from push notifications");
    }
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
  }
}

// Check if user is subscribed
export async function isSubscribed() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
}

// Initialize notifications (call on app load)
export async function initializeNotifications() {
  try {
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    // Check if already subscribed
    const subscribed = await isSubscribed();
    if (subscribed) {
      console.log("Already subscribed to push notifications");
      return true;
    }

    // Auto-subscribe if permission is granted
    if (Notification.permission === "granted") {
      await subscribeToPushNotifications();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check for app updates
export async function checkForAppUpdate() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for updates
    await registration.update();
    
    // Listen for new service worker
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker available
          showUpdateNotification();
        }
      });
    });
  } catch (error) {
    console.error("Error checking for app update:", error);
  }
}

// Show update notification
function showUpdateNotification() {
  if (Notification.permission === "granted") {
    const notification = new Notification("App Update Available", {
      body: "A new version of Opticore is available. Click to update now.",
      icon: "/pwa-192.png",
      badge: "/pwa-192.png",
      tag: "app-update",
      requireInteraction: true,
      actions: [
        { action: "update", title: "Update Now" },
        { action: "dismiss", title: "Later" },
      ],
    });

    notification.onclick = () => {
      window.location.reload();
      notification.close();
    };

    // Handle action clicks
    notification.addEventListener("click", (event) => {
      if (event.action === "update") {
        window.location.reload();
      }
      notification.close();
    });
  }
}
