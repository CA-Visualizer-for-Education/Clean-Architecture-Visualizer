/// <reference types="vitest" />
import { defineConfig } from 'vitest/config' 
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr({include: "**/*.svg?react"})],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Force Vitest to use the local frontend copies
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@tanstack/react-query': path.resolve(__dirname, './node_modules/@tanstack/react-query'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    server: {
      deps: {
        // Prevents Vitest from trying to resolve react-query from the parent node_modules
        inline: [/@tanstack\/react-query/, /msw/],
      },
    },
    // This is the most important part for nested folders:
    root: path.resolve(__dirname, './'), 
  },
})
