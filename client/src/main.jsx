import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { registerSW } from 'virtual:pwa-register'
import { initializeNotifications, checkForAppUpdate } from './services/notificationService.js'

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification
    if (Notification.permission === "granted") {
      new Notification("App Update Available", {
        body: "A new version of Opticore is available. Click to update now.",
        icon: "/pwa-192.png",
        badge: "/pwa-192.png",
        tag: "app-update",
        requireInteraction: true,
        actions: [
          { action: "update", title: "Update Now" },
          { action: "dismiss", title: "Later" },
        ],
      }).onclick = () => {
        updateSW(true); // Reload the app
      };
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

// Initialize notifications when app loads
if (navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(() => {
    initializeNotifications();
    checkForAppUpdate();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
