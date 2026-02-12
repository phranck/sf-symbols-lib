# sf-symbols-lib — Project Memory

## Project Overview

- **Name:** sf-symbols-lib
- **Purpose:** React component library for Apple SF Symbols (7,007 icons)
- **Framework:** React 18/19, TypeScript, Vite
- **Package:** ESM-only, tree-shakeable, `sideEffects: false`
- **Variants:** dualtone (default), monochrome

## Architecture

### Directory Structure

```
src/
├── common/
│   ├── SFIcon.tsx            # SVG renderer (forwardRef, dangerouslySetInnerHTML)
│   ├── context.ts            # SFIconContext (global defaults via React Context)
│   └── types.ts              # SFIconProps, SFIconSize, size presets, resolveSize()
├── dualtone/                 # Generated (gitignored)
│   ├── index.tsx             # Barrel (7,007 re-exports + context + types)
│   └── icons/*.tsx           # Individual icon components
├── monochrome/               # Generated (same structure)
└── index.ts                  # Generated (re-exports dualtone as default)
scripts/
├── shared/
│   └── utils.ts              # Shared: kebabToPascalCase, parseSvgFile, VARIANTS
├── generate-sfsymbols.ts     # SVGs → React components
└── generate-docs-data.ts     # SVGs → JSON chunks for docs site (to be replaced)
docs/                         # Vanilla JS preview site (to be replaced by React app)
.svgs/
├── dualtone/                 # Source SVGs (gitignored)
└── monochrome/
```

### Data Flow

1. `.svgs/{variant}/*.svg` → `npm run generate` → parses SVGs, strips metadata
2. Each icon = `forwardRef` component with inlined SVG string + viewBox
3. `SFIcon` renders `<svg dangerouslySetInnerHTML>`, reads defaults from `SFIconContext`
4. Vite builds with `preserveModules` for per-icon tree-shaking
5. Main entry re-exports dualtone (like Phosphor re-exports regular weight)

### Package Exports

| Path | Content |
|------|---------|
| `sf-symbols-lib` | Re-exports dualtone (default) |
| `sf-symbols-lib/dualtone` | All dualtone icons + context + types |
| `sf-symbols-lib/dualtone/*` | Individual dualtone icon |
| `sf-symbols-lib/monochrome` | All monochrome icons |
| `sf-symbols-lib/monochrome/*` | Individual monochrome icon |

## Key Types Reference

| Type | File | Purpose |
|------|------|---------|
| `SFIconProps` | `src/common/types.ts` | Props for all icons: `size`, `className`, `style`, SVG attrs |
| `SFIconRenderProps` | `src/common/SFIcon.tsx` | Internal: extends SFIconProps + `svgContent`, `viewBox` |
| `SFIconSize` | `src/common/types.ts` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|number` |
| `SFIconSizePreset` | `src/common/types.ts` | Named presets only |
| `SFIconContext` | `src/common/context.ts` | React Context for `Partial<SFIconProps>` defaults |
| `Variant` | `scripts/shared/utils.ts` | `'dualtone' \| 'monochrome'` |
| `SvgMetadata` | `scripts/shared/utils.ts` | Parsed SVG metadata (appleName, categories, etc.) |

### Size Presets

| Preset | Pixels |
|--------|--------|
| xs | 12 |
| sm | 16 |
| md | 20 |
| lg | 24 (default) |
| xl | 32 |

## Patterns & Conventions

### Generated Icon Template

```tsx
const SVG_CONTENT = `<path .../>`;
const VIEW_BOX = "0 0 24 24";
export const SFName = forwardRef<SVGSVGElement, SFIconProps>((props, ref) => (
  <SFIcon ref={ref} svgContent={SVG_CONTENT} viewBox={VIEW_BOX} {...props} />
));
SFName.displayName = 'SFName';
```

### Icon Naming

Dot/dash-separated SVG filename → PascalCase with SF prefix:
- `checkmark.circle.fill` → `SFCheckmarkCircleFill`
- `0.circle.fill` → `SF0CircleFill`
- Numeric segments kept as-is, text segments capitalized

### Adding a New Variant

1. Add SVGs to `.svgs/{variant}/`
2. Add variant name to `VARIANTS` in `scripts/shared/utils.ts`
3. Add entry to `vite.config.ts` build entries
4. Add exports to `package.json`
5. Run `npm run generate`

### Build Pipeline

`tsc` → `vite build` → `tsc --emitDeclarationOnly` → `tsc-alias`

### Key npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run generate` | Generate icon components from SVGs |
| `npm run check` | lint + typecheck + build (pre-commit) |
| `npm run docs:preview` | Generate docs data + serve locally |

## Current State

- **Branch:** main
- **Tests:** N/A (no test suite)
- **Build:** passing
- **Blockers:** Large uncommitted diff on main (21 fixes + refactors)
