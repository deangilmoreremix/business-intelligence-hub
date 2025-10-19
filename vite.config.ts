import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'AnalyticsApp',
      filename: 'remoteEntry.js',
      exposes: {
        './AnalyticsApp': './src/AnalyticsApp.tsx',
        './Dashboard': './src/components/Dashboard.tsx',
        './AnalyticsWidget': './src/components/AnalyticsWidget.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.0.0',
          strictVersion: false,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      'openai': 'openai/index.mjs'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['openai'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].js',
        minifyInternalExports: false,
      },
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  },
});
