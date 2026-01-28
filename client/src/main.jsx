import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:3',message:'Starting main.jsx - imports beginning',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
// #endregion
import './index.css'
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:6',message:'CSS import completed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import App from './App.jsx'
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:9',message:'App component imported',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion
import { ThemeProvider } from './contexts/ThemeContext.jsx'
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:12',message:'ThemeProvider imported',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion
import { registerSW } from 'virtual:pwa-register'
import { initializeNotifications, checkForAppUpdate } from './services/notificationService.js'
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:16',message:'All imports completed successfully',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// PWA fix: Clear service worker cache on app start if needed (iOS and Desktop)
// Run this AFTER app loads to not block login
const isPWA = window.navigator.standalone || 
              window.matchMedia('(display-mode: standalone)').matches;
const isIOSPWA = window.navigator.standalone;

// Delay cache clearing to not interfere with login
setTimeout(() => {
  if (isPWA && 'caches' in window) {
    // Check if we need to clear stale caches
    const cacheVersion = localStorage.getItem('sw-cache-version');
    const currentVersion = '2.2'; // Increment when making breaking changes
    
    // More aggressive cache clearing for iOS
    if (cacheVersion !== currentVersion || isIOSPWA) {
      caches.keys().then((cacheNames) => {
        const deletePromises = [];
        cacheNames.forEach((cacheName) => {
          // For iOS, clear ALL caches, not just workbox/static
          if (isIOSPWA || cacheName.includes('workbox') || cacheName.includes('static') || cacheName.includes('images')) {
            deletePromises.push(
              caches.delete(cacheName).then(() => {
                console.log('Cleared cache:', cacheName);
              })
            );
          }
        });
        
        Promise.all(deletePromises).then(() => {
          localStorage.setItem('sw-cache-version', currentVersion);
          console.log('Cache cleared, version updated to', currentVersion);
          
          // For iOS, force service worker update (but don't unregister - that breaks the app)
          if (isIOSPWA && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              registrations.forEach((registration) => {
                // Force update instead of unregister
                registration.update().catch(() => {});
                // If there's a waiting worker, activate it
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            });
          }
        });
      });
    }
  }
}, 2000); // Wait 2 seconds after app loads to not block login

// Register service worker for PWA with aggressive update strategy
// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:61',message:'About to register service worker',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
} catch(e) {}
// #endregion
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
          icon: "/icon-source.png",
          badge: "/icon-source.png",
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
    
    // For iOS, force immediate update check
    if (registration && isIOSPWA) {
      // Force update immediately on iOS
      registration.update().catch(() => {});
    }
    
    // Check for updates when app becomes visible
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
      
      // For iOS, also check periodically (but less frequently)
      if (isIOSPWA) {
        setInterval(() => {
          if (!document.hidden && !updateCheckInProgress) {
            updateCheckInProgress = true;
            registration.update()
              .catch(() => {})
              .finally(() => {
                updateCheckInProgress = false;
              });
          }
        }, 5 * 60 * 1000); // Every 5 minutes for iOS
      }
    }
  },
  onRegisterError(error) {
    console.log('SW registration error', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:139',message:'Service worker registration error',data:{error:error?.message||String(error),timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  },
});
// #region agent log
fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:142',message:'Service worker registration setup completed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

// Initialize notifications when app loads (only for installed PWAs)
if (navigator.serviceWorker && isPWA) {
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

// Logout on app close for PWA (iOS/Android)

if (isPWA) {
  // Logout when app is closed (visibilitychange for iOS, beforeunload for Android)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // App is being closed/minimized - clear auth
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('business');
      } catch (e) {
        console.error('Error clearing auth on app close:', e);
      }
    }
  });
  
  // Also handle beforeunload for Android
  window.addEventListener('beforeunload', () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('business');
    } catch (e) {
      console.error('Error clearing auth on app close:', e);
    }
  });
  
  // Handle pagehide for iOS (more reliable)
  window.addEventListener('pagehide', () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('business');
    } catch (e) {
      console.error('Error clearing auth on app close:', e);
    }
  });
}

// Global error handler to catch any unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:198',message:'Global error caught',data:{error:event.error?.message||String(event.error),filename:event.filename,lineno:event.lineno,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e) {}
  // #endregion
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:205',message:'Unhandled promise rejection',data:{reason:event.reason?.message||String(event.reason),timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e) {}
  // #endregion
});

// #region agent log
try {
  const rootElement = document.getElementById('root');
  console.log('[DEBUG] Root element:', rootElement);
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:215',message:'About to mount React root',data:{rootElementExists:!!rootElement,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  if (!rootElement) {
    console.error('[DEBUG] Root element not found!');
    throw new Error('Root element not found');
  }
  const root = createRoot(rootElement);
  console.log('[DEBUG] React root created');
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:222',message:'React root created successfully',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
  console.log('[DEBUG] React render called');
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:231',message:'React render called successfully',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
} catch (error) {
  console.error('[DEBUG] ERROR in React mounting:', error);
  fetch('http://127.0.0.1:7242/ingest/fb733bfc-26f5-487b-8435-b59480da3071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:234',message:'ERROR in React mounting',data:{error:error?.message||String(error),stack:error?.stack,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,E'})}).catch(()=>{});
  // Show error on screen instead of blank screen
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>Error Loading App</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`;
  }
  throw error;
}
// #endregion
