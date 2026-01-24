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
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly', // Never cache API calls
            options: {
              networkTimeoutSeconds: 10, // Timeout after 10 seconds
            },
          },
          {
            // Don't cache any external API calls
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkOnly',
            options: {
              networkTimeoutSeconds: 10,
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
