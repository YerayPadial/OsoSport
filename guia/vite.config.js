import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const apiTarget = process.env.OSOSPORT_API_TARGET || 'http://127.0.0.1:8091'

// https://vite.dev/config/
export default defineConfig({
  base: '/guia/',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/guia/api': {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/guia\/api/, '/api'),
      },
    },
  },
  plugins: [react()],
})
