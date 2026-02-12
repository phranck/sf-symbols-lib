# Migration Guide: v1.x to v2.0

This guide covers migrating from the legacy `SFSymbol` component to the new tree-shakeable icon imports.

## Why Migrate?

| | v1.x (Legacy) | v2.0 (Tree-Shakeable) |
|---|---|---|
| **Bundle size (5 icons)** | ~15 MB per variant | ~7.5 KB |
| **Bundle size (20 icons)** | ~15 MB per variant | ~30 KB |
| **Import style** | Enum lookup | Direct component |
| **Tree-shaking** | Not possible | Full support |
| **Autocomplete** | Enum members | Component names |

## Step-by-Step Migration

### 1. Update Imports

**Before:**

```tsx
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib';
```

**After:**

```tsx
import { SFCheckmarkCircleFill, SFPhone, SFTrash } from 'sf-symbols-lib/dualtone';
```

If you used a specific variant:

```tsx
// Before
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib';
// with variant="monochrome" on component

// After
import { SFCheckmarkCircleFill } from 'sf-symbols-lib/monochrome';
```

### 2. Replace Component Usage

**Before:**

```tsx
<SFSymbol name={SFSymbolName.SFCheckmarkCircleFill} size="lg" />
<SFSymbol name={SFSymbolName.SFPhone} size={32} className="icon" />
<SFSymbol name={SFSymbolName.SFTrash} size="md" variant="monochrome" />
```

**After:**

```tsx
<SFCheckmarkCircleFill size="lg" />
<SFPhone size={32} className="icon" />
<SFTrash size="md" />  {/* variant is determined by import path */}
```

Key changes:
- No `name` prop needed. Each icon is its own component.
- No `variant` prop. The variant is determined by the import path (`sf-symbols-lib/dualtone`, `sf-symbols-lib/monochrome`).
- `size` accepts the same presets (`'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`) or numbers.

### 3. Update Dynamic Icon Usage

If you select icons dynamically, store component references instead of enum values:

**Before:**

```tsx
const iconName = isActive ? SFSymbolName.SFCheckmarkCircleFill : SFSymbolName.SFCircle;
<SFSymbol name={iconName} size="md" />
```

**After:**

```tsx
import { SFCheckmarkCircleFill, SFCircle } from 'sf-symbols-lib/dualtone';

const Icon = isActive ? SFCheckmarkCircleFill : SFCircle;
<Icon size="md" />
```

### 4. Update Icon Maps

If you maintain icon maps or lookup objects:

**Before:**

```tsx
const statusIcons: Record<Status, SFSymbolName> = {
  done: SFSymbolName.SFCheckmarkCircleFill,
  pending: SFSymbolName.SFCircle,
  error: SFSymbolName.SFXmarkCircleFill,
};

<SFSymbol name={statusIcons[status]} size="sm" />
```

**After:**

```tsx
import { SFCheckmarkCircleFill, SFCircle, SFXmarkCircleFill } from 'sf-symbols-lib/dualtone';
import { type ComponentType } from 'react';
import { type SFIconProps } from 'sf-symbols-lib/dualtone';

const statusIcons: Record<Status, ComponentType<SFIconProps>> = {
  done: SFCheckmarkCircleFill,
  pending: SFCircle,
  error: SFXmarkCircleFill,
};

const Icon = statusIcons[status];
<Icon size="sm" />
```

## Props Changes

| v1.x Prop | v2.0 Prop | Notes |
|-----------|-----------|-------|
| `name` | removed | Each icon is its own component |
| `variant` | removed | Determined by import path |
| `size` | `size` | Same presets + numbers (default changed to `'lg'`) |
| `className` | `className` | Unchanged |
| `style` | `style` | Unchanged |
| `color` | `style={{ color }}` | Use CSS instead |
| `strokeWidth` | `strokeWidth` | Passed through as SVG attribute |
| `svgContent` | removed | Internal to each component |
| `viewBox` | removed | Internal to each component |

## Breaking Changes in v2.0

- The `SFSymbol` component has been removed (no compatibility layer).
- The `SFSymbolName` enum has been removed.
- The `sf-symbols-lib/compat` entry point no longer exists.
- The `palette` and `multicolor` variants have been removed. Only `dualtone` and `monochrome` are available.
- The default import path now re-exports dualtone (previously hierarchical).

## Search and Replace Patterns

For bulk migration, use these patterns:

**Find imports:**

```
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib'
```

**Find usage:**

```regex
<SFSymbol\s+name=\{SFSymbolName\.(\w+)\}
```

**Replace with:**

```
<$1
```

Then update the import to include only the component names you extracted.

## Troubleshooting

### "Module not found" for variant imports

Make sure your `package.json` or bundler supports the `exports` field. Most modern bundlers (Vite, webpack 5+, esbuild) handle this automatically.

### TypeScript errors with icon props

The new `SFIconProps` type is slightly different from `SFSymbolProps`. If you spread props, update the type:

```tsx
// Before
import { SFSymbolProps } from 'sf-symbols-lib';

// After
import { type SFIconProps } from 'sf-symbols-lib/dualtone';
```

### Large barrel import warnings

If your bundler warns about the barrel import (`sf-symbols-lib/dualtone`), use direct file imports instead:

```tsx
import { SFCheckmarkCircleFill } from 'sf-symbols-lib/dualtone/SFCheckmarkCircleFill';
```
