# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite (Phase 6: Analytics & Deploy next)
- **Status**: in_progress
- **Last Updated**: 2026-02-13T09:45:00+01:00

## Current Checkpoint

- **File**: Phase 5 complete! (docs-app/src/)
- **What**: Phase 5 ✅ complete! Keyboard navigation (arrow keys up/down/left/right, Enter to open drawer), Cmd+F/Ctrl+F search focus with clear, Toast feedback on all copy operations, Error handling for clipboard, Progress indicator (dynamic). Build: 14,094 modules, zero errors. Commits: a70a757, 1f0776a, 000cceb. Plan updated. Ready for Phase 6.
- **Phase**: 6 of 7

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Phase 6**: Analytics & Deploy
   - Integrate Umami analytics
   - Configure build output to `docs/dist/`
   - Test GitHub Pages deployment
   - Verify custom domain (CNAME)
2. **Phase 7**: Cleanup
   - Remove old `docs/` vanilla JS files
   - Remove `generate-docs-data.ts` script
   - Update npm scripts
   - Archive old docs directory
3. **Version 2.0.0**: Major release
   - Publish to npm
   - Update changelog
   - Announce React rewrite

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Phase 6 (Analytics & Deploy next)

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
- Vite bundles 14,094 modules in ~11 seconds (28.2 MB / 6.6 MB gzip)
- **Phase 5 Implementation Complete:**
  - Arrow-key navigation: ↑↓←→ to move focus, Enter to open drawer
  - Cmd+F / Ctrl+F clears search and focuses input
  - Toast feedback on all copy operations (DrawerCode, DrawerInfo, CopyModal)
  - Error handling for clipboard failures
  - Dynamic progress indicator (fades when virtualizer ready)
- **Build Status:** ✓ TypeScript, ✓ Vite, ✓ Zero errors/warnings
- **Plan Files Updated:**
  - `plans/open/2026-02-12-docs-site-react-rewrite.md` — Phase 4 & 5 marked complete
  - `WHATS-NEXT.md` — Current status
  - `.claude/session-state.json` — Machine-readable state

**Last Updated**: 2026-02-13T09:45:00+01:00
