import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/analytics',
      '@hello-pangea/dnd',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-router-dom'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    commonjsOptions: {
      include: [/@mui\/.*/, /@emotion\/.*/, /react.*/, /react-router-dom/]
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'mui-styles': ['@emotion/react', '@emotion/styled'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/analytics'],
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
