import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    strategies: "injectManifest",
    srcDir: "src",
    filename: "sw.js",
    registerType: "autoUpdate",
    injectManifest:{
      globPatterns: [
        "**/*.{js,css,html,ico,png,svg}",
      ],
    },
    includeAssets:[
      'favicon.ico',
      'apple-touch-icon.png',
      'pwa-72x72.svg'
    ],
    manifest: {
      name: "To Do List App",
      short_name: "to-do-list-app",
      start_url: "/",
      description:"A simple to-do list application built with React and Vite.",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: "pwa-48x48.png",
          sizes: "48x48",
          type: "image/png",
        },
        {
          src: "pwa-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "pwa-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "pwa-128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "pwa-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "Screenshot.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "Screenshot1.png",
          sizes: "320x320",
          type: "image/png"
        }
      ]
    },
    devOptions:{
      enabled: true,
      type: "module"
    }
  })],
})
