# Docs Site React Rewrite

## Preface

The current docs/preview site is built with vanilla ES modules (no framework, no bundler). It loads 7,007 SF Symbol icons by fetching chunked JSON files containing raw SVG strings, then renders them via `innerHTML`. This approach has significant drawbacks: ~30 JSON chunk files per variant must be fetched sequentially, all 7,007 DOM nodes are created eagerly, and the SVG data pipeline is completely separate from the actual library.

The Phosphor Icons homepage (phosphoricons.com) demonstrates a superior approach: it is a React/Vite app that imports its own `@phosphor-icons/react` components directly. Each icon in the grid is rendered as a real React component (`<Icon />`). Metadata (names, tags, categories) comes from a separate `@phosphor-icons/core` package and powers fuzzy search via `fuse.js`. There is no chunking, no JSON fetching, and no `dangerouslySetInnerHTML`.

This plan rewrites the docs site as a React/Vite app following the same pattern: import `sf-symbols-lib` components directly, use a metadata catalog for search/filtering, and add virtual scrolling for the 7,007-icon grid.

## Context / Problem

1. **Chunked JSON loading**: 15 chunks per variant (dualtone + monochrome = 30 fetches). Sequential loading with a progress bar. Total payload is several MB of SVG strings.
2. **No virtual scrolling**: All 7,007 icon cards are in the DOM simultaneously. Filtering triggers a full DOM rebuild of up to 7,007 elements.
3. **Separate data pipeline**: `generate-docs-data.ts` re-parses all SVG source files to produce JSON chunks. This is a parallel pipeline to `generate-sfsymbols.ts` that produces the actual React components. Any change to SVG processing must be maintained in two places.
4. **innerHTML rendering**: Icon cards use `card.innerHTML = createSvgElement(...)`. No React reconciliation, no component reuse.
5. **Vanilla JS complexity**: 7 ES module files (~1,200 lines total) implement search, filtering, keyboard navigation, theme switching, color picker, modals, drawer, and FLIP animations without a framework. This is hard to maintain and extend.

## Specification / Goal

Replace the vanilla JS docs site with a React/Vite app that imports `sf-symbols-lib` components directly.

### Success Criteria

1. All icons render as actual React components (no JSON chunks, no innerHTML)
2. Virtual scrolling handles 7,007 icons without creating all DOM nodes
3. Fuzzy search with `fuse.js` on icon metadata (name, category, tags)
4. All existing features preserved (see Feature Parity Checklist)
5. Build output deploys to `docs/dist/` for GitHub Pages
6. Initial page load is faster than the current chunked approach
7. `generate-docs-data.ts` and all chunk infrastructure can be removed

### Feature Parity Checklist

All features from the current vanilla JS site must be preserved:

- [x] Icon grid with responsive CSS grid layout
- [x] Search with OR (`|`) and AND (`&` / space) operators
- [x] Rendering mode selector (dualtone / monochrome)
- [x] Category filter dropdown
- [x] "Showing X / Total Y" counter
- [x] Light / Dark theme toggle (persisted in localStorage)
- [x] 42-color picker with "T" (theme/currentColor) option (persisted in localStorage)
- [x] Bottom drawer with 3-column layout (preview, info, code)
- [x] Syntax-highlighted React code preview in drawer
- [x] Copy-to-clipboard for symbol name, Apple name, and code snippet
- [x] About modal with 3 tabs (About / Search / Shortcuts)
- [x] Keyboard navigation (arrow keys, Enter, Escape, Cmd+F)
- [ ] FLIP animation on grid re-renders (when < 300 visible) - deferred (incompatible with virtual scrolling)
- [x] Restricted-symbol info icons (574 Apple-restricted symbols)
- [x] Toast notifications for clipboard feedback
- [x] Progress indicator during initial load
- [x] Umami analytics integration
- [x] Custom domain (CNAME: sfsymbolslib.layered.work)
- [x] Responsive layout (drawer stacks vertically below 900px)
- [x] Scroll-margin for fixed header and open drawer

## Design

### Architecture

