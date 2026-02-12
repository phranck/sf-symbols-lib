import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'

/**
 * Vite plugin that prepends the `"use client"` directive to all entry chunks.
 * Required for Next.js App Router (RSC) compatibility — without it, all imports
 * are treated as Server Components and crash when rendering JSX.
 */
function clientDirectivePlugin(): Plugin {
  return {
    name: 'use-client-directive',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          chunk.code = '"use client";\n' + chunk.code
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), clientDirectivePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'dualtone/index': resolve(__dirname, 'src/dualtone/index.tsx'),
        'monochrome/index': resolve(__dirname, 'src/monochrome/index.tsx'),
      },
      name: 'SFSymbolsLib',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        // Preserve individual icon modules for tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      }
    },
    sourcemap: true,
    emptyOutDir: true,
  }
})
