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
          // React must be loaded first
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom')) {
            return 'react-core';
          }

          // React Router after React
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router';
          }

          // Emotion core utilities
          if (id.includes('node_modules/@emotion/cache') ||
              id.includes('node_modules/@emotion/serialize') ||
              id.includes('node_modules/@emotion/unitless') ||
              id.includes('node_modules/@emotion/utils') ||
              id.includes('node_modules/@emotion/weak-memoize')) {
            return 'emotion-core';
          }

          // Emotion React (depends on React)
          if (id.includes('node_modules/@emotion/react')) {
            return 'emotion-react';
          }

          // Emotion Styled (depends on Emotion React)
          if (id.includes('node_modules/@emotion/styled')) {
            return 'emotion-styled';
          }

          // MUI Core (depends on Emotion)
          if (id.includes('node_modules/@mui/material') ||
              id.includes('node_modules/@mui/system') ||
              id.includes('node_modules/@mui/base')) {
            return 'mui-core';
          }

          // MUI Icons
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'mui-icons';
          }

          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }

          // DnD
          if (id.includes('node_modules/@hello-pangea/dnd')) {
            return 'dnd';
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
