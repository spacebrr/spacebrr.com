import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { blogPlugin } from './vite-plugin-blog.js';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [blogPlugin(), react()],
});
