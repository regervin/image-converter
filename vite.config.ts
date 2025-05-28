import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Disable esbuild optimization to prevent deadlocks
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Use optimizeDeps to help with dependency pre-bundling
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  // Increase timeout for build operations
  server: {
    hmr: {
      timeout: 5000
    }
  }
})
