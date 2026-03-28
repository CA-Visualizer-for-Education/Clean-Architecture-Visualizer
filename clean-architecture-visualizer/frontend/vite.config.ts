import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), svgr({include: "**/*.svg?react"})],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3131',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
