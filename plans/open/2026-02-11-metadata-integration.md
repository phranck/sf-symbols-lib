# SVG Metadata Integration and Category Filtering

## Preface

This plan integrates the new SVG metadata format from the `sfe` extractor (v7.3) into the sf-symbols-lib generator and docs website. The sfe tool now embeds metadata (Apple names, library names, restricted flags, rendering modes, SF Symbols version, and categories) directly into SVG files as XML metadata tags. The generator will parse this embedded metadata instead of relying on external text files, making each SVG self-describing. The docs website will gain a category filter selector, allowing users to browse symbols by Apple's official SF Symbols categories. This eliminates the need for separate category mapping files and provides a more robust, maintainable data flow.

## Context / Problem

The sfe extractor (SF Symbols 7.3) has been updated to embed metadata directly into SVG files:

- `<name type="apple">` contains the original Apple symbol name
- `<name type="lib">` contains the library-compatible PascalCase name with `SF` prefix
- `<restricted>` indicates usage restrictions (true/false)
- `<renderingMode>` specifies the rendering mode (monochrome, hierarchical, palette, multicolor)
- `<sfSymbolsVersion>` indicates SF Symbols version (7.3)
- `<categories>` lists Apple SF Symbols app categories (alphabetically sorted)

Currently, the generator (`scripts/generate-sfsymbols.ts`) does not parse this metadata. It converts filenames to PascalCase names independently, which could lead to inconsistencies. The library currently only supports hierarchical and monochrome modes, but the metadata format now includes palette and multicolor modes for future expansion. The docs website has no category filtering capability, making it difficult to browse symbols by purpose or theme.

## Specification / Goal

### Generator Updates

1. Parse SVG metadata from each file
2. Use embedded library names (`<name type="lib">`) as source of truth instead of converting filenames
3. Extract and store restricted flags, rendering modes, SF Symbols version, and categories
4. Export metadata in generated TypeScript files
5. Cross-validate embedded names against filename-based conversion (warn on mismatch)
6. Store SF Symbols version for future compatibility tracking

### Docs Updates

1. Extract category metadata from generated files
2. Add category selector to website UI (next to rendering mode selector)
3. Implement category filter logic in `symbols.js`
4. Display all unique categories in the selector
5. Support combined filtering (search + category + rendering mode)
6. Update terminology: "variant" → "rendering mode" throughout docs

## Design

### Data Flow

```
SVG files (.svgs/hierarchical/*.svg)
  └─> Generator parses metadata
       ├─> Extracts lib name, categories, restricted flag
       ├─> Validates lib name vs filename conversion
       └─> Generates data.ts with metadata
            └─> Docs generator reads data.ts
                 ├─> Extracts categories list
                 └─> Exports to meta.json
                      └─> Website loads and displays category filter
```

### Generator Changes

**New function: `parseMetadata(svgPath: string)`**
- Reads SVG file
- Extracts `<metadata><symbol>...</symbol></metadata>` block
- Returns: `{ appleName, libName, restricted, renderingMode, sfSymbolsVersion, categories }`

**Modified: `generateVariantDataFile()`**
- Add `sfSymbolsMetadata: Record<SFSymbolName, { restricted: boolean; renderingMode: string; sfSymbolsVersion: string; categories: string[] }>`
- Export metadata alongside existing data and viewBox

**Modified: `kebabToPascalCase()`**
- Keep for validation purposes
- Warn if generated name differs from embedded `<name type="lib">`

### Docs Changes

**`generate-docs-data.ts`:**
- Parse metadata from `data.ts` files
- Collect all unique categories across all symbols
- Add `categories: string[]` and `symbolCategories: Record<string, string[]>` to `meta.json`

**`index.html`:**
- Add category selector control group after variant selector
- Structure: `<select id="category-select">` with dynamic options

**`data.js`:**
- Add `symbolCategories` export to hold category mapping

**`symbols.js`:**
- Extend `renderSymbols()` filter logic to check selected category
- If category selected, only show symbols belonging to that category
- Update stats to reflect filtered results

## Implementation Plan

### Phase 1: Generator Metadata Parsing

1. Add `parseMetadata()` function to extract XML metadata from SVG
2. Modify symbol processing loop to call `parseMetadata()` for each SVG
3. Cross-validate embedded lib name against `kebabToPascalCase()` conversion
4. Log warnings for mismatches (but use embedded name as source of truth)

### Phase 2: Generator Data Export

1. Create metadata record structure in `generateVariantDataFile()`
2. Export `sfSymbolsMetadata` in `data.ts` files
3. Test generator with new SVG format

### Phase 3: Docs Data Integration

1. Update `generate-docs-data.ts` to parse metadata from `data.ts`
2. Collect unique categories across all symbols
3. Build `symbolCategories` mapping (symbol name → categories array)
4. Export to `meta.json`

### Phase 4: Website UI

1. Add category selector HTML to `index.html` header controls
2. Load categories in `data.js` from `meta.json`
3. Populate category dropdown dynamically on page load
4. Add "All Categories" default option

### Phase 5: Website Filter Logic

1. Extend `renderSymbols()` in `symbols.js` to check category filter
2. Combine with existing search and variant filters
3. Update visible/total counts correctly
4. Test with various filter combinations

### Phase 6: Testing and Documentation

1. Run generator with new metadata format
2. Verify all metadata is correctly parsed
3. Test category filtering on docs site
4. Update README if needed

## Checklist

- [x] Add `parseMetadata()` function to generator (parse all fields including renderingMode and sfSymbolsVersion)
- [x] Modify symbol processing to parse SVG metadata
- [x] Cross-validate lib names (embedded vs generated)
- [x] Export metadata in `data.ts` files (including rendering mode and SF version)
- [x] Update `generate-docs-data.ts` to parse metadata
- [x] Collect unique categories in docs generator
- [x] Build `symbolCategories` mapping
- [x] Export categories to `meta.json`
- [x] Add category selector HTML to `index.html`
- [x] Load categories in `data.js`
- [x] Populate category dropdown dynamically
- [x] Extend `renderSymbols()` filter logic for categories
- [x] Test combined filtering (search + category + rendering mode)
- [x] Update UI terminology from "variant" to "rendering mode"
- [x] Run full generator and docs build
- [x] Verify metadata integrity
- [x] Test category filter on website

## Files

### Modified

- `scripts/generate-sfsymbols.ts` - Add metadata parsing
- `scripts/generate-docs-data.ts` - Extract and export categories
- `docs/index.html` - Add category selector UI
- `docs/scripts/data.js` - Add category data structures
- `docs/scripts/symbols.js` - Extend filter logic
- `src/hierarchical/data.ts` - Generated with metadata
- `src/monochrome/data.ts` - Generated with metadata

### Created

- `docs/dist/meta.json` - Updated with category data (regenerated)

## Dependencies

- Updated SVG files from `sfe` extractor with embedded metadata
- Existing generator and docs build pipeline
