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
        // Include push notification handler
        importScripts: ['/sw-push.js'],
        // Handle navigation requests
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\/.*/, /^\/auth\/.*/],
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
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'sw-push.js']
    })
  ]
});
