import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/roblox': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/status': 'http://localhost:3000',
      '/cache': 'http://localhost:3000'
    }
  }
})
