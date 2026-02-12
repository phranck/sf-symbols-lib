# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: Docs Site React Rewrite (Phase 7: Cleanup next)
- **Status**: Phase 6 complete, Phase 7 ready
- **Last Updated**: 2026-02-13T03:50:00+01:00

## Current Checkpoint

- **File**: Phase 6 complete! (docs-app/ + analytics integration)
- **What**: Phase 6 ✅ complete! Umami analytics integrated (script tag + 7 custom event tracking hooks in: DrawerCode, DrawerInfo, IconGrid, SearchInput, RenderModeSelect, CategorySelect, ThemeToggle, ColorPicker). Updated npm scripts (docs:build), GitHub Actions workflow (docs:build), verified CNAME. Generated 14,016 icon files added to git for CI support. Build successful: 14,095 modules, 30 ESLint warnings (acceptable). Ready for Phase 7 cleanup.
- **Phase**: 7 of 7 (final cleanup)

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. **Phase 7**: Cleanup & Release
   - Remove old `/docs/` vanilla JS files, CSS, scripts (keep /docs/dist/)
   - Delete `scripts/generate-docs-data.ts` (no longer needed)
   - Clean up old npm scripts (docs:generate, docs:preview can reference docs:build)
   - Optional: Rename `docs-app/` to `docs/` (major refactor)
2. **Version 2.0.0**: Major release
   - Bump version in package.json to 2.0.0
   - Publish to npm
   - Update CHANGELOG.md
   - Announce React rewrite on GitHub

---

## In Progress (1-2 items max)

- [ ] **Docs Site React Rewrite**: Phase 7 (Cleanup & Release)

## Open (Backlog)

- [ ] **Version Bump**: 2.0.0 and publish to npm
- [ ] **Accessibility**: `aria-hidden`, `focusable="false"`, `color` prop
- [ ] **"use client" Directive**: Add to individual icon files for Next.js RSC
- [ ] **Engine Requirement**: Lower `engines: >=22.0.0`
- [ ] **License Field**: Add to package.json

## Completed

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

**Last Updated**: 2026-02-13T03:50:00+01:00
