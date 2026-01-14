# NPM Commands Overview

This file contains an automatic overview of all available `npm run` commands for the SF-Symbols-Lib project.

## Package Commands (for the React components library)

| Command | Description | Full command |
|---------|-------------|-------------|
| `npm run build` | Builds the library (TypeScript + Vite + Declaration Files) | `tsc && vite build && tsc --emitDeclarationOnly` |
| `npm run dev` | Watch mode for development (continuous build) | `vite build --watch` |
| `npm run lint` | ESLint linting for code quality | `eslint .` |
| `npm run typecheck` | TypeScript type-checking without build | `tsc --noEmit` |
| `npm run generate` | Generates SF Symbols from SVG files | `tsx scripts/generate-sfsymbols.ts` |
| `npm run clean` | Cleans all generated files (src/ + dist/ + docs/dist/) | `rm -rf src/hierarchical src/monochrome src/components/sf-symbol-name.ts src/index.ts docs/dist dist` |
| `npm run check` | Complete quality check (lint + typecheck + build) | `npm run lint && npm run typecheck && npm run build` |

## Preview Page Commands (for the GitHub Pages preview site)

| Command | Description | Full command |
|---------|-------------|-------------|
| `npm run docs:generate` | Generates data for the preview site | `tsx scripts/generate-docs-data.ts` |
| `npm run docs:serve` | Starts local server for preview (without generation) | `browser-sync start --server docs/dist --files docs/dist/index.html --no-open` |
| `npm run docs:preview` | Complete preview (generates + starts server) | `npm run docs:generate && npm run docs:serve` |

## Usage Notes

- **Package Commands** are called from the project root and affect the development of the React components library
- **Preview Page Commands** affect the static GitHub Pages preview site in the `docs/` folder
- All commands are designed to be callable from the document root (`/`)
- The preview site is completely static and contains only `index.html`, `scripts/`, `styles/`, Markdown files, and `info.txt`

## Last Update

This overview is automatically updated when the `npm run` commands in `package.json` change.