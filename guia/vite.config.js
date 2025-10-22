import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/guia/',
  plugins: [
    react(),
    
    // <-- 2. AÑADIR TODA ESTA CONFIGURACIÓN
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola [cite: 250]
      
      // Configuración del manifest.json (para el icono y nombre)
      manifest: {
        name: 'OsoSport Gym', // [cite: 213]
        short_name: 'OsoSport', // [cite: 214]
        description: 'Rutinas de gimnasio de OsoSport Gym', // [cite: 215]
        theme_color: '#2B7D32', // [cite: 216]
        background_color: '#FFFFFF', // [cite: 217]
        display: 'standalone', // [cite: 218]
        orientation: 'portrait', // [cite: 219]
        start_url: '/guia/', // <-- Modificado para tu URL
        scope: '/guia/',     // <-- Modificado para tu URL
        icons: [
          {
            src: '/guia/icons/icon-192.png', // [cite: 224]
            sizes: '192x192', // [cite: 225]
            type: 'image/png', // [cite: 226]
            purpose: 'any maskable', // [cite: 227]
          },
          {
            src: '/guia/icons/icon-512.png', // [cite: 229]
            sizes: '512x512', // [cite: 230]
            type: 'image/png', // [cite: 231]
            purpose: 'any maskable', // [cite: 232]
          },
        ],
      },
      
      // Configuración del Service Worker (para funcionar offline)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'], // [cite: 252]
        runtimeCaching: [
          {
            // Cachear los vídeos [cite: 254-256]
            urlPattern: /^https:\/\/padiyera\.com\/guia\/videos\/.*\.mp4/i,
            handler: 'CacheFirst', // [cite: 256]
            options: {
              cacheName: 'video-cache', // [cite: 258]
              expiration: {
                maxEntries: 50, // [cite: 260]
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días [cite: 261]
              },
            },
          },
        ],
      },
    })
  ],
})
