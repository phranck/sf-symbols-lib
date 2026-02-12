# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: None
- **Status**: pending
- **Last Updated**: 2026-02-12T22:10:00+01:00

## Current Checkpoint

- **File**: N/A
- **What**: Phase 7 (Cleanup & Release) complete. All phases of docs-site-react-rewrite plan done. CI pipeline green. npm v2.0.0 published.
- **Phase**: 7 of 7 (Complete)

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Verify live site** - Check https://sfsymbolslib.layered.work after GitHub Pages deploy
2. **Verify npm package** - Check https://www.npmjs.com/package/sf-symbols-lib shows v2.0.0
3. **Move plan to done** - `git mv plans/open/2026-02-12-docs-site-react-rewrite.md plans/done/`
4. **Accessibility improvements** - `aria-hidden`, `focusable="false"`, `color` prop
5. **"use client" directive** - Add to individual icon files for Next.js RSC

---

## In Progress (1-2 items max)

(None)

## Open (Backlog)

- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-12**: Phase 7 complete! Cleanup & Release: removed old vanilla docs (scripts/, styles/, data/, markdown), moved docs-app/ to docs/, removed generate-docs-data.ts, CI fix (removed generate job, fixed deps), TypeScript refactorings (useClickOutside, useLatestRef, analytics module, icons merge), version bump to 2.0.0, npm published
- **2026-02-13**: Design & Layout Fixes - Header (label duplication, stats right-align), Icon Grid (flex spacing), PreviewCard (3-column CSS replica)
- **2026-02-13**: Phase 6 complete! Umami analytics script tag + 7 custom event tracking hooks
- **2026-02-13**: Phase 5 complete! Keyboard navigation, search focus, Toast feedback, progress indicator
- **2026-02-12**: Phase 4 complete! Drawer, AboutModal, CopyModal, Toast
- **2026-02-12**: Phases 1-3 of docs-site rewrite (scaffold, catalog, store, hooks, layout)
- **2026-02-12**: Phosphor Icons architecture analysis, docs-site-react-rewrite plan created
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README/MIGRATION rewrite
- **2026-01-31**: Build & packaging fixes (JSX runtime, path aliases, "use client", ESLint)

## Notes

- **14,016 generated icon files** are in git (src/dualtone/, src/monochrome/) for CI/CD
- `docs/src/lib/catalog.ts` is generated; run `npx tsx scripts/generate-catalog.ts` to regenerate
- Docs site builds 14,095 modules in ~8 seconds
- CI pipeline: lint-and-typecheck -> build -> update-pages (on main) / publish-npm (on release)
- All old vanilla docs files removed; docs/ now contains only the React app source + dist/
- TypeScript refactorings: useClickOutside hook, useLatestRef hook, analytics direct module, icons.ts merge

**Last Updated**: 2026-02-12T22:10:00+01:00
