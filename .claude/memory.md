# sf-symbols-lib — Project Memory

## Project Overview

- **Name:** sf-symbols-lib
- **Purpose:** React component library for Apple SF Symbols (7,007 icons)
- **Framework:** React 18/19, TypeScript, Vite
- **Package:** ESM-only, tree-shakeable, `sideEffects: false`
- **Render Modes:** dualtone (default), monochrome

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
│   └── utils.ts              # Shared: kebabToPascalCase, parseSvgFile, RENDER_MODES
├── generate-sfsymbols.ts     # SVGs → React components
├── generate-catalog.ts       # SVGs → docs-app/src/lib/catalog.ts (metadata)
└── generate-docs-data.ts     # SVGs → JSON chunks for old docs site (to be removed)
docs/                         # Vanilla JS preview site (being replaced by docs-app)
docs-app/                     # New React/Vite docs site (in progress)
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Top-level layout
│   ├── lib/
│   │   ├── catalog.ts        # Generated: 7,007 icon metadata entries
│   │   └── icons.ts          # Wildcard import + catalog merge
│   ├── state/
│   │   └── store.ts          # Zustand store (theme, renderMode, search, drawer)
│   ├── hooks/
│   │   ├── useTheme.ts       # DOM sync for dark mode and --symbol-color
│   │   └── useFuse.ts        # fuse.js search with OR/AND operators
│   ├── components/
│   │   ├── Header/           # Header.tsx, SearchInput, RenderModeSelect, CategorySelect, ColorPicker, ThemeToggle
│   │   ├── IconGrid/         # IconGrid.tsx (virtual scroll), IconGridItem.tsx
│   │   ├── Drawer/           # DrawerCode.tsx (done), Drawer/Preview/Info (pending)
│   │   ├── Modals/           # AboutModal, CopyModal (pending)
│   │   └── Toast/            # Toast.tsx (pending)
│   └── styles/               # Ported CSS (variables, app, drawer)
├── public/                   # CNAME, markdown files
├── vite.config.ts            # Builds to docs/dist/
├── tsconfig.json
└── package.json              # React 19, zustand 5, fuse.js 7, @tanstack/react-virtual 3
.svgs/
├── dualtone/                 # Source SVGs (gitignored)
└── monochrome/
```

### Data Flow

1. `.svgs/{renderMode}/*.svg` → `npm run generate` → parses SVGs, strips metadata
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
| `RenderMode` | `scripts/shared/utils.ts` | `'dualtone' \| 'monochrome'` |
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

### Adding a New Render Mode

1. Add SVGs to `.svgs/{renderMode}/`
2. Add render mode name to `RENDER_MODES` in `scripts/shared/utils.ts`
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
- **Build:** passing (library + docs-app)
- **Docs Rewrite:** Phase 4/7 in progress (Header, IconGrid, DrawerCode done; Drawer container, Modals, Toast pending)
- **Blockers:** None
- **Uncommitted:** Rename variant->renderMode + Phase 4 components
