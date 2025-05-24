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
      'react',
      'react-dom',
      'react-router-dom',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@emotion/serialize',
      '@emotion/unitless',
      '@emotion/utils',
      '@emotion/weak-memoize',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
      '@mui/base',
      'firebase/app',
      'firebase/auth',
      'firebase/analytics',
      '@hello-pangea/dnd',
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      esmExternals: true
    },
    rollupOptions: {
      external: ['use-sync-external-store', 'use-sync-external-store/with-selector'],
      output: {
        manualChunks: (id) => {
          // Core React bundle
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom')) {
            return 'react-core';
          }

          // React ecosystem bundle
          if (id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react-redux')) {
            return 'react-ecosystem';
          }

          // Emotion bundle
          if (id.includes('node_modules/@emotion')) {
            return 'emotion';
          }

          // MUI bundle
          if (id.includes('node_modules/@mui')) {
            return 'mui';
          }

          // Firebase bundle
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }

          // DnD bundle
          if (id.includes('node_modules/@hello-pangea/dnd')) {
            return 'dnd';
          }

          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Ensure proper loading order
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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
