/// <reference types="vitest" />
import { defineConfig, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isBackendMode = mode === 'backend';
  const proxyConfig: Record<string, string | ProxyOptions> = isBackendMode
    ? {
        '/api': {
          target: 'http://localhost:3131',
          changeOrigin: true,
          ws: true,
        },
      }
    : {};

  return {
    plugins: [react(), svgr({ include: '**/*.svg?react' })],
    server: {
      port: 5173,
      proxy: proxyConfig,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
        '@testing-library/react': path.resolve(__dirname, 'node_modules/@testing-library/react'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/unit/**/*.{test,ts,tsx}'],
      exclude: ['tests/e2e/**'],
      server: {
        deps: {
          inline: [/@tanstack\/react-query/, /msw/],
        },
      },
      root: path.resolve(__dirname, './'),
    },
  };
});