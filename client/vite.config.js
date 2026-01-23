import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      devOptions: { enabled: true },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          }
        ]
      },
      manifest: {
        name: "Schedrix - Schedule Manager",
        short_name: "Schedrix",
        description: "Manage your team schedules and availability",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#6366f1",
        scope: "/",
        icons: [
          { 
            src: "/pwa-192.png", 
            sizes: "192x192", 
            type: "image/png",
            purpose: "any maskable"
          },
          { 
            src: "/pwa-512.png", 
            sizes: "512x512", 
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      includeAssets: ['pwa-192.png', 'pwa-512.png']
    })
  ]
});