```
docs-app/                         # New directory alongside docs/
├── index.html                    # Vite entry point
├── package.json                  # React app dependencies
├── tsconfig.json
├── vite.config.ts                # Build to docs/dist/
├── public/
│   ├── CNAME                     # GitHub Pages custom domain
│   ├── about.md                  # Existing markdown content
│   ├── search.md
│   └── shortcuts.md
└── src/
    ├── main.tsx                  # ReactDOM.createRoot entry
    ├── App.tsx                   # Top-level layout
    ├── lib/
    │   ├── icons.ts              # Wildcard import + metadata merge
    │   └── catalog.ts            # Icon metadata (name, categories, tags)
    ├── state/
    │   └── store.ts              # Zustand store
    ├── components/
    │   ├── Header/
    │   │   ├── Header.tsx        # Search, variant selector, controls
    │   │   ├── SearchInput.tsx
    │   │   ├── VariantSelect.tsx
    │   │   ├── CategorySelect.tsx
    │   │   ├── ColorPicker.tsx
    │   │   └── ThemeToggle.tsx
    │   ├── IconGrid/
    │   │   ├── IconGrid.tsx      # Virtual scroll container
    │   │   ├── IconGridItem.tsx  # Single icon card
    │   │   └── index.ts
    │   ├── Drawer/
    │   │   ├── Drawer.tsx        # Bottom drawer container
    │   │   ├── DrawerPreview.tsx
    │   │   ├── DrawerInfo.tsx
    │   │   └── DrawerCode.tsx
    │   ├── Modals/
    │   │   ├── AboutModal.tsx    # 3-tab modal
    │   │   └── CopyModal.tsx     # Copy options dialog
    │   └── Toast/
    │       └── Toast.tsx
    ├── hooks/
    │   ├── useKeyboardNav.ts
    │   ├── useTheme.ts
    │   └── useFuse.ts
    └── styles/
        ├── variables.css         # Ported from docs/styles/variables.css
        ├── app.css               # Ported from docs/styles/main.css
        └── drawer.css            # Ported from docs/styles/drawer.css
```

### Key Design Decisions

#### 1. Icon Loading (like Phosphor)

```typescript
// docs-app/src/lib/icons.ts
import * as DualtoneIcons from 'sf-symbols-lib/dualtone';
import * as MonochromeIcons from 'sf-symbols-lib/monochrome';
import { catalog, type CatalogEntry } from './catalog';

export interface IconEntry extends CatalogEntry {
  DualtoneIcon: React.ComponentType;
  MonochromeIcon: React.ComponentType;
}

export const icons: ReadonlyArray<IconEntry> = catalog.map((entry) => ({
  ...entry,
  DualtoneIcon: DualtoneIcons[entry.pascalName as keyof typeof DualtoneIcons],
  MonochromeIcon: MonochromeIcons[entry.pascalName as keyof typeof MonochromeIcons],
}));
```

This eliminates all JSON chunk infrastructure. Vite handles bundling and code-splitting.

#### 2. Metadata Catalog

A new build step generates `docs-app/src/lib/catalog.ts` from the SVG source files:

```typescript
// Generated file
export interface CatalogEntry {
  name: string;          // "arrow.down.circle.fill"
  pascalName: string;    // "ArrowDownCircleFill"
  categories: string[];  // ["arrows"]
  restricted: boolean;   // true if Apple-restricted
}

export const catalog: ReadonlyArray<CatalogEntry> = [
  { name: "0.circle", pascalName: "Num0Circle", categories: ["indices"], restricted: false },
  // ... 7,006 more entries
];

export const categories: ReadonlyArray<string> = ["all", "arrows", "communication", ...];
```

#### 3. Virtual Scrolling

Use `@tanstack/react-virtual` for the icon grid. Only ~100 icons are in the DOM at any time. The grid calculates row count based on viewport width and column count.

```tsx
// Simplified concept
const rowVirtualizer = useVirtualizer({
  count: Math.ceil(filteredIcons.length / columnCount),
  getScrollElement: () => scrollRef.current,
  estimateSize: () => ROW_HEIGHT,
  overscan: 5,
});
```

#### 4. State Management (Zustand)

```typescript
interface AppState {
  // Display
  theme: 'light' | 'dark';
  variant: 'dualtone' | 'monochrome';
  iconColor: string;
  
  // Search & Filter
  searchQuery: string;
  selectedCategory: string;
  filteredIcons: ReadonlyArray<IconEntry>;
  
  // Selection
  selectedIcon: IconEntry | null;
  drawerOpen: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setVariant: (variant: string) => void;
  setIconColor: (color: string) => void;
  setTheme: (theme: string) => void;
  setSelectedIcon: (icon: IconEntry | null) => void;
  // ...
}
```

#### 5. Search

Replace the current string-contains logic with `fuse.js` for fuzzy search, while keeping support for OR (`|`) and AND (`&`) operators via pre-processing the query before passing to Fuse.

#### 6. Build & Deploy

- `vite build` outputs to `docs/dist/`
- `docs/dist/` is the GitHub Pages deploy target (existing setup)
- The old `docs/` source files (vanilla JS) are removed after migration
- `docs-app/` becomes the new source directory

### Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "fuse.js": "^7.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "sf-symbols-lib": "link:../"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

### Performance Considerations

