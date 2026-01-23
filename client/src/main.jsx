import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA using VitePWA's registerSW
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Force update on mobile devices
      if (window.confirm('New content available, reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
      // Check for updates every hour on mobile
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
