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
      registerType: 'autoUpdate',
      
      // Configuración del manifest.json (para el icono y nombre)
      manifest: {
        name: 'OsoSport Gym', 
        short_name: 'OsoSport', 
        description: 'Rutinas de gimnasio de OsoSport Gym', 
        theme_color: '#2B7D32', 
        background_color: '#FFFFFF', 
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
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'], 
        runtimeCaching: [
          {
            // Cachear los vídeos]
            urlPattern: /^https:\/\/padiyera\.com\/guia\/videos\/.*\.mp4/i,
            handler: 'CacheFirst', 
            options: {
              cacheName: 'video-cache', 
              expiration: {
                maxEntries: 50, 
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
        ],
      },
    })
  ],
})
