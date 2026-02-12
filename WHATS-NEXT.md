# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite
- **Status**: in_progress
- **Last Updated**: 2026-02-12T22:30:00+01:00

## Current Checkpoint

- **File**: docs-app/src/components/Drawer/
- **What**: Phase 4 in progress. Tasks 4.1-4.5 done (Header, IconGrid). DrawerCode (4.7) exists. Rename variant->renderMode done but uncommitted. Next: Drawer container (4.6), then Modals/Toast (4.8-4.10).
- **Phase**: 4 of 7

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. Build Drawer component (4.6): DrawerPreview.tsx, DrawerInfo.tsx, Drawer.tsx container, wire into App.tsx
2. Build AboutModal (4.8), CopyModal (4.9), Toast (4.10)
3. Commit all uncommitted work (rename + Phase 4 components)
4. Phase 5: Interactions (keyboard nav, FLIP animation, clipboard, responsive)

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Phase 4.6 (Drawer component) next

## Open (Backlog)

- [ ] **Version Bump**: 2.0.0 and publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-12**: Phase 4 partial: Header (SearchInput, RenderModeSelect, CategorySelect, ColorPicker, ThemeToggle), IconGrid with virtual scroll, IconGridItem, DrawerCode
- **2026-02-12**: Rename variant->renderMode in store, scripts, utils (uncommitted)
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

**Last Updated**: 2026-02-12T22:30:00+01:00
