import { defineConfig, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
    plugins: [
      react(), 
      svgr({ include: "**/*.svg?react" })
    ],
    server: {
      port: 5173,
      proxy: proxyConfig,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});