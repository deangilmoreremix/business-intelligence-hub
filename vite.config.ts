import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import wyw from '@wyw-in-js/vite';
import path from 'node:path';

// Vendored Twenty sources (see src/vendor/twenty/NOTICE.md) expect Twenty's import aliases,
// lingui macros and Linaria (build-time CSS-in-JS).
const twentyRoot = path.resolve(__dirname, 'src/vendor/twenty');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['@lingui/babel-plugin-lingui-macro'] } }),
    wyw({
      include: [`${twentyRoot}/**/*.{ts,tsx}`],
      exclude: ['**/generated-metadata/**', '**/generated/**'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-export-namespace-from'],
      },
    }),
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
    alias: [
      { find: /^@\//, replacement: `${twentyRoot}/front/modules/` },
      { find: /^~\//, replacement: `${twentyRoot}/front/` },
      { find: /^twenty-front-component-renderer$/, replacement: path.resolve(__dirname, 'src/vendor/twenty-adapter/front-component-renderer.ts') },
      { find: /^twenty-shared\/(.*)$/, replacement: `${twentyRoot}/shared/$1` },
    ],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
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
