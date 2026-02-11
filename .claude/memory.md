# sf-symbols-lib - Technical Reference

## Project Overview

**Name:** sf-symbols-lib
**Purpose:** React component library providing 7,007 Apple SF Symbols as SVG-based components
**Framework:** React 18/19, TypeScript 5.9, Vite 7
**Package:** ES modules, npm published
**Current Version:** 1.1.3

### Key Dependencies

| Dependency | Role |
|---|---|
| `react`, `react-dom` | peerDependencies (^18 or ^19) |
| `vite` 7.x | Build (Rollup under the hood) |
| `tsc-alias` | Post-build `@/` alias resolution in `.d.ts` |
| `tsx` | TypeScript execution for generator scripts |
| `browser-sync` | Docs preview server |
| `marked` | Markdown rendering for docs modals |

## Architecture

### Dual API (v2.0)

**New API (tree-shakeable):**
```tsx
import { SFCheckmarkCircleFill } from 'sf-symbols-lib/hierarchical';
<SFCheckmarkCircleFill size="lg" />
```
Each icon is ~1.5 KB standalone. Only imported icons in consumer bundle.

**Old API (compat, deprecated):**
```tsx
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib';
<SFSymbol name={SFSymbolName.SFCheckmarkCircleFill} />
```
Loads all icons (~15 MB per variant). Deprecation warning in dev mode.

### Build Pipeline

```
src/ -> tsc (typecheck) -> vite build -> tsc --emitDeclarationOnly -> tsc-alias -> dist/
```

- `preserveModules: true` in Vite config ensures each icon stays as separate file
- `preserveModulesRoot: 'src'` keeps directory structure

### Entry Points

| Export Path | File | Description |
|---|---|---|
| `sf-symbols-lib` | `dist/index.js` | Re-exports compat layer |
| `sf-symbols-lib/hierarchical` | `dist/hierarchical/index.js` | Barrel: 7,007 icon components |
| `sf-symbols-lib/hierarchical/*` | `dist/hierarchical/icons/*.js` | Direct icon import |
| `sf-symbols-lib/monochrome` | `dist/monochrome/index.js` | Barrel: 7,007 icon components |
| `sf-symbols-lib/palette` | `dist/palette/index.js` | Barrel: 7,007 icon components |
| `sf-symbols-lib/multicolor` | `dist/multicolor/index.js` | Barrel: 7,007 icon components |
| `sf-symbols-lib/compat` | `dist/compat/index.js` | Legacy SFSymbol + SFSymbolName |

### Path Alias

`@/` -> `src/` (in `tsconfig.json` and `vite.config.ts`)

## Project Structure

