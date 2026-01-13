[![Mastodon: @phranck](https://img.shields.io/badge/Mastodon-@LAYERED-6364ff.svg?style=flat)](https://oldbytes.space/@LAYERED)
![SF Symbols](https://img.shields.io/badge/SF%20Symbols-6984-blue?style=flat-square&logo=apple&logoColor=white)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

# SF Symbols Library

A React component library providing **6,984 SF Symbols** as type-safe React components. Supports multiple rendering variants (hierarchical, monochrome) with optimized bundle sizes through subpath imports.

## Features

- **6,984 Symbols** - Complete SF Symbols collection
- **Type-Safe** - Full TypeScript support with autocomplete
- **Tree-Shakeable** - Import only what you need
- **Multiple Variants** - Hierarchical, Monochrome
- **Optimized Bundles** - Separate builds per variant

## Live Demo

Explore all available SF Symbols in an interactive grid layout with support for light and dark modes. See the [live demo](https://sfsymbolslib.layered.work) to browse the icons and their usage.

## Installation

```bash
npm install sf-symbols-lib
```

## Quick Start

```tsx
import { SFSymbol, Checkmark } from 'sf-symbols-lib/hierarchical';

function App() {
  return <SFSymbol name={Checkmark} size={24} />;
}
```

## Usage

### Basic Usage

```tsx
import { SFSymbol, Checkmark, CheckmarkCircleFill, Trash } from 'sf-symbols-lib/hierarchical';

function MyComponent() {
  return (
    <div>
      {/* Basic usage */}
      <SFSymbol name={Checkmark} />

      {/* With size */}
      <SFSymbol name={CheckmarkCircleFill} size={32} />

      {/* With size preset */}
      <SFSymbol name={Trash} size="lg" />
    </div>
  );
}
```

### Available Variants

Choose the variant that matches your design needs:

```tsx
// Hierarchical (depth through layering)
import { SFSymbol, Folder } from 'sf-symbols-lib/hierarchical';

// Monochrome (single color, clean)
import { SFSymbol, Folder } from 'sf-symbols-lib/monochrome';
```

### Default Import

If you don't specify a subpath, you get `hierarchical`:

```tsx
// These are equivalent:
import { SFSymbol, Checkmark } from 'sf-symbols-lib';
import { SFSymbol, Checkmark } from 'sf-symbols-lib/hierarchical';
```

### Styling Examples

```tsx
import { SFSymbol, Heart, HeartFill, Star } from 'sf-symbols-lib/hierarchical';

function StyledSymbols() {
  return (
    <div>
      {/* Color via CSS */}
      <SFSymbol name={Heart} className="text-red-500" />

      {/* Inline style */}
      <SFSymbol name={HeartFill} style={{ color: '#ff0000' }} />

      {/* With CSS variable */}
      <SFSymbol name={Star} style={{ color: 'var(--accent-color)' }} />
    </div>
  );
}
```

### Size Presets

Available size presets: `xs`, `sm`, `md`, `lg`, `xl`

```tsx
import { SFSymbol, Bell } from 'sf-symbols-lib/hierarchical';

function SizeExamples() {
  return (
    <div>
      <SFSymbol name={Bell} size="xs" />  {/* 12px */}
      <SFSymbol name={Bell} size="sm" />  {/* 16px */}
      <SFSymbol name={Bell} size="md" />  {/* 20px */}
      <SFSymbol name={Bell} size="lg" />  {/* 24px */}
      <SFSymbol name={Bell} size="xl" />  {/* 32px */}

      {/* Or use exact pixels */}
      <SFSymbol name={Bell} size={48} />
    </div>
  );
}
```

### Using with Buttons

```tsx
import { SFSymbol, Plus, Trash, PencilLine } from 'sf-symbols-lib/hierarchical';

function ButtonExamples() {
  return (
    <div>
      {/* Icon button */}
      <button className="icon-button">
        <SFSymbol name={Plus} size={20} />
      </button>

      {/* Button with icon and text */}
      <button className="flex items-center gap-2">
        <SFSymbol name={PencilLine} size={16} />
        <span>Edit</span>
      </button>

      {/* Danger button */}
      <button className="flex items-center gap-2 text-red-500">
        <SFSymbol name={Trash} size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
}
```

### Using with Lists

```tsx
import { SFSymbol, CheckmarkCircleFill, Circle, ExclamationmarkTriangleFill } from 'sf-symbols-lib/hierarchical';

type Status = 'done' | 'pending' | 'warning';

function StatusList({ items }: { items: { text: string; status: Status }[] }) {
  const statusIcons = {
    done: { symbol: CheckmarkCircleFill, className: 'text-green-500' },
    pending: { symbol: Circle, className: 'text-gray-400' },
    warning: { symbol: ExclamationmarkTriangleFill, className: 'text-yellow-500' },
  };

  return (
    <ul>
      {items.map((item, i) => {
        const icon = statusIcons[item.status];
        return (
          <li key={i} className="flex items-center gap-2">
            <SFSymbol name={icon.symbol} size={16} className={icon.className} />
            <span>{item.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
```

### Dynamic Symbol Selection

```tsx
import { SFSymbol, SFSymbolName, Folder, FolderFill } from 'sf-symbols-lib/hierarchical';

function DynamicIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <SFSymbol
      name={isOpen ? FolderFill : Folder}
      size={24}
    />
  );
}
```

### Using the Enum Directly

For cases where you need to work with symbol names programmatically:

```tsx
import { SFSymbol, SFSymbolName, getAvailableSymbols, isAvailableSymbol } from 'sf-symbols-lib/hierarchical';

// Using enum
<SFSymbol name={SFSymbolName.Checkmark} />

// Check if a symbol exists
if (isAvailableSymbol('checkmark.circle.fill')) {
  // Symbol exists
}

// Get all available symbols
const allSymbols = getAvailableSymbols();
console.log(`Total symbols: ${allSymbols.length}`); // 6984
```

## Project Configuration

### Path Alias (Recommended)

For shorter imports throughout your project, configure a path alias:

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "sf-symbols": ["node_modules/sf-symbols-lib/dist/hierarchical"]
    }
  }
}
```

**vite.config.ts (if using Vite):**
```ts
export default defineConfig({
  resolve: {
    alias: {
      'sf-symbols': 'sf-symbols-lib/hierarchical'
    }
  }
});
```

Then use it:
```tsx
import { SFSymbol, Checkmark } from 'sf-symbols';
```

### Barrel File Alternative

Create a local re-export file:

**src/lib/sf-symbols.ts:**
```tsx
export * from 'sf-symbols-lib/hierarchical';
```

**Usage:**
```tsx
import { SFSymbol, Checkmark } from '@/lib/sf-symbols';
```

This approach makes it easy to switch variants later by changing just one file.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Symbol name constant |
| `size` | `number \| string` | `24` | Size in pixels or preset (`xs`, `sm`, `md`, `lg`, `xl`) |
| `className` | `string` | `''` | CSS class names |
| `strokeWidth` | `number \| string` | `1` | SVG stroke width |
| `style` | `CSSProperties` | - | Inline styles |
| `...rest` | `SVGAttributes` | - | Any valid SVG attribute |

## Symbol Naming

Symbols are named using PascalCase derived from their SF Symbol names:

| SF Symbol Name | Constant |
|----------------|----------|
| `checkmark` | `Checkmark` |
| `checkmark.circle` | `CheckmarkCircle` |
| `checkmark.circle.fill` | `CheckmarkCircleFill` |
| `square.and.arrow.up` | `SquareAndArrowUp` |
| `0.circle.fill` | `N0CircleFill` |
| `42.square` | `N42Square` |

**Note:** Symbols starting with numbers are prefixed with `N`.

## Bundle Size

Each variant is a separate bundle:

| Import Path | Size (gzip) |
|-------------|-------------|
| `sf-symbols-lib/hierarchical` | ~3.1 MB |
| `sf-symbols-lib/monochrome` | ~3.1 MB |

Import only the variant you need to minimize bundle size.

## Development

### Prerequisites

- Node.js >= 22.0.0
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate symbols from SVGs
npm run generate

# Build the library
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Full check (lint + typecheck + build)
npm run check
```

### Adding New Symbols

1. Add SVG files to the appropriate directory:
   ```
   src/components/svgs/{variant}/{color}/*.svg
   ```

   Example structure:
   ```
   src/components/svgs/
   ├── hierarchical/
   │   └── your-symbol.svg
   ├── monochrome/
   │   └── your-symbol.svg
   ```

2. Run the generator:
   ```bash
   npm run generate
   ```

3. Build the library:
   ```bash
   npm run build
   ```

### Generated Files

The generator creates:

- `src/components/sf-symbol-name.ts` - Enum and constants for all symbol names
- `src/{variant}/data.ts` - SVG content for each variant
- `src/{variant}/index.tsx` - Entry point with SFSymbol component
- `src/index.ts` - Main entry (re-exports hierarchical)

## Contributing

Bug reports and pull requests are welcome. Please use the GitHub issue tracker for bug reports or feature requests.

## License

This repository has been published under the [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.

---

<div style="text-align: center;">
  Made with ❤️ by <a href="https://oldbytes.space/@LAYERED" target="_blank">@LAYERED</a>
<div>
