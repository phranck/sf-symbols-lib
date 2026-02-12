# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite
- **Status**: pending
- **Last Updated**: 2026-02-12T15:10:00+01:00

## Current Checkpoint

- **File**: plans/open/2026-02-12-docs-site-react-rewrite.md
- **What**: Plan complete (7 phases, 34 tasks). No implementation started.
- **Phase**: 0 of 7

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. Commit all outstanding changes on main (large uncommitted diff)
2. Scaffold `docs-app/` with Vite + React + TypeScript (Phase 1)
3. Test Vite bundling of 14,014 icon components (Phase 2, feasibility gate)

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Replace vanilla JS docs with React/Vite app importing sf-symbols-lib directly

## Open (Backlog)

- [ ] **Version Bump**: 2.0.0 and publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-12**: Phosphor Icons architecture analysis, docs-site-react-rewrite plan created
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README/MIGRATION rewrite, 6 files deleted
- **2026-01-31**: Build & packaging fixes (JSX runtime, path aliases, "use client", ESLint)

## Notes

- All changes since 2026-02-11 are uncommitted on main
- 14,014 generated icon files are gitignored; run `npm run generate` after clone

**Last Updated**: 2026-02-12T15:10:00+01:00
