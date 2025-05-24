import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      'prop-types': 'prop-types/index.js',
      'use-sync-external-store': 'use-sync-external-store/index.js',
      'use-sync-external-store/with-selector': 'use-sync-external-store/with-selector.js'
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
      external: ['react', 'react-dom'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'mui-styles': ['@emotion/react', '@emotion/styled'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/analytics'],
          'socket': ['socket.io-client'],
          'dnd': ['@hello-pangea/dnd', 'react-redux', 'use-sync-external-store']
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
