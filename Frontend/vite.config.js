import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      'prop-types': 'prop-types/index.js'
    }
  },
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
      'react-router-dom',
      'prop-types',
      'use-sync-external-store',
      'use-sync-external-store/with-selector',
      'react-redux'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    commonjsOptions: {
      include: [/@mui\/.*/, /@emotion\/.*/, /react.*/, /react-router-dom/, /prop-types/, /use-sync-external-store/, /react-redux/],
      transformMixedEsModules: true,
      esmExternals: true
    },
    rollupOptions: {
      external: ['use-sync-external-store', 'use-sync-external-store/with-selector'],
      output: {
        manualChunks: (id) => {
          // Group all React-related packages together
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Group all MUI and Emotion packages together
          if (id.includes('node_modules/@mui') || 
              id.includes('node_modules/@emotion')) {
            return 'mui-vendor';
          }
          
          // Group all Firebase packages together
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          
          // Group all other node_modules together
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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
