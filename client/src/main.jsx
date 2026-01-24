import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { registerSW } from 'virtual:pwa-register'
import { initializeNotifications, checkForAppUpdate } from './services/notificationService.js'

// PWA fix: Clear service worker cache on app start if needed (iOS and Desktop)
const isPWA = window.navigator.standalone || 
              window.matchMedia('(display-mode: standalone)').matches;

if (isPWA && 'caches' in window) {
  // Check if we need to clear stale caches
  const cacheVersion = localStorage.getItem('sw-cache-version');
  const currentVersion = '2.1'; // Increment when making breaking changes
  
  if (cacheVersion !== currentVersion) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.includes('workbox') || cacheName.includes('static')) {
          caches.delete(cacheName).then(() => {
            console.log('Cleared stale cache:', cacheName);
          });
        }
      });
      localStorage.setItem('sw-cache-version', currentVersion);
    });
  }
}

// Register service worker for PWA with aggressive update strategy
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New content available");
    // Don't auto-reload on iOS - let user control it
    // iOS Safari can crash with aggressive reloads
    if (Notification.permission === "granted") {
      try {
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
      } catch (error) {
        console.error('Notification error:', error);
        // Fallback: show in-app prompt
        if (confirm("A new version of Opticore is available. Update now?")) {
          updateSW(true);
        }
      }
    } else {
      // Fallback: show in-app prompt
      if (confirm("A new version of Opticore is available. Update now?")) {
        updateSW(true);
      }
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
  onRegistered(registration) {
    console.log('SW Registered: ', registration);
    
    // Check for updates less frequently to avoid iOS crashes
    // Only check when app becomes visible, not on interval
    if (registration) {
      let updateCheckInProgress = false;
      
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !updateCheckInProgress) {
          updateCheckInProgress = true;
          registration.update()
            .catch(() => {
              // Ignore update errors
            })
            .finally(() => {
              updateCheckInProgress = false;
            });
        }
      });
    }
  },
  onRegisterError(error) {
    console.log('SW registration error', error);
  },
});

// Initialize notifications when app loads (only for installed PWAs)
const isInstalledPWA = window.navigator.standalone || 
                       window.matchMedia('(display-mode: standalone)').matches;

if (navigator.serviceWorker && isInstalledPWA) {
  navigator.serviceWorker.ready.then(() => {
    try {
      initializeNotifications();
      checkForAppUpdate();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }).catch((error) => {
    console.error('Service worker ready error:', error);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
