import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../api/static/dashboard',
    emptyOutDir: true,
  },
  server: {
    port: 8510,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8500',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['connection'] = 'keep-alive';
            }
          });
        },
      },
      '/healthz': 'http://localhost:8500',
    },
  },
});
