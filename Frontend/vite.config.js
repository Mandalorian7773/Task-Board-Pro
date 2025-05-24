import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/analytics']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'mui-styles': ['@emotion/react', '@emotion/styled'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/analytics'],
          'dnd': ['@hello-pangea/dnd'],
          'socket': ['socket.io-client']
        }
      }
    }
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript',
      'X-Content-Type-Options': 'nosniff'
    }
  }
})
