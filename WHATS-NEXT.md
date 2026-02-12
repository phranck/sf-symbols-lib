# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite
- **Status**: in_progress
- **Last Updated**: 2026-02-13T00:00:00+01:00

## Current Checkpoint

- **File**: Phase 5 complete! (docs-app/src/)
- **What**: Phase 5 done! Keyboard navigation (arrow keys, Enter), Cmd+F search focus, Toast feedback on all copy operations, Error handling, Progress indicator. Build verified (14094 modules). Commit: a70a757. Next: Phase 6 (Analytics & Deploy)
- **Phase**: 6 of 7

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Phase 5.1-5.8**: Implement interactions and polish
   - Keyboard navigation (arrow keys, Enter, Escape, Cmd+F)
   - FLIP animations on grid re-renders
   - Copy-to-clipboard for symbol name, Apple name, code snippet
   - Search OR/AND operator support
   - Showing X / Total Y counter
   - Responsive layout (drawer stacks below 900px)
   - Scroll-margin handling
   - Progress indicator during initial render
2. **Phase 6**: Analytics & Deploy (Umami, GitHub Pages, custom domain)
3. **Phase 7**: Cleanup (remove old docs/, generate-docs-data.ts, etc.)

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Phase 5 (Interactions & Polish)

## Open (Backlog)

- [ ] **Version Bump**: 2.0.0 and publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-13**: Phase 5 complete! Keyboard navigation (arrow keys up/down/left/right, Enter to open), Cmd+F/Ctrl+F search focus with clear, Toast feedback on all copy operations, Error handling for clipboard failures, Progress indicator for initial render. Commit: a70a757
- **2026-02-12**: Phase 4 complete! Drawer (Preview, Info, Code), AboutModal (3 tabs), CopyModal (3 options), Toast (auto-dismiss). Plus variant→renderMode rename. All committed.
- **2026-02-12**: Phase 4 partial: Header (SearchInput, RenderModeSelect, CategorySelect, ColorPicker, ThemeToggle), IconGrid with virtual scroll, IconGridItem, DrawerCode, AboutButton
- **2026-02-12**: Phases 1-3 of docs-site rewrite (scaffold, catalog, store, hooks, layout)
- **2026-02-12**: Committed all outstanding v2 changes (4 commits: refactor, config, docs, tracking)
- **2026-02-12**: Phosphor Icons architecture analysis, docs-site-react-rewrite plan created
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README/MIGRATION rewrite, 6 files deleted
- **2026-01-31**: Build & packaging fixes (JSX runtime, path aliases, "use client", ESLint)

## Notes

- 14,014 generated icon files are gitignored; run `npm run generate` after clone
- `docs-app/src/lib/catalog.ts` is generated; run `npx tsx scripts/generate-catalog.ts` to regenerate
- Vite bundles 14,062 modules in 11.4s (28.2 MB / 6.6 MB gzip), feasibility confirmed
- All Phase 4 components + rename are uncommitted in the working tree
- Old vanilla JS drawer has no close button (only Escape key), no categories/restricted in info column, 3 copy buttons total

**Last Updated**: 2026-02-13T00:00:00+01:00
