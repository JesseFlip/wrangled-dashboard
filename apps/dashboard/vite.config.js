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
      '/api': 'http://localhost:8500',
      '/healthz': 'http://localhost:8500',
    },
  },
});
