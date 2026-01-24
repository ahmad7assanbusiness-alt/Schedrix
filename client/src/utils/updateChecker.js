/**
 * Update checker utility for PWA
 * Provides aggressive update checking specifically for iOS PWA compatibility
 */

let isCheckingForUpdates = false;

export class UpdateChecker {
  static async checkForUpdates(forceReload = false) {
    if (isCheckingForUpdates) return;
    isCheckingForUpdates = true;

    try {
      // Method 1: Service Worker update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          
          if (registration.waiting) {
            console.log("New service worker waiting, activating...");
            if (forceReload || this.isPWA()) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              return;
            }
          }
        }
      }

      // Method 2: Build timestamp check
      const response = await fetch('/index.html?t=' + Date.now(), { 
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract build hash from HTML or use response timestamp
        const buildHashMatch = html.match(/\/assets\/index-([a-zA-Z0-9]+)\.js/);
        const currentHash = buildHashMatch ? buildHashMatch[1] : null;
        
        const storedHash = localStorage.getItem('app-build-hash');
        
        if (storedHash && currentHash && storedHash !== currentHash) {
          console.log("Build hash changed, forcing update...");
          localStorage.setItem('app-build-hash', currentHash);
          
          if (this.isPWA() || forceReload) {
            // Force immediate reload for PWA
            window.location.reload();
          } else {
            // Ask user in browser mode
            if (confirm("A new version of Opticore is available. Update now?")) {
              window.location.reload();
            }
          }
          return;
        } else if (currentHash) {
          localStorage.setItem('app-build-hash', currentHash);
        }
      }

      // Method 3: Cache busting check (disabled for iOS to prevent crashes)
      if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        const cacheKey = 'last-update-check';
        const lastCheck = localStorage.getItem(cacheKey);
        const now = Date.now();
        
        // Only check if it's been more than 10 minutes (not 5)
        if (lastCheck && now - parseInt(lastCheck) > 10 * 60 * 1000) {
          localStorage.setItem(cacheKey, now.toString());
          
          // Don't auto-reload on iOS - let user control it
          if (this.isPWA() && !/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            // Only clear caches if not iOS
            if ('caches' in window && forceReload) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
              } catch (error) {
                console.error('Error clearing caches:', error);
              }
              window.location.reload();
            }
          }
        } else {
          localStorage.setItem(cacheKey, now.toString());
        }
      }

    } catch (error) {
      console.error("Error checking for updates:", error);
    } finally {
      isCheckingForUpdates = false;
    }
  }

  static isPWA() {
    return window.navigator.standalone || 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches;
  }

  static startPeriodicChecks() {
    // Disable aggressive checking on iOS to prevent crashes
    // iOS Safari has issues with frequent reloads and cache clearing
    if (this.isPWA() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      console.log('iOS PWA detected - using minimal update checking');
      // Only check when app becomes visible (not on interval)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Delay check to avoid overwhelming iOS
          setTimeout(() => {
            this.checkForUpdates(false); // Don't force reload
          }, 1000);
        }
      });
      return;
    }

    // For non-iOS devices, check less frequently
    // Check for updates every 5 minutes (not 30 seconds)
    setInterval(() => {
      this.checkForUpdates(false);
    }, 5 * 60 * 1000);

    // Check when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.checkForUpdates(false);
        }, 1000);
      }
    });

    // Initial check with delay
    setTimeout(() => {
      this.checkForUpdates(false);
    }, 5000);
  }
}