- **Bundle size**: 7,007 × 2 variants = 14,014 components imported. Vite will tree-shake unused exports but with `import *` everything is included. The total SVG data is baked into the JS bundle. Expected bundle size: 15-25 MB uncompressed, ~3-5 MB gzipped. This is comparable to the current chunk approach (all chunks combined).
- **Virtual scrolling**: Only ~100 DOM nodes at any time vs. 7,007 currently. Massive improvement for scroll performance and initial render.
- **Search**: Fuse.js index is built once on startup from the catalog. Searching 7,007 entries is fast (~5ms).
- **Variant switching**: Both variants are pre-loaded (imported at startup). Switching is instant (no fetch needed).

### Migration Strategy

1. Build the new React app in `docs-app/` alongside the existing `docs/`
2. Test feature parity against the current site
3. Once verified, configure `vite build` to output to `docs/dist/`
4. Remove old `docs/scripts/`, `docs/styles/`, `docs/index.html`
5. Remove `generate-docs-data.ts` and chunk-related code
6. Update npm scripts

## Implementation

### Phase 1: Project Scaffolding ✅
- [x] 1.1 Create `docs-app/` directory with Vite + React + TypeScript setup
- [x] 1.2 Configure `vite.config.ts` (output to `docs/dist/`, alias `sf-symbols-lib`)
- [x] 1.3 Set up `package.json` with dependencies (react, zustand, fuse.js, @tanstack/react-virtual)
- [x] 1.4 Set up `tsconfig.json` with path aliases
- [x] 1.5 Port CSS files from `docs/styles/` to `docs-app/src/styles/`
- [x] 1.6 Copy static assets (`CNAME`, markdown files) to `docs-app/public/`

### Phase 2: Catalog & Icon Loading ✅
- [x] 2.1 Create catalog generator script (`scripts/generate-catalog.ts`) to produce `catalog.ts`
- [x] 2.2 Generate `src/lib/catalog.ts` with icon metadata (7,007 icons, 30 categories, 573 restricted)
- [x] 2.3 Create `src/lib/icons.ts` with wildcard import + metadata merge
- [x] 2.4 Vite bundles 14,062 modules in 11.4s (28.2 MB / 6.6 MB gzip) - feasibility confirmed

### Phase 3: State & Core Infrastructure ✅
- [x] 3.1 Create Zustand store (`src/state/store.ts`) with theme, variant, color, search, drawer, modal state
- [x] 3.2 Implement theme hook (`useTheme.ts`) with localStorage persistence and DOM sync
- [x] 3.3 Implement fuse.js search hook (`useFuse.ts`) with OR/AND operator support
- [x] 3.4 Create `App.tsx` with top-level layout (header, grid stub, footer, stats bar)

### Phase 4: Components ✅
- [x] 4.1 Header component (SearchInput, RenderModeSelect, CategorySelect)
- [x] 4.2 ThemeToggle component
- [x] 4.3 ColorPicker component (42 colors + theme color)
- [x] 4.4 IconGrid with `@tanstack/react-virtual` (virtual rows, responsive columns)
- [x] 4.5 IconGridItem (renders actual `<Icon />` component, restricted badge, selection state)
- [x] 4.6 Drawer component (3-column layout: preview, info, code)
- [x] 4.7 DrawerCode with syntax-highlighted React code preview
- [x] 4.8 AboutModal with 3 tabs (About / Search / Shortcuts) and markdown rendering
- [x] 4.9 CopyModal with 3 copy options
- [x] 4.10 Toast component

### Phase 5: Interactions & Polish ✅
- [x] 5.1 Keyboard navigation (arrow keys up/down/left/right, Enter to open drawer)
- [x] 5.2 Cmd+F/Ctrl+F search focus with search clear
- [x] 5.3 Copy-to-clipboard for symbol name, Apple name, code snippet (with error handling)
- [x] 5.4 Search OR/AND operator support (already done in Phase 3 via useFuse.ts)
- [x] 5.5 Showing X / Total Y counter (already in header)
- [x] 5.6 Responsive layout (drawer stacks below 900px - already done)
- [x] 5.7 Scroll-margin handling for fixed header and drawer (already in CSS)
- [x] 5.8 Progress indicator during initial render (dynamic loading bar)

### Phase 6: Analytics & Deploy ✅
- [x] 6.1 Integrate Umami analytics (script tag + 7 tracking hooks)
- [x] 6.2 Configure build output to `docs/dist/` (verified)
- [x] 6.3 Test GitHub Pages deployment (CI/CD pipeline)
- [x] 6.4 Verify custom domain (CNAME) (confirmed in docs-app/public/)
- [x] 6.5 Fix CI/CD: Add 14,016 generated icon files to git
- [x] 6.6 Auto-fix ESLint warnings (30 remaining, acceptable)

