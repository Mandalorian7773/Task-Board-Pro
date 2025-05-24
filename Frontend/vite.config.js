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
          // Bundle all React-related code together
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/@emotion/react') ||
              id.includes('node_modules/@emotion/styled') ||
              id.includes('node_modules/@emotion/cache') ||
              id.includes('node_modules/@emotion/serialize') ||
              id.includes('node_modules/@emotion/unitless') ||
              id.includes('node_modules/@emotion/utils') ||
              id.includes('node_modules/@emotion/weak-memoize')) {
            return 'react-vendor';
          }

          // Bundle all MUI-related code together
          if (id.includes('node_modules/@mui')) {
            return 'mui-vendor';
          }

          // Bundle all Firebase-related code together
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }

          // Bundle all DnD-related code together
          if (id.includes('node_modules/@hello-pangea/dnd')) {
            return 'dnd-vendor';
          }

          // All other node_modules
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
