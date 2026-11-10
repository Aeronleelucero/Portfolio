import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js is inherently large; it lives in its own lazily-loaded chunk.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // Conventional, printable resume generated from the same data files.
        resume: resolve(import.meta.dirname, 'resume.html'),
      },
    },
  },
})
