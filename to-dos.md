# sf-symbols-lib - Tasks

## In Progress

- [ ] **Tree-Shakeable Architecture v2.0**: Phases 1-3 complete (generator, compat layer, build config). Phases 4-5 remaining (docs, testing). See `plans/open/2026-02-11-tree-shakeable-icons.md`

## Open Tasks

### High Priority

- [ ] **Post-Regenerate Build**: Run full `npm run build` after metadata-strip fix in generator
- [ ] **Lint & Typecheck**: Run `npm run lint` + `npm run typecheck`, fix issues
- [ ] **Gitignore Decision**: Decide whether to gitignore generated `src/*/icons/*.tsx` (28k files) or commit them
- [ ] **README Migration Section**: Document new tree-shakeable API, before/after examples, bundle size comparison
- [ ] **MIGRATION.md**: Detailed migration guide from v1.x to v2.0
- [ ] **Test Consumer Project**: Fresh Next.js app testing both old and new API, bundle size analysis

### Medium Priority

- [ ] **Docs Site Performance**: renderSymbols() rebuilds 7k DOM elements per render. Needs event delegation, batch rendering, cached queries.
- [ ] **Docs Site Code Examples**: Update code preview to show new tree-shakeable import API
- [ ] **CI Pipeline Update**: Verify CI handles 28k generated icon files correctly

### Low Priority

- [ ] **README auf npmjs.com**: Verify v1.1.3 CI publish shows README correctly
- [ ] **System-Preference-Detection**: Initial theme based on `prefers-color-scheme`
- [ ] **Theme-Transition-Animationen**: Smooth theme switch transitions

## Completed

### 2026-02-11

- [x] **Tree-Shakeable Phases 1-3**: Generator rewrite, SFIcon/types, 28k individual icon components, compat layer with deprecation, Vite preserveModules, package.json exports
- [x] **Docs Circular Dependency Fix**: Resolved theme.js <-> colors.js TDZ crash via CustomEvent
- [x] **Docs Preload Fix**: Changed `<link rel="preload" as="script">` to `<link rel="modulepreload">`
- [x] **SVG Metadata Integration**: Embedded XML metadata parsing, 30 categories, category filter on website
- [x] **Metadata Integration Plan**: Completed all phases

### 2026-01-31

- [x] **Build & Packaging Fixes**: JSX runtime, path aliases, "use client" directive, ESLint, npm publish

## Notes

- Individual icon: ~1.5 KB. Compat data per variant: ~15 MB. Total dist: ~591 MB.
- Old `src/common/SFSymbol.tsx` removed (replaced by `src/compat/SFSymbol.tsx`)
- All 4 variants now supported: hierarchical, monochrome, palette, multicolor

---

**Last Updated:** 2026-02-11 (22:00)