### Phase 7: Cleanup & Release ✅
- [x] 7.1 Remove old `docs/scripts/`, `docs/styles/`, `docs/index.html` (keep docs/dist/)
- [x] 7.2 Remove `docs/data/` directory
- [x] 7.3 Remove `generate-docs-data.ts` script
- [x] 7.4 Move `docs-app/` into `docs/` (single directory for docs site)
- [x] 7.5 Fix CI workflow (remove generate job, fix deps, add docs npm ci)
- [x] 7.6 TypeScript refactorings (useClickOutside, useLatestRef, analytics module, icons merge)
- [x] 7.7 Bump version to 2.0.0, then 2.0.1 (MIT license, badge fixes)
- [x] 7.8 Publish to npm (v2.0.1)
- [x] 7.9 Update README (project structure, MIT license, badge URL fix)

## Risks

1. **Bundle size**: 14,014 components may produce a very large JS bundle. Mitigation: measure early in Phase 2.4, consider lazy imports per variant if too large.
2. **Build time**: Vite may struggle with 14,014 module imports. Mitigation: test in Phase 2.4, consider pre-bundling.
3. **Virtual scroll + grid**: `@tanstack/react-virtual` virtualizes rows, not a 2D grid. Need to calculate rows from columns. This is a solved pattern but requires careful implementation.
4. **FLIP animations**: Harder with virtual scrolling since off-screen items don't have DOM nodes. May need to limit FLIP to non-virtualized scenarios (< 300 visible).

## Completed

### ✅ Phases 1-6 Complete (2026-02-13)

**Phase 1: Project Scaffolding** ✅
- Vite + React + TypeScript setup
- Build pipeline to `docs/dist/`
- CSS ported from vanilla site

**Phase 2: Catalog & Icon Loading** ✅
- Icon catalog generator
- 7,007 icons + metadata
- Wildcard imports with Vite bundling

**Phase 3: State & Core Infrastructure** ✅
- Zustand store (theme, variant, search, drawer, modals, toast)
- Theme hook with localStorage + DOM sync
- Fuse.js search with OR/AND operators

**Phase 4: Components** ✅
- Header (SearchInput, RenderModeSelect, CategorySelect, ColorPicker, ThemeToggle)
- IconGrid with virtual scrolling (@tanstack/react-virtual)
- Drawer (3-column: Preview, Info, Code) with responsive stacking
- AboutModal (3 tabs), CopyModal (3 options), Toast

**Phase 5: Interactions & Polish** ✅
- Arrow-key navigation (↑↓←→) in grid
- Enter-key to open drawer
- Cmd+F / Ctrl+F search focus with clear
- Toast feedback on all copy operations
- Error handling for clipboard failures
- Dynamic progress indicator for initial load

**Phase 6: Analytics & Deploy** ✅
- Umami analytics: script tag + 7 custom tracking hooks
- Event tracking: icon copy (name/appleName/code), select, search, render mode, category, theme, color
- npm scripts: added `docs:build` (cd docs-app && npm run build), updated `docs:preview`
- GitHub Actions: updated `update-pages` job to use `docs:build`
- CI/CD fix: added 14,016 generated icon files to git (src/dualtone/, src/monochrome/)
- ESLint: auto-fixed import ordering, 30 warnings remaining (acceptable)

**Build Status:**
- ✓ 14,095 modules bundled in ~11 seconds
- ✓ No TypeScript errors
- ✓ 30 ESLint warnings (import order + react-hooks, acceptable)
- ✓ All Phase 6 features working

**Commits:**
- 05e9566: Feat - Add Umami analytics and update docs build
- a396526: Fix - Resolve React Hooks and lint errors
- fed522e: Chore - Add generated SF Symbol components to git
- 512e5c1: Chore - Auto-fix ESLint import order warnings
- 81285b2: Chore - Update WHATS-NEXT.md after Phase 6 completion

### ✅ Phase 7 Complete (2026-02-12)

**Phase 7: Cleanup & Release** ✅
- Removed old vanilla docs (scripts/, styles/, data/, markdown files)
- Moved docs-app/ into docs/ (single directory)
- Removed generate-docs-data.ts and execSync call
- Fixed CI workflow (removed generate job, fixed dependencies)
- TypeScript refactorings: useClickOutside, useLatestRef, analytics module, icons merge
- Version bump to 2.0.0, then 2.0.1 (MIT license, badge fixes)
- Published to npm (v2.0.1)
- Updated README (project structure, MIT license, badge URL)

**All 7 phases complete.** Plan moved to `plans/done/`.
