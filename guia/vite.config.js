import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/guia/',
  plugins: [
    react(),
    
    VitePWA({
      registerType: 'autoUpdate',
      
      // Configuración del manifest.json
      manifest: {
        name: 'OsoSport Gym', 
        short_name: 'OsoSport', 
        description: 'Rutinas de gimnasio de OsoSport Gym', 
        theme_color: '#1F2937', 
        background_color: '#1F2937', 
        display: 'standalone', 
        orientation: 'portrait', 
        start_url: '/guia/',   
        scope: '/guia/',     
        icons: [
          {
            src: '/guia/icons/icon-192.png', 
            sizes: '192x192', 
            type: 'image/png', 
            purpose: 'any maskable', 
          },
          {
            src: '/guia/icons/icon-512.png', 
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'any maskable', 
          },
        ],
      },
      
      // Configuración del Service Worker (para funcionar offline)
      workbox: {
        // 1. ARCHIVOS PEQUEÑOS DE LA APP (PRE-CACHE)
        // Se cachean al inicio. 'mp4' se quita de aquí.
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'], 
        
        // 2. ARCHIVOS GRANDES (RUNTIME CACHING)
        // Se cachean cuando el usuario los solicita (streaming).
        runtimeCaching: [
          // Regla para tus vídeos locales
          {
            urlPattern: ({ request }) => request.destination === 'video',
            handler: 'CacheFirst', 
            options: {
              cacheName: 'local-videos-cache',
              expiration: {
                maxEntries: 60, // Guarda los últimos 10 vídeos vistos
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
              rangeRequests: true, // ¡Importante para streaming!
              cacheableResponse: {
                statuses: [200, 206] // Acepta respuestas OK y de contenido parcial
              }
            }
          },

          // Tu regla para vídeos externos (si la sigues necesitando)
          {
            urlPattern: /^https:\/\/padiyera\.com\/guia\/videos\/.*\.mp4/i,
            handler: 'CacheFirst', 
            options: {
              cacheName: 'external-video-cache', 
              expiration: {
                maxEntries: 50, 
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    })
  ],
})