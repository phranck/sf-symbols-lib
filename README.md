![CI](https://github.com/phranck/sf-symbols-lib/actions/workflows/sf-symbols-ci.yml/badge.svg)
![SF Symbols](https://img.shields.io/badge/SF%20Symbols-137-blue?style=flat-square&logo=apple&logoColor=white)

# SF Symbols Library

A React component library for SF Symbols icons. This library contains only a subset of Apple's original SF Symbols, specifically the "hierarchical" variants. These are monochrome symbols designed for use with custom colors.

## Live Demo

Explore all available SF Symbols in an interactive grid layout with support for light and dark modes. See the [live demo](https://phranck.github.io/sf-symbols-lib/) to browse the icons and their usage.

## Installation

```bash
npm install sf-symbols-lib
```

## Usage

```tsx
import { SFCheckmark, SFCircle } from 'sf-symbols-lib';

function MyComponent() {
  return (
    <div>
      <SFCheckmark size={24} />
      <SFCircle size={32} />
    </div>
  );
}
```

## Props

- `size?: number | string` - Icon size (default: 24)
- `color?: string` - Icon color (default: 'currentColor')
- `className?: string` - Additional CSS classes

## Development

### Adding New Symbols

1. Add your SVG files to the `svgs/` directory
2. Run the generator script:
   ```bash
   npm run generate
   ```
3. The script will automatically generate:
   - `src/components/available-sfsymbols.ts` - Enum with all available symbols
   - `src/components/icons-data.ts` - SVG content and viewBox data
   - `src/components/icons-map.ts` - Mapping from enum to component names
   - `src/index.ts` - Component exports

### Building

```bash
# Install dependencies
npm install

# Generate icons from SVGs
npm run generate

# Build the library
npm run build

# Type checking
npm run typecheck

# Watch mode
npm run dev
```

## Available Icons

All SF Symbol icons are available as React components with the `SF` prefix.

Example: `checkmark-circle.svg` → `SFCheckmarkCircle`