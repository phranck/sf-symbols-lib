# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite
- **Status**: in_progress
- **Last Updated**: 2026-02-12T17:45:00+01:00

## Current Checkpoint

- **File**: docs-app/src/App.tsx
- **What**: Phases 1-3 complete. Scaffold, catalog, store, hooks, App layout done. Phase 4 (components) next.
- **Phase**: 3 of 7

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. Phase 4: Build components (Header, IconGrid with virtual scroll, Drawer, Modals, Toast)
2. Phase 5: Interactions (keyboard nav, FLIP animation, clipboard, responsive)
3. Phase 6: Analytics and deploy (Umami, GitHub Pages, CNAME)

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Phase 4 (Components) next

## Open (Backlog)

- [ ] **Version Bump**: 2.0.0 and publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-12**: Phases 1-3 of docs-site rewrite (scaffold, catalog, store, hooks, layout)
- **2026-02-12**: Committed all outstanding v2 changes (4 commits: refactor, config, docs, tracking)
- **2026-02-12**: Phosphor Icons architecture analysis, docs-site-react-rewrite plan created
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README/MIGRATION rewrite, 6 files deleted
- **2026-01-31**: Build & packaging fixes (JSX runtime, path aliases, "use client", ESLint)

## Notes

- 14,014 generated icon files are gitignored; run `npm run generate` after clone
- `docs-app/src/lib/catalog.ts` is generated; run `npx tsx scripts/generate-catalog.ts` to regenerate
- Vite bundles 14,062 modules in 11.4s (28.2 MB / 6.6 MB gzip), feasibility confirmed
- App currently renders first 100 icons as placeholder; virtual scrolling in Phase 4

**Last Updated**: 2026-02-12T17:45:00+01:00