```
sf-symbols-lib/
├── .svgs/                          # Source SVGs (gitignored)
│   ├── hierarchical/               # 7,007 SVG files with embedded XML metadata
│   ├── monochrome/
│   ├── palette/
│   └── multicolor/
├── src/
│   ├── index.ts                    # Generated: re-exports compat layer
│   ├── common/
│   │   ├── SFIcon.tsx              # NEW: Lightweight SVG wrapper (no data imports)
│   │   └── types.ts                # NEW: Shared SFIconProps, size presets, resolveSize
│   ├── components/
│   │   └── sf-symbol-name.ts       # Generated: SFSymbolName enum + constants
│   ├── hierarchical/
│   │   ├── index.tsx               # Generated: barrel re-export of all icons
│   │   └── icons/                  # Generated: 7,007 individual .tsx components
│   ├── monochrome/                 # Same structure as hierarchical
│   ├── palette/                    # Same structure
│   ├── multicolor/                 # Same structure
│   ├── compat/
│   │   ├── index.tsx               # Generated: old API entry point
│   │   ├── SFSymbol.tsx            # Generated: legacy renderer + deprecation warning
│   │   └── {variant}/data.ts       # Generated: all icons in one object (legacy)
│   └── types/
│       ├── sizes.ts                # SFSymbolSize (xs/sm/md/lg/xl)
│       └── symbol-types.ts         # SFSymbolVariant enum
├── scripts/
│   ├── generate-sfsymbols.ts       # Main generator (icons + compat + enum)
│   └── generate-docs-data.ts       # Docs site data generator
├── docs/
│   ├── index.html                  # Template (modulepreload, not preload)
│   ├── markdown/                   # about.md, search.md
│   ├── scripts/                    # JS modules (theme, colors, symbols, etc.)
│   ├── styles/                     # CSS
│   └── dist/                       # Generated docs site (DO NOT EDIT)
├── dist/                           # Build output (~591 MB with all variants + sourcemaps)
├── plans/
│   ├── open/                       # Active plans
│   └── done/                       # Completed plans
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## Key Types Reference

### Core Components

| Type | File | Purpose |
|---|---|---|
| `SFIcon` | `src/common/SFIcon.tsx` | Lightweight SVG renderer for tree-shakeable icons |
| `SFSymbol` | `src/compat/SFSymbol.tsx` | Legacy renderer (imports all data, deprecated) |
| Generated icons | `src/{variant}/icons/*.tsx` | Individual icon components calling SFIcon |

### Interfaces & Types

| Type | File | Purpose |
|---|---|---|
| `SFIconProps` | `src/common/types.ts` | Props for tree-shakeable icons (size, className, style, SVG attrs) |
| `SFIconSize` | `src/common/types.ts` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` |
| `SFIconRenderProps` | `src/common/SFIcon.tsx` | Internal: SFIconProps + svgContent + viewBox |
| `SFSymbolProps` | `src/compat/SFSymbol.tsx` | Legacy props (name, variant, color, etc.) |

### Enums & Constants

| Type | File | Purpose |
|---|---|---|
| `SFSymbolName` | `src/components/sf-symbol-name.ts` | 7,007 symbol name constants (enum) |
| `SFSymbolVariant` | `src/types/symbol-types.ts` | `hierarchical \| monochrome \| palette \| multicolor` |
| `SF_ICON_SIZES` | `src/common/types.ts` | Size preset to pixel mapping |
| `SFSymbolSize` | `src/types/sizes.ts` | Legacy size record (compat) |

## Patterns & Conventions

### Generated Icon Component Pattern

Each icon is a thin wrapper around `SFIcon`:
```tsx
// src/hierarchical/icons/SFCheckmarkCircleFill.tsx
import { SFIcon } from '@/common/SFIcon';
import { type SFIconProps } from '@/common/types';

const SVG = '<g>...</g>';
const VB = '0 0 25.8008 25.459';

export function SFCheckmarkCircleFill(props: SFIconProps): ReactElement {
  return <SFIcon svgContent={SVG} viewBox={VB} {...props} />;
}
```

- `currentColorFill={false}` for palette/multicolor variants
- SVG content is pre-processed (metadata stripped, colors replaced per variant)

### SVG Color Processing by Variant

| Variant | Fill Behavior |
|---|---|
| hierarchical | All fills -> `currentColor` |
| monochrome | All fills -> `currentColor` |
| palette | White -> `currentColor`, preserve hex colors |
| multicolor | Preserve all original colors |

### Generator Script (`scripts/generate-sfsymbols.ts`)

Single `parseSvgFile()` function reads SVG once and returns `{ content, viewBox, metadata }`.

Generates:
1. `sf-symbol-name.ts` - Shared enum
2. `{variant}/icons/{Name}.tsx` - 7,007 individual components per variant
3. `{variant}/index.tsx` - Barrel re-export
4. `compat/{variant}/data.ts` - All icons in one object
5. `compat/SFSymbol.tsx` - Legacy renderer
6. `compat/index.tsx` - Legacy entry point
7. `index.ts` - Main entry (re-exports compat)

### Vite Config Critical Details

- **`preserveModules: true`** - Each icon stays as separate file in dist
- **`preserveModulesRoot: 'src'`** - Keeps directory structure
- **`clientDirectivePlugin`** - Prepends `"use client"` to entry chunks (Next.js RSC)
- **Plugin name must NOT start with `use`** - ESLint hook false positive

### Docs Site Architecture

- **No circular imports**: `colors.js` communicates with `theme.js` via `CustomEvent('sf-color-changed')`
- **Theme**: Class-based on `<html>` (`:root.soft-dark`), GitHub Primer colors
- **Data loading**: Chunked JSON (`meta.json` + `chunks/*.json`), progressive rendering
- **Preloads**: `<link rel="modulepreload">` (NOT `preload as="script"`)

### SVG Metadata Format (SF Symbols 7.3)

```xml
<metadata>
  <symbol>
    <name type="apple">checkmark.circle.fill</name>
    <name type="lib">SFCheckmarkCircleFill</name>
    <restricted>false</restricted>
    <renderingMode>hierarchical</renderingMode>
    <sfSymbolsVersion>7.3</sfSymbolsVersion>
    <categories>
      <category>Draw</category>
      <category>Multicolor</category>
    </categories>
  </symbol>
</metadata>
```

## CI/CD Pipeline

### GitHub Actions (`sf-symbols-ci.yml`)

| Job | Trigger | Description |
|---|---|---|
| `lint-and-typecheck` | push, PR | ESLint + tsc --noEmit |
| `generate` | after lint | Symbols generation, auto-commit if changed |
| `build` | after generate | Vite build, artifact upload |
| `update-pages` | push to main | Docs generation + GitHub Pages deploy |
| `publish-npm` | release published | npm publish --provenance |

### Publish Notes

- `npm install -g npm@latest` before publish (npm 10.x README metadata bug)
- `repository.url` required for `--provenance` (Sigstore verification)

## npm Scripts

| Script | Description |
|---|---|
| `build` | Full: tsc + vite + declarations + tsc-alias |
| `generate` | Generate all symbol data from `.svgs/` |
| `clean` | Delete all generated dirs + dist |
| `check` | lint + typecheck + build |
| `docs:generate` | Generate docs site from sources |
| `docs:preview` | Generate + serve docs locally |

## Current State

- **Branch:** main
- **Version:** 1.1.3
- **Build:** passing (generate + vite + tsc + tsc-alias)
- **Tests:** N/A (no test suite)
- **Active:** Tree-shakeable v2.0, Phases 1-3 done

### Recent Changes

1. Tree-shakeable architecture: 28,028 individual icon components across 4 variants
2. Compat layer with deprecation warning for legacy SFSymbol API
3. Docs circular dependency fix (theme.js <-> colors.js via CustomEvent)
4. Docs preload fix (modulepreload instead of preload as="script")
5. SVG metadata integration (embedded XML, 30 categories, category filter)

### Known Issues

- Docs site: `renderSymbols()` rebuilds all 7k DOM elements per render (needs optimization)
- dist is ~591 MB (28k icons x 4 variants + sourcemaps + compat data)
- Generated `src/*/icons/*.tsx` not yet gitignored (28k files in working tree)
