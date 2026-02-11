# sf-symbols-lib - Tasks

## In Progress

(none)

## Open Tasks

### Medium Priority

- [ ] **Version Bump**: Bump to 2.0.0 and publish to npm
- [ ] **Docs Site Performance**: renderSymbols() rebuilds 7k DOM elements per render. Needs event delegation, batch rendering, cached queries.
- [ ] **CI Pipeline Update**: Verify CI handles 28k generated icon files correctly (gitignored, must regenerate)

### Low Priority

- [ ] **README auf npmjs.com**: Verify CI publish shows updated README correctly
- [ ] **System-Preference-Detection**: Initial theme based on `prefers-color-scheme`
- [ ] **Theme-Transition-Animationen**: Smooth theme switch transitions

## Completed

### 2026-02-11

- [x] **Tree-Shakeable v2.0**: All 5 phases complete. Generator, SFIcon, 28k icons across 4 variants, compat layer, Vite preserveModules, README/MIGRATION.md, docs site code examples, bundle size validated (1 icon: ~1.1 KB, 5 icons: 7 KB), npm pack verified (112k files)
- [x] **Docs Circular Dependency Fix**: Resolved theme.js <-> colors.js TDZ crash via CustomEvent
- [x] **Docs Preload Fix**: Changed `<link rel="preload" as="script">` to `<link rel="modulepreload">`
- [x] **SVG Metadata Integration**: Embedded XML metadata parsing, 30 categories, category filter on website

### 2026-01-31

- [x] **Build & Packaging Fixes**: JSX runtime, path aliases, "use client" directive, ESLint, npm publish

## Notes

- Individual icon: ~1.1 KB (avg 2.1 KB). Compat data per variant: ~13 MB. Total dist: ~568 MB.
- Generated icons are gitignored, must run `npm run generate` after clone.
- All 4 variants: hierarchical, monochrome, palette, multicolor

---

**Last Updated:** 2026-02-11 (24:00)
