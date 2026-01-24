import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//, 
          /^\/auth\//, 
          /^\/manifest\.webmanifest$/,
          /^https:\/\//, // Don't intercept external URLs
        ],
        cleanupOutdatedCaches: true,
        // Don't cache HTML files - always fetch fresh
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst', // Changed to NetworkFirst for better updates
            options: {
              cacheName: 'google-apis-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // Reduced to 1 day
              },
            },
          },
          {
            // Match /api/ paths (relative API calls)
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst', // Network first, but don't cache
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10, // Timeout after 10 seconds
              expiration: {
                maxEntries: 0, // Don't cache any API responses
                maxAgeSeconds: 0, // No cache
              },
              cacheableResponse: {
                statuses: [], // Don't cache any responses
              },
            },
          },
          {
            // Match external HTTPS URLs (API server calls) - don't cache
            urlPattern: /^https:\/\/.*\.run\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 0,
                maxAgeSeconds: 0,
              },
              cacheableResponse: {
                statuses: [],
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // Reduced to 7 days
              },
            },
          },
          {
            // Don't cache HTML - always fetch fresh for iOS
            urlPattern: /\.(html|js|css)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60, // 1 hour max
              },
            },
          },
        ],
      },
      manifest: {
        name: "Opticore - Schedule Manager",
        short_name: "Opticore",
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
      includeAssets: [
        'pwa-192.png', 
        'pwa-512.png', 
        'apple-touch-icon-180.png',
        'apple-touch-icon-167.png',
        'apple-touch-icon-152.png',
        'apple-touch-icon-120.png',
        'sw-push.js'
      ]
    })
  ]
});
