import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        select: resolve(__dirname, 'select.html'),
        success: resolve(__dirname, 'success.html'),
      },
    },
  },
})
