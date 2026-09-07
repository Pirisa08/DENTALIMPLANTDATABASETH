import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8900',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8900',
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "connect-src 'self' http://localhost:8900 http://127.0.0.1:8900 ws://localhost:3000 ws://127.0.0.1:3000 https://fonts.googleapis.com https://images.unsplash.com",
        "img-src 'self' data: blob: https: http://localhost:8900 http://127.0.0.1:8900",
        "font-src 'self' https://fonts.gstatic.com data:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      ].join('; ')
    }
  },
  define: {
    'process.env': {}
  }
});