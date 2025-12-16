import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ['maskable_icon_x48.png', 'maskable_icon_x72.png', 'maskable_icon_x96.png', 'maskable_icon_x128.png', 'maskable_icon_x192.png', 'maskable_icon_x384.png', 'maskable_icon_x512.png'],
    manifest: {
      name: "To Do List App",
      short_name: "to-do-list-app",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "/maskable_icon_x48.png",
          sizes: "48x48",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/maskable_icon_x72.png",
          sizes: "72x72",
          type: "image/png",
          purpose: "any"
        },

        {
          src: "/maskable_icon_x96.png",
          sizes: "96x96",
          type: "image/png",
          purpose: "any"
        },

        {
          src: "/maskable_icon_x128.png",
          sizes: "128x128",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/maskable_icon_x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/maskable_icon_x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/maskable_icon_x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/maskable_icon_x384.png",
          sizes: "384x384",
          type: "image/png",
          purpose: "any maskable"
        },
      ],
      screenshots: [
        {
          src: "/Screenshot 2025-12-16 203549.png",
          sizes: "2880x473",
          type: "image/png"
        },
        {
          src: "/Screenshot 2025-12-16 203644.png",
          sizes: "289x482",
          type: "image/png"
        }
      ]
    },
    workbox: {
      navigateFallback: "./index.html",
      globPatterns: [
        "**/*.{js,css,html,ico,png,svg}",
      ],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/data/"), // 👈 any /data/** file
          handler: "CacheFirst",
          options: {
            cacheName: "quran-json",
            expiration: {
              maxEntries: 200, // adjust based on how many files
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
      ],
    },
  })],
})
