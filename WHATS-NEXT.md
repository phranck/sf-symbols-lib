# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Design & Layout Fixes (Header + Drawer 1:1 replication)
- **Status**: in_progress
- **Last Updated**: 2026-02-13T04:20:00+01:00

## Current Checkpoint

- **File**: docs-app/src/styles/app.css (Drawer CSS redesign)
- **What**: Replacing header + drawer layouts to match old vanilla version 1:1. Fixed: header label duplication, icon spacing, drawer 3-column layout. Added: complete drawer CSS with syntax highlighting, responsive behavior.
- **Phase**: 6 of 7 (Layout Fixes Before Phase 7 Cleanup)

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Verify Drawer Display** - Browser should show 3-column layout (Preview | Info | Code)
2. **Test Responsive Behavior** - Verify vertical stacking on <900px
3. **Test Copy Buttons** - Verify all copy buttons work with analytics
4. **Commit Layout Fixes** - Create commit for header + drawer CSS fixes
5. **Phase 7 Cleanup** - Remove old vanilla `/docs/` files, version bump to 2.0.0

---

## In Progress (1-2 items max)

- [ ] **Design & Layout Fixes**: Replicate old vanilla version exactly
  - [x] Header: Fixed label duplication, stats bar right-aligned
  - [x] Icon Grid: Fixed spacing (flex layout with gap: 16px)
  - [x] Drawer: Added complete 3-column CSS (Preview | Info | Code)
  - [ ] Verify browser display matches old version
  - [ ] Test all interactions (copy, search, filters)

## Open (Backlog)

- [ ] **Phase 7 Cleanup & Release**: Final steps before v2.0.0
  - Remove old `/docs/` vanilla JS files
  - Delete `scripts/generate-docs-data.ts`
  - Version bump to 2.0.0
  - Publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

- **2026-02-13**: Design & Layout Fixes - Header (label duplication, stats right-align), Icon Grid (flex spacing), Drawer (3-column CSS replica)
- **2026-02-13**: Phase 6 complete! Umami analytics script tag + 7 custom event tracking hooks (icon copy/select, search, render mode, category, theme, color). Updated docs build scripts and GitHub Actions. Added 14,016 generated icon files to git for CI. Commits: 05e9566, a396526, 989b7d4, f37d796, fed522e, 512e5c1
- **2026-02-13**: Phase 5 complete! Keyboard navigation (arrow keys up/down/left/right, Enter to open), Cmd+F/Ctrl+F search focus with clear, Toast feedback on all copy operations, Error handling for clipboard failures, Progress indicator for initial render. Commit: a70a757
- **2026-02-12**: Phase 4 complete! Drawer (Preview, Info, Code), AboutModal (3 tabs), CopyModal (3 options), Toast (auto-dismiss). Plus variant→renderMode rename. All committed.
- **2026-02-12**: Phase 4 partial: Header (SearchInput, RenderModeSelect, CategorySelect, ColorPicker, ThemeToggle), IconGrid with virtual scroll, IconGridItem, DrawerCode, AboutButton
- **2026-02-12**: Phases 1-3 of docs-site rewrite (scaffold, catalog, store, hooks, layout)
- **2026-02-12**: Committed all outstanding v2 changes (4 commits: refactor, config, docs, tracking)
- **2026-02-12**: Phosphor Icons architecture analysis, docs-site-react-rewrite plan created
- **2026-02-11**: Code review (21 fixes), API optimization, shared utils, README/MIGRATION rewrite, 6 files deleted
- **2026-01-31**: Build & packaging fixes (JSX runtime, path aliases, "use client", ESLint)

## Notes

- **14,016 generated icon files** are now in git (src/dualtone/, src/monochrome/) - required for GitHub Actions CI
- Generated Icon files: previously gitignored, now committed for CI/CD pipeline support
- `docs-app/src/lib/catalog.ts` is generated; run `npx tsx scripts/generate-catalog.ts` to regenerate
- Vite bundles 14,095 modules in ~11 seconds (28.2 MB / 6.6 MB gzip)
- **Phase 6 Implementation Complete:**
  - Umami analytics: script tag in index.html + 7 tracking hooks
  - Custom event tracking: icon copy (name/appleName/code), select, search, render mode, category, theme, color
  - Updated npm scripts: docs:build (cd docs-app && npm run build)
  - GitHub Actions: changed update-pages to use docs:build
  - Build Status: ✓ TypeScript clean, ✓ Vite passes, 30 ESLint warnings (import order + react-hooks, acceptable)
- **Build Status:** ✓ TypeScript, ✓ Vite, ✓ 14,095 modules
- **Plan Files Updated:**
  - `plans/open/2026-02-12-docs-site-react-rewrite.md` — Phase 6 marked complete
  - `WHATS-NEXT.md` — Current status
  - `.claude/session-state.json` — Machine-readable state

**Last Updated**: 2026-02-13T04:20:00+01:00
