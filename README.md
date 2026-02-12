[![CI](https://github.com/LAYEREDwork/sf-symbols-lib/actions/workflows/sf-symbols-ci.yml/badge.svg)](https://github.com/LAYEREDwork/sf-symbols-lib/actions/workflows/sf-symbols-ci.yml)
![SF Symbols](https://img.shields.io/badge/SF%20Symbols-7007-blue?style=flat-square&logo=apple&logoColor=white)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Mastodon: @phranck](https://img.shields.io/badge/Mastodon-@LAYERED-6364ff.svg?style=flat)](https://oldbytes.space/@LAYERED)

# SF Symbols Library

A React component library providing **7,007 Apple SF Symbols** as tree-shakeable React components. Import only the icons you need for optimal bundle sizes.

## Features

- **7,007 Symbols** - Complete SF Symbols 7.3 collection
- **Tree-Shakeable** - Each icon is a standalone component (~1.5 KB each)
- **2 Variants** - Dualtone (default), Monochrome
- **Type-Safe** - Full TypeScript support with autocomplete
- **Lightweight** - Only imported icons end up in your bundle
- **React 18/19** - Works with both versions

## Live Demo

Explore all available SF Symbols in an interactive grid layout with support for light and dark modes. See the [live demo](https://sfsymbolslib.layered.work) to browse the icons and their usage.

## Installation

```bash
npm install sf-symbols-lib
```

## Quick Start

```tsx
import { SFCheckmarkCircleFill, SFPhone } from 'sf-symbols-lib/dualtone';

function App() {
  return (
    <div>
      <SFCheckmarkCircleFill size="lg" />
      <SFPhone size="md" className="icon" />
    </div>
  );
}
```

Each icon is imported directly as a React component. Your bundler only includes the icons you actually use.

## Usage

### Basic Usage

```tsx
import { SFCheckmark, SFCheckmarkCircleFill, SFTrash } from 'sf-symbols-lib/dualtone';

function MyComponent() {
  return (
    <div>
      <SFCheckmark />
      <SFCheckmarkCircleFill size="lg" />
      <SFTrash className="text-red-500" />
    </div>
  );
}
```

### Available Variants

Choose the variant that matches your design needs:

```tsx
// Dualtone (default) - depth through layered opacity
import { SFFolderFill } from 'sf-symbols-lib/dualtone';

// Monochrome - single color, clean look
import { SFFolderFill } from 'sf-symbols-lib/monochrome';
```

The default import (`sf-symbols-lib`) re-exports the dualtone variant:

```tsx
import { SFFolderFill } from 'sf-symbols-lib';
// equivalent to: import { SFFolderFill } from 'sf-symbols-lib/dualtone';
```

### Direct File Imports

For faster build resolution in large projects, you can bypass the barrel export:

```tsx
import { SFCheckmarkCircleFill } from 'sf-symbols-lib/dualtone/SFCheckmarkCircleFill';
```

### Styling

```tsx
import { SFHeartFill, SFStar } from 'sf-symbols-lib/dualtone';

function StyledSymbols() {
  return (
    <div>
      {/* Color via CSS class */}
      <SFHeartFill className="text-red-500" />

      {/* Inline style */}
      <SFHeartFill style={{ color: '#ff0000' }} />

      {/* CSS variable */}
      <SFStar style={{ color: 'var(--accent-color)' }} />
    </div>
  );
}
```

### Size Presets

| Preset | Pixels |
|--------|--------|
| `xs`   | 12px   |
| `sm`   | 16px   |
| `md`   | 20px   |
| `lg`   | 24px (default) |
| `xl`   | 32px   |

```tsx
import { SFBellFill } from 'sf-symbols-lib/dualtone';

function SizeExamples() {
  return (
    <div>
      <SFBellFill size="xs" />
      <SFBellFill size="sm" />
      <SFBellFill size="md" />
      <SFBellFill size="lg" />
      <SFBellFill size="xl" />

      {/* Or use exact pixels */}
      <SFBellFill size={48} />
    </div>
  );
}
```

### Using with Buttons

```tsx
import { SFPlus, SFTrash, SFPencilLine } from 'sf-symbols-lib/dualtone';

function ButtonExamples() {
  return (
    <div>
      <button className="icon-button">
        <SFPlus size="sm" />
      </button>

      <button className="flex items-center gap-2">
        <SFPencilLine size="xs" />
        <span>Edit</span>
      </button>

      <button className="flex items-center gap-2 text-red-500">
        <SFTrash size="xs" />
        <span>Delete</span>
      </button>
    </div>
  );
}
```

### Global Defaults with Context

Use `SFIconContext` to set default props for all icons in a subtree:

```tsx
import { SFIconContext, SFCheckmarkCircleFill, SFPhone } from 'sf-symbols-lib/dualtone';

function App() {
  return (
    <SFIconContext.Provider value={{ size: 'sm', className: 'icon' }}>
      <SFCheckmarkCircleFill />
      <SFPhone />
    </SFIconContext.Provider>
  );
}
```

### Dynamic Icon Selection

```tsx
import { SFFolder, SFFolderFill } from 'sf-symbols-lib/dualtone';

function DynamicIcon({ isOpen }: { isOpen: boolean }) {
  const Icon = isOpen ? SFFolderFill : SFFolder;
  return <Icon size="lg" />;
}
```

## Props Reference

All icon components accept `SFIconProps`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'lg'` | Size preset or exact pixels |
| `className` | `string` | - | CSS class names |
| `style` | `CSSProperties` | - | Inline styles |
| `...rest` | `SVGAttributes` | - | Any valid SVG attribute |

## Symbol Naming

All component names are PascalCase with an `SF` prefix:

| SF Symbol Name | Component |
|----------------|-----------|
| `checkmark` | `SFCheckmark` |
| `checkmark.circle` | `SFCheckmarkCircle` |
| `checkmark.circle.fill` | `SFCheckmarkCircleFill` |
| `square.and.arrow.up` | `SFSquareAndArrowUp` |
| `0.circle.fill` | `SF0CircleFill` |

## Bundle Size

The tree-shakeable architecture keeps your bundle minimal:

| Scenario | Bundle Size |
|----------|-------------|
| 1 icon | ~1.5 KB |
| 5 icons | ~7.5 KB |
| 20 icons | ~30 KB |
| Full barrel import (all 7,007) | ~3.1 MB gzip |

Only the icons you import are included in your production bundle.

## Migration from v1.x

Version 2.0 introduces tree-shakeable icon components. The legacy enum-based API (`SFSymbol` + `SFSymbolName`) has been removed.

### Before (v1.x)

```tsx
import { SFSymbol, SFSymbolName } from 'sf-symbols-lib';

<SFSymbol name={SFSymbolName.SFCheckmarkCircleFill} size="lg" />
```

### After (v2.0)

```tsx
import { SFCheckmarkCircleFill } from 'sf-symbols-lib/dualtone';

<SFCheckmarkCircleFill size="lg" />
```

Only the imported icon (~1.5 KB) is included in your bundle.

For a detailed migration guide, see [MIGRATION.md](./MIGRATION.md).

## Development

### Prerequisites

- Node.js >= 22.0.0
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate icon components from SVGs
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

### Project Structure

```
sf-symbols-lib/
├── .svgs/                    # Source SVGs (gitignored)
│   ├── dualtone/             # 7,007 SVG files
│   └── monochrome/
├── src/
│   ├── common/
│   │   ├── SFIcon.tsx        # Shared SVG renderer (forwardRef)
│   │   ├── context.ts        # SFIconContext (global defaults)
│   │   └── types.ts          # SFIconProps, size presets
│   ├── dualtone/
│   │   ├── index.tsx          # Barrel re-export (generated)
│   │   └── icons/             # 7,007 components (generated)
│   ├── monochrome/            # Same structure
│   └── index.ts               # Re-exports dualtone (generated)
├── scripts/
│   ├── generate-sfsymbols.ts  # Icon component generator
│   ├── generate-catalog.ts    # Docs site catalog generator
│   └── shared/
│       └── utils.ts           # Shared utilities (naming, SVG parsing)
├── docs/                      # React/Vite docs site (source + build)
│   ├── src/                   # React app source
│   ├── dist/                  # Build output (GitHub Pages)
│   └── vite.config.ts
└── dist/                      # Library build output
```

### Generated Files

The generator (`npm run generate`) creates:

- `src/{variant}/icons/*.tsx` - Individual icon components (14,014 total)
- `src/{variant}/index.tsx` - Barrel re-exports per variant
- `src/index.ts` - Main entry (re-exports dualtone)

## Contributing

Bug reports and pull requests are welcome. Please use the GitHub issue tracker for bug reports or feature requests.

## Disclaimer

This is an **unofficial library** and is not affiliated with or endorsed by Apple Inc. All SF Symbols included in this library are copyrighted by Apple and are provided solely for reference and learning purposes.

The symbols were manually exported from Apple's SF Symbols app using the built-in export functionality and then processed programmatically to create this React component library. The SVG designs from Apple SF Symbols are compiled into React components and cannot be modified separately.

This library is a React wrapper around Apple's SF Symbols and does not modify or redistribute the original symbol designs in any way that violates Apple's terms.

For official SF Symbols documentation and guidelines, visit [Apple's SF Symbols website](https://developer.apple.com/sf-symbols/).

## Credits

- **SF Symbols** are designed and maintained by Apple Inc.
- This React component library was created to provide a convenient way to use SF Symbols in React applications.
- Special thanks to the open-source community for feedback and contributions.

## License

This repository has been published under the [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.

---

<div style="text-align: center;">
  Made with ❤️ by <a href="https://oldbytes.space/@LAYERED" target="_blank">@LAYERED</a>
<div>
