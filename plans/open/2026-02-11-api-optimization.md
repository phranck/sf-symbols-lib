# API Optimization (Post-Phosphor Analysis)

## Preface

After analyzing the Phosphor Icons React library, this plan identifies concrete optimizations for sf-symbols-lib focused on developer experience and performance. Phosphor serves 9,000+ icons across 6 weights with a mature API that includes ref forwarding, React Context for global defaults, and native JSX rendering. Our library can adopt key patterns from Phosphor while keeping our unique strengths (4 color variants with preserved SVG detail, Apple SF Symbols fidelity). The changes are additive and non-breaking, prioritized by impact-to-effort ratio.

## Context / Problem

Our current v2.0 architecture works, but has gaps compared to industry-standard icon libraries:

1. **No ref forwarding** - Consumers cannot attach refs to the SVG element (needed for tooltips, portals, measurements)
2. **No global defaults** - Every icon must receive `size`, `className` etc. individually
3. **`dangerouslySetInnerHTML`** - Prevents React diffing, blocks SVG children composition, potential security concern
4. **Missing `sideEffects: false`** - Bundlers cannot optimize tree-shaking as aggressively
5. **Rigid inline styles** - `minWidth`/`maxWidth`/`flex` forced on every icon, hard to override

## Specification / Goal

Improve the API to match industry best practices while keeping bundle sizes minimal. All changes are backward-compatible with v2.0.

### Success Criteria

1. All icons support `forwardRef`
2. `SFIconContext.Provider` available for global defaults
3. `sideEffects: false` in package.json
4. Forced inline styles removed (use CSS class or consumer control)
5. Build + lint + typecheck still pass

### Non-Goals

- Replacing `dangerouslySetInnerHTML` with native JSX (would require fundamental generator rewrite for 28k files, deferred to v3.0)
- CJS/UMD output (ESM-only is fine for our target audience)
- SSR-specific entry point (our `"use client"` approach is sufficient)

## Design

### 1. `sideEffects: false` (package.json)

```json
{
  "sideEffects": false
}
```

One-line change. Tells bundlers our modules have no side effects, enabling more aggressive dead-code elimination.

### 2. `forwardRef` on all icons

Current generated icon:
```tsx
export function SFCheckmarkCircleFill(props: SFIconProps): ReactElement {
  return <SFIcon svgContent={SVG} viewBox={VB} {...props} />;
}
```

New generated icon:
```tsx
export const SFCheckmarkCircleFill = forwardRef<SVGSVGElement, SFIconProps>((props, ref) => (
  <SFIcon ref={ref} svgContent={SVG} viewBox={VB} {...props} />
));
SFCheckmarkCircleFill.displayName = 'SFCheckmarkCircleFill';
```

`SFIcon` itself also needs `forwardRef` to pass the ref to the `<svg>` element.

### 3. `SFIconContext` for global defaults

```tsx
import { createContext } from 'react';
import { type SFIconProps } from './types';

export const SFIconContext = createContext<Partial<SFIconProps>>({});
```

Usage:
```tsx
import { SFIconContext } from 'sf-symbols-lib/hierarchical';

<SFIconContext.Provider value={{ size: 'sm', className: 'icon' }}>
  <SFCheckmarkCircleFill />  {/* inherits size="sm" and className="icon" */}
  <SFPhone />                {/* same defaults */}
</SFIconContext.Provider>
```

`SFIcon` reads context and merges with explicit props (explicit wins).

### 4. Remove forced inline styles

Current:
```tsx
style={{
  minWidth: px,
  minHeight: px,
  maxWidth: px,
  maxHeight: px,
  flex: `0 0 ${px}px`,
  ...style,
}}
```

New: Only pass through the consumer's `style` prop. The `width`/`height` attributes already size the SVG. The forced constraints make it hard to use icons in flex layouts or resize them with CSS.

```tsx
style={style}
```

## Implementation Plan

### Phase 1: Quick Wins (no generator changes)

1. Add `sideEffects: false` to package.json
2. Remove forced inline styles from `SFIcon`
3. Add `SFIconContext` to `src/common/context.ts`
4. Update `SFIcon` to read context and merge props
5. Re-export `SFIconContext` from barrel indexes

### Phase 2: Generator Changes

1. Update `SFIcon` to use `forwardRef`
2. Update generator template to produce `forwardRef` + `displayName` components
3. Regenerate all 28k icon files
4. Update barrel exports (re-export context + types)

### Phase 3: Validation

1. Run `npm run check` (lint + typecheck + build)
2. Verify bundle sizes unchanged (forwardRef adds ~50 bytes per icon)
3. Update README with Context usage example
4. Update MIGRATION.md if needed

## Checklist

- [ ] Add `sideEffects: false` to package.json
- [ ] Remove forced inline styles from SFIcon
- [ ] Create `SFIconContext` in `src/common/context.ts`
- [ ] Update `SFIcon` to use `forwardRef` and read context
- [ ] Update generator template for `forwardRef` + `displayName`
- [ ] Regenerate all icon components
- [ ] Re-export `SFIconContext` from barrel indexes
- [ ] Run `npm run check`
- [ ] Update README with Context example
- [ ] Verify bundle sizes

## Open Questions

1. **Default size in context**: Should the context default be empty `{}` (no defaults) or mirror current defaults (`{ size: 'lg' }`)? Empty is safer since explicit component defaults still apply.

2. **`displayName` format**: `'SFCheckmarkCircleFill'` (matches export) or `'SFCheckmarkCircleFillIcon'` (Phosphor convention)? Keeping it matching the export name is simpler.

## Files

### Modified Files

```
package.json                          # sideEffects: false
src/common/SFIcon.tsx                 # forwardRef, context, remove forced styles
src/common/types.ts                   # SFIconProps may need RefAttributes
scripts/generate-sfsymbols.ts         # forwardRef template
src/{variant}/index.tsx               # re-export SFIconContext
src/{variant}/icons/*.tsx             # regenerated (28k files)
README.md                             # Context usage example
```

### New Files

```
src/common/context.ts                 # SFIconContext
```

## Dependencies

- No new external dependencies
- React 16.8+ already required for hooks (forwardRef available since React 16.3)
