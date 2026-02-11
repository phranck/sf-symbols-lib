# Tree-Shakeable Icon Architecture (v2.0)

## Preface

This plan introduces a tree-shakeable icon architecture that enables consumers to import individual icons as React components, drastically reducing bundle sizes. Currently, all 7,007 icons (26 MB of SVG data) are bundled into a single shared chunk, forcing consumers to download everything even if they only need five icons. The new architecture generates individual icon files while maintaining backward compatibility through a deprecated compatibility layer. This hybrid approach allows consumers to migrate gradually while immediately benefiting from optimal tree-shaking with the new API. TypeScript support, proper module resolution, and ESM-first design ensure seamless integration with modern build tools.

## Context / Problem

### Current State

- All 7,007 SF Symbols are bundled into a single `data.ts` file (26 MB)
- Vite creates one shared chunk (`SFSymbol-*.js`) containing all SVG data
- Consumers load the entire 26 MB chunk regardless of how many icons they use
- No tree-shaking possible with current architecture

### Problem

This is unacceptable for production use:
- **Bundle bloat:** A consumer using 5 icons downloads 7,002 unused icons
- **Poor performance:** Initial page load includes massive unused data
- **No optimization path:** Modern bundlers cannot eliminate unused icons

### Industry Standard

Leading icon libraries solve this with individual exports:
- `react-icons`: Individual files per icon
- `lucide-react`: Tree-shakeable component exports
- `@heroicons/react`: Direct component imports

All achieve near-zero overhead through proper tree-shaking.

## Specification / Goal

### Primary Goal

Transform the library architecture to enable tree-shakeable icon imports while maintaining backward compatibility.

### Success Criteria

1. **New API (v2.0):** Direct component imports with full tree-shaking
2. **Old API (v1.x compat):** Existing API continues working with deprecation warning
3. **Bundle size:** Consumer bundles only include imported icons
4. **Zero breaking changes:** v2.0 is additive, not destructive
5. **TypeScript:** Full type safety for both APIs

### Non-Goals

- Custom icon registration
- Runtime icon loading (dynamic imports)
- Icon composition or transformation utilities

## Design

### Architecture Overview

```
dist/
├── hierarchical/
│   ├── index.js                    # Barrel export of all 7,007 icons
│   ├── CheckmarkCircle.js          # Individual icon component
│   ├── CheckmarkCircleFill.js
│   └── ... (7,007 files)
├── monochrome/
│   ├── index.js
│   ├── CheckmarkCircle.js
│   └── ... (7,007 files)
├── compat/
│   ├── index.js                    # Old API: SFSymbol + SFSymbolName
│   ├── SFSymbol.js                 # Core renderer component
│   └── data.js                     # All icons in single chunk (legacy)
└── index.js                        # Main export → re-exports compat/index.js
```

### API Design

#### New API (Recommended, Tree-Shakeable)

```tsx
// Direct component import
import { CheckmarkCircle, Phone, Envelope } from 'sf-symbols-lib/hierarchical'

// Usage
<CheckmarkCircle className="icon" size="md" color="blue" />
<Phone size="lg" />
```

**Generated Component Structure:**

```tsx
// dist/hierarchical/CheckmarkCircle.js
import React from 'react'

export interface CheckmarkCircleProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: string
  strokeWidth?: number
}

export function CheckmarkCircle({
  size = 'md',
  className,
  color,
  strokeWidth = 1,
}: CheckmarkCircleProps) {
  const sizeMap = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 }
  const dimensions = sizeMap[size]
  
  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 25.459 25.8008"
      className={className}
      style={{ color }}
      strokeWidth={strokeWidth}
      dangerouslySetInnerHTML={{ __html: '<g>...</g>' }}
    />
  )
}

export default CheckmarkCircle
```

#### Old API (Deprecated, Backward Compat)

```tsx
// Legacy API (still works, logs deprecation warning)
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib/compat'

<SFSymbol name={SFSymbolName.CheckmarkCircle} size="md" />
```

**Deprecation Warning (Console, Development Only):**

