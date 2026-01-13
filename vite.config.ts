import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'hierarchical/index': resolve(__dirname, 'src/hierarchical/index.tsx'),
        'monochrome/index': resolve(__dirname, 'src/monochrome/index.tsx'),
        'multicolor/index': resolve(__dirname, 'src/multicolor/index.tsx'),
      },
      name: 'SFSymbolsLib',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        preserveModules: false,
        entryFileNames: '[name].js',
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
})
