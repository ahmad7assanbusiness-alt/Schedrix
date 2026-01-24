import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { registerSW } from 'virtual:pwa-register'
import { initializeNotifications, checkForAppUpdate } from './services/notificationService.js'

// Register service worker for PWA with aggressive update strategy
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New content available, reloading...");
    // For iOS PWAs, force immediate reload without user interaction
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      updateSW(true); // Force immediate update for PWA
    } else {
      // Show update notification for browser users
      if (Notification.permission === "granted") {
        const notification = new Notification("App Update Available", {
          body: "A new version of Opticore is available. Click to update now.",
          icon: "/pwa-192.png",
          badge: "/pwa-192.png",
          tag: "app-update",
          requireInteraction: true,
        });
        
        notification.onclick = () => {
          updateSW(true);
          notification.close();
        };
      } else {
        // Fallback: show in-app prompt
        if (confirm("A new version of Opticore is available. Update now?")) {
          updateSW(true);
        }
      }
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
  onRegistered(registration) {
    console.log('SW Registered: ', registration);
    
    // Check for updates every 30 seconds when app is active
    if (registration) {
      setInterval(() => {
        registration.update().catch(() => {
          // Ignore update errors
        });
      }, 30000);
    }
  },
  onRegisterError(error) {
    console.log('SW registration error', error);
  },
});

// Initialize app services
import { UpdateChecker } from './utils/updateChecker.js';

// Initialize notifications when app loads
if (navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(() => {
    initializeNotifications();
    checkForAppUpdate();
  });
}

// Start aggressive update checking for PWA
UpdateChecker.startPeriodicChecks();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