```
⚠️  sf-symbols-lib: The SFSymbol component is deprecated and will be removed in v3.0.
    Migrate to tree-shakeable imports for better bundle sizes:
    
    Before: import { SFSymbol, SFSymbolName } from 'sf-symbols-lib'
    After:  import { CheckmarkCircle } from 'sf-symbols-lib/hierarchical'
    
    See: https://github.com/phranck/sf-symbols-lib#migration-v2
```

### Package.json Exports

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./hierarchical": "./dist/hierarchical/index.js",
    "./hierarchical/*": "./dist/hierarchical/*.js",
    "./monochrome": "./dist/monochrome/index.js",
    "./monochrome/*": "./dist/monochrome/*.js",
    "./compat": "./dist/compat/index.js"
  },
  "typesVersions": {
    "*": {
      "hierarchical": ["./dist/hierarchical/index.d.ts"],
      "hierarchical/*": ["./dist/hierarchical/*.d.ts"],
      "monochrome": ["./dist/monochrome/index.d.ts"],
      "monochrome/*": ["./dist/monochrome/*.d.ts"],
      "compat": ["./dist/compat/index.d.ts"]
    }
  }
}
```

### Generator Changes

The `generate-sfsymbols.ts` script needs three new generation modes:

1. **Individual Icon Files** (`src/hierarchical/CheckmarkCircle.tsx`)
   - One file per icon (7,007 files per variant)
   - Self-contained React component
   - Inline SVG data
   - Props: `size`, `className`, `color`, `strokeWidth`

2. **Barrel Exports** (`src/hierarchical/index.tsx`)
   - Re-export all individual icons
   - Named exports only (no default)
   - Tree-shakeable by design

3. **Compat Layer** (`src/compat/`)
   - Move current `SFSymbol.tsx` here
   - Keep `data.ts` structure (all icons in one object)
   - Add deprecation warning (dev mode only)

### Vite Config Changes

```ts
export default defineConfig({
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'hierarchical/index': resolve(__dirname, 'src/hierarchical/index.tsx'),
        'monochrome/index': resolve(__dirname, 'src/monochrome/index.tsx'),
        'compat/index': resolve(__dirname, 'src/compat/index.tsx'),
      },
      formats: ['es']
    },
    rollupOptions: {
      output: {
        // CRITICAL: Preserve individual icon modules
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      }
    }
  }
})
```

**Key Change:** `preserveModules: true` ensures each icon file remains separate instead of being bundled into chunks.

## Implementation Plan

### Phase 1: Generator Refactoring

1. **Extract Icon Data Parser**
   - Move SVG parsing logic to reusable function
   - Input: SF Symbols `.svg` file
   - Output: `{ name, viewBox, svgContent }`

2. **Create Icon Component Template**
   - Define TypeScript component template
   - Props interface
   - Size mapping logic
   - SVG renderer with `dangerouslySetInnerHTML`

3. **Generate Individual Icon Files**
   - Loop through all symbols
   - Generate one `.tsx` file per icon
   - Apply component template
   - Write to `src/hierarchical/` and `src/monochrome/`

4. **Generate Barrel Exports**
   - Create `index.tsx` with all named exports
   - Alphabetically sorted
   - Type-safe re-exports

### Phase 2: Compatibility Layer

1. **Create `src/compat/` Directory**
   - Move `SFSymbol.tsx` from `src/common/`
   - Move `data.ts` generation logic (keep current structure)
   - Create `index.tsx` with old exports

2. **Add Deprecation Warning**
   - `useEffect` hook in `SFSymbol` component
   - Only fires in development mode (`process.env.NODE_ENV === 'development'`)
   - One-time warning per page load
   - Clear migration instructions

3. **Update Main Entry Point**
   - `src/index.ts` re-exports `src/compat/index.tsx`
   - Ensures old imports continue working

### Phase 3: Build Configuration

1. **Update Vite Config**
   - Set `preserveModules: true`
   - Set `preserveModulesRoot: 'src'`
   - Add entry points for compat layer

2. **Update `package.json`**
   - Add `exports` field with subpath exports
   - Add `typesVersions` for TypeScript resolution
   - Update `files` array to include all generated icons

3. **Test Build Output**
   - Verify individual icon files exist in `dist/`
   - Verify barrel exports work
   - Verify compat layer includes shared chunk
   - Check file count (should be ~14,000+ files)

### Phase 4: Documentation & Migration Guide

1. **Update README.md**
   - Add "Migration from v1.x" section
   - Show before/after examples
   - Bundle size comparison
   - Deprecation timeline

2. **Add `MIGRATION.md`**
   - Detailed migration guide
   - Codemod examples
   - Common patterns
   - Troubleshooting

3. **Update TypeScript Examples**
   - Update docs site examples
   - Add new API usage to landing page

### Phase 5: Testing & Validation

1. **Create Test Consumer Project**
   - Fresh Next.js app
   - Test old API (compat)
   - Test new API (tree-shakeable)
   - Compare bundle sizes

2. **Bundle Size Analysis**
   - Measure old API bundle (should be ~26 MB)
   - Measure new API with 5 icons (should be <10 KB)
   - Document results

3. **CI/CD Verification**
   - Ensure lint passes
   - Ensure typecheck passes
   - Ensure build succeeds
   - Verify npm package structure

## Checklist

- [x] Phase 1: Extract icon data parser into reusable function
- [x] Phase 1: Create TypeScript icon component template
- [x] Phase 1: Generate individual icon files for all 4 variants (hierarchical, monochrome, palette, multicolor)
- [x] Phase 1: Generate barrel export files (index.tsx) for all variants
- [x] Phase 2: Create src/compat/ directory structure
- [x] Phase 2: Move SFSymbol.tsx to compat layer
- [x] Phase 2: Keep data.ts generation for compat layer
- [x] Phase 2: Add deprecation warning to SFSymbol component
- [x] Phase 2: Update src/index.ts to re-export compat layer
- [x] Phase 3: Update Vite config with preserveModules: true
- [x] Phase 3: Add subpath exports to package.json (all 4 variants + compat)
- [x] Phase 3: Verify build output structure (28,028 individual icons in dist/)
- [x] Phase 3: Run full build after metadata-strip fix
- [x] Phase 3: Run lint + typecheck, fix issues
- [ ] Phase 4: Write README migration section
- [ ] Phase 4: Create MIGRATION.md guide
- [ ] Phase 4: Update docs site with new API examples
- [ ] Phase 5: Create test consumer project
- [ ] Phase 5: Measure and document bundle size improvements
- [ ] Phase 5: Verify CI pipeline passes
- [ ] Phase 5: Test npm package installation and usage

## Open Questions

1. **Icon naming conflicts:** Should we prefix all exports to avoid collisions with React/DOM globals?
   - Example: `SFCheckmarkCircle` instead of `CheckmarkCircle`
   - Trade-off: Cleaner API vs. safety

2. **Barrel export performance:** Should we recommend direct imports over barrel?
   - `import { CheckmarkCircle } from 'sf-symbols-lib/hierarchical'` (barrel)
   - `import { CheckmarkCircle } from 'sf-symbols-lib/hierarchical/CheckmarkCircle'` (direct)
   - Some bundlers struggle with large barrel files

3. **Deprecation timeline:** When should we remove the compat layer?
   - v2.0: Both APIs available
   - v3.0: Remove compat layer?
   - Or keep indefinitely?

4. **ESLint plugin:** Should we provide an ESLint rule to auto-migrate old API usage?

## Files

### New Files

```
src/hierarchical/CheckmarkCircle.tsx
src/hierarchical/CheckmarkCircleFill.tsx
src/hierarchical/... (7,007 files)
src/monochrome/CheckmarkCircle.tsx
src/monochrome/... (7,007 files)
src/compat/index.tsx
src/compat/SFSymbol.tsx
src/compat/data.ts
MIGRATION.md
```

### Modified Files

```
scripts/generate-sfsymbols.ts      # New generation logic
vite.config.ts                     # preserveModules: true
package.json                       # exports, typesVersions
README.md                          # Migration guide
src/index.ts                       # Re-export compat
tsconfig.json                      # May need path adjustments
```

### Removed Files

```
src/common/SFSymbol.tsx            # Moved to compat/
src/hierarchical/data.ts           # No longer needed (individual files)
src/monochrome/data.ts             # No longer needed (individual files)
```

## Dependencies

- Vite 7.x with Rollup 4.x (already installed)
- TypeScript 5.9+ (already installed)
- React 18/19 as peerDependency (already configured)
- No new external dependencies required
