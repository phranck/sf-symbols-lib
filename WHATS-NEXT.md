# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: None
- **Status**: pending
- **Last Updated**: 2026-02-12T22:35:00+01:00

## Current Checkpoint

- **File**: N/A
- **What**: All 7 phases of docs-site-react-rewrite complete. v2.0.1 published to npm. CI green. MIT license added.
- **Phase**: 7 of 7 (Complete)

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Verify live site** - Check https://sfsymbolslib.layered.work after GitHub Pages deploy
2. **Verify npm package** - Check https://www.npmjs.com/package/sf-symbols-lib shows v2.0.1 with updated README
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

## Completed

- **2026-02-12**: v2.0.1 patch release (MIT license, CI badge fix, README div fix)
- **2026-02-12**: Phase 7 complete! Cleanup & Release: removed old vanilla docs, moved docs-app/ to docs/, CI fix, TypeScript refactorings, version bump to 2.0.0
- **2026-02-13**: Design & Layout Fixes, Phase 6 (analytics), Phase 5 (keyboard nav)
- **2026-02-12**: Phases 1-4 of docs-site rewrite (scaffold through modals)
- **2026-02-12**: Phosphor Icons analysis, docs-site-react-rewrite plan
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README rewrite
- **2026-01-31**: Build & packaging fixes

## Notes

- **14,016 generated icon files** are in git (src/dualtone/, src/monochrome/) for CI/CD
- `docs/src/lib/catalog.ts` is generated; run `npx tsx scripts/generate-catalog.ts` to regenerate
- CI pipeline: lint-and-typecheck -> build -> update-pages (on main) / publish-npm (on release)
- License changed from CC-BY-NC-SA 4.0 to MIT
- `--access public` is not needed for unscoped packages (default is public)

**Last Updated**: 2026-02-12T22:35:00+01:00
