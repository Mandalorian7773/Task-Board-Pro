import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      'prop-types': 'prop-types/index.js',
      'react': 'react',
      'react-dom': 'react-dom'
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
    minify: 'esbuild',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      esmExternals: true
    },
    rollupOptions: {
      external: ['use-sync-external-store', 'use-sync-external-store/with-selector'],
      output: {
        manualChunks: (id) => {
          // Bundle all React-related code together to ensure proper initialization
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react-redux') ||
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
        },
        // Ensure proper loading order
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    esbuildOptions: {
      keepNames: true,
      define: {
        'process.env.NODE_ENV': '"production"'
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
