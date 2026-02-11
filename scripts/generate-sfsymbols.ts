import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Constants for variants (rendering modes)
const VARIANTS = ['hierarchical', 'monochrome', 'palette', 'multicolor'] as const;

type Variant = typeof VARIANTS[number];

/**
 * Convert kebab-case and dot-notation to PascalCase with SF prefix
 * e.g., "checkmark-circle-fill" -> "SFCheckmarkCircleFill"
 * e.g., "square.and.arrow.down.on.square" -> "SFSquareAndArrowDownOnSquare"
 * e.g., "0.circle.fill" -> "SF0CircleFill"
 */
function kebabToPascalCase(kebabStr: string): string {
  const result = kebabStr
    .split(/[-.]/)
    .filter(word => word.length > 0)
    .map(word => {
      if (/^\d+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

  // Add SF prefix (no need for N prefix since SF makes it a valid identifier)
  return 'SF' + result;
}

/**
 * Metadata structure from SVG
 */
interface SvgMetadata {
  appleName: string;
  libName: string;
  restricted: boolean;
  renderingMode: string;
  sfSymbolsVersion: string;
  categories: string[];
}

/**
 * Parsed symbol data for a single icon
 */
interface SymbolEntry {
  content: string;
  viewBox: string;
  metadata: SvgMetadata | null;
}

/**
 * Parse metadata from SVG file content
 */
function parseMetadataFromContent(content: string): SvgMetadata | null {
  const metadataMatch = content.match(/<metadata>([\s\S]*?)<\/metadata>/);
  if (!metadataMatch) return null;

  const block = metadataMatch[1];
  const categories: string[] = [];
  const categoriesMatch = block.match(/<categories>([\s\S]*?)<\/categories>/);
  if (categoriesMatch) {
    for (const match of categoriesMatch[1].matchAll(/<category>([^<]*)<\/category>/g)) {
      categories.push(match[1]);
    }
  }

  return {
    appleName: block.match(/<name type="apple">([^<]*)<\/name>/)?.[1] ?? '',
    libName: block.match(/<name type="lib">([^<]*)<\/name>/)?.[1] ?? '',
    restricted: block.match(/<restricted>([^<]*)<\/restricted>/)?.[1] === 'true',
    renderingMode: block.match(/<renderingMode>([^<]*)<\/renderingMode>/)?.[1] ?? '',
    sfSymbolsVersion: block.match(/<sfSymbolsVersion>([^<]*)<\/sfSymbolsVersion>/)?.[1] ?? '',
    categories,
  };
}

/**
 * Parse an SVG file and return all needed data in a single read
 */
function parseSvgFile(svgPath: string, variant: string): SymbolEntry {
  const raw = fs.readFileSync(svgPath, 'utf-8');

  // Extract metadata before stripping
  const metadata = parseMetadataFromContent(raw);

  // Extract viewBox
  const viewBox = raw.match(/viewBox="([^"]*)"/)?.[1] ?? '0 0 24 24';

  // Strip XML preamble, comments, metadata block, collapse whitespace
  let content = raw
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  // Color replacement by variant
  if (variant === 'hierarchical' || variant === 'monochrome') {
    content = content.replace(/fill="(white|black|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})"/g, 'fill="currentColor"');
  } else if (variant === 'palette') {
    content = content.replace(/fill="white"/g, 'fill="currentColor"');
  }
  // multicolor: preserve original colors

  // Extract inner SVG content (between <svg> tags)
  const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const innerContent = svgMatch ? svgMatch[1].trim() : content;

  return { content: innerContent, viewBox, metadata };
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

// ---------------------------------------------------------------------------
// Individual icon file generation (tree-shakeable API)
// ---------------------------------------------------------------------------

/**
 * Whether an icon variant uses currentColor fill on the root SVG element
 */
function shouldUseCurrentColorFill(variant: Variant): boolean {
  return variant === 'hierarchical' || variant === 'monochrome';
}

/**
 * Generate a single icon component file
 */
function generateIconComponentFile(
  outputDir: string,
  variant: Variant,
  pascalName: string,
  entry: SymbolEntry,
): void {
  const escapedContent = entry.content
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ');

  const currentColor = shouldUseCurrentColorFill(variant);

  const fileContent = `/**
 * AUTO-GENERATED - DO NOT EDIT
 * Icon: ${pascalName} (${variant})
 */
import { type ReactElement } from 'react';

import { SFIcon } from '@/common/SFIcon';
import { type SFIconProps } from '@/common/types';

const SVG = '${escapedContent}';
const VB = '${entry.viewBox}';

/** ${pascalName} icon component (${variant} variant) */
export function ${pascalName}(props: SFIconProps): ReactElement {
  return <SFIcon svgContent={SVG} viewBox={VB}${currentColor ? '' : ' currentColorFill={false}'} {...props} />;
}

export default ${pascalName};
`;

  const dirPath = path.join(outputDir, variant, 'icons');
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, `${pascalName}.tsx`), fileContent);
}

/**
 * Generate barrel export that re-exports all individual icon components
 */
function generateTreeShakeableBarrel(
  outputDir: string,
  variant: Variant,
  pascalNames: string[],
): void {
  const sorted = [...pascalNames].sort();

  const exports = sorted
    .map(name => `export { ${name} } from '@/${variant}/icons/${name}';`)
    .join('\n');

  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SF Symbols - ${variant} (Tree-Shakeable API)
 *
 * Usage:
 *   import { SFCheckmarkCircleFill, SFPhone } from 'sf-symbols-lib/${variant}';
 *   <SFCheckmarkCircleFill size="lg" />
 *
 * Each icon is a standalone React component. Only imported icons
 * are included in the consumer bundle.
 *
 * Generated by: scripts/generate-sfsymbols.ts
 */

// Re-export shared types
export type { SFIconProps, SFIconSize, SFIconSizePreset } from '@/common/types';

// Re-export the generic renderer for advanced use cases
export { SFIcon } from '@/common/SFIcon';

// Individual icon components (${sorted.length} icons)
${exports}
`;

  const dirPath = path.join(outputDir, variant);
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, 'index.tsx'), fileContent);
  console.log(`✅ CREATED: ${variant}/index.tsx (barrel, ${sorted.length} re-exports)`);
}

// ---------------------------------------------------------------------------
// Compat layer generation (legacy SFSymbol API)
// ---------------------------------------------------------------------------

/**
 * Generate the compat data.ts file (all icons in one object, like the old API)
 */
function generateCompatDataFile(
  outputDir: string,
  variant: Variant,
  symbolData: Record<string, SymbolEntry>,
): void {
  const entries = Object.entries(symbolData)
    .map(([pascalName, { content }]) => {
      const escaped = content.replace(/'/g, "\\'").replace(/\n/g, ' ').replace(/\s+/g, ' ');
      return `  [SFSymbolName.${pascalName}]: '${escaped}',`;
    })
    .join('\n');

  const viewBoxEntries = Object.entries(symbolData)
    .map(([pascalName, { viewBox }]) => `  [SFSymbolName.${pascalName}]: '${viewBox}',`)
    .join('\n');

  const metadataEntries = Object.entries(symbolData)
    .map(([pascalName, { metadata }]) => {
      if (!metadata) {
        return `  [SFSymbolName.${pascalName}]: { restricted: false, renderingMode: '', sfSymbolsVersion: '', categories: [] },`;
      }
      const cats = metadata.categories.map(c => `'${c}'`).join(', ');
      return `  [SFSymbolName.${pascalName}]: { restricted: ${metadata.restricted}, renderingMode: '${metadata.renderingMode}', sfSymbolsVersion: '${metadata.sfSymbolsVersion}', categories: [${cats}] },`;
    })
    .join('\n');

  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SF Symbols Data - ${variant} (Compat Layer)
 * Generated by: scripts/generate-sfsymbols.ts
 */

import { SFSymbolName } from '@/components/sf-symbol-name';

export const sfSymbolsData: Record<SFSymbolName, string> = {
${entries}
};

export const sfSymbolsViewBox: Record<SFSymbolName, string> = {
${viewBoxEntries}
};

export interface SFSymbolMetadata {
  restricted: boolean;
  renderingMode: string;
  sfSymbolsVersion: string;
  categories: string[];
}

export const sfSymbolsMetadata: Record<SFSymbolName, SFSymbolMetadata> = {
${metadataEntries}
};
`;

  const dirPath = path.join(outputDir, 'compat', variant);
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, 'data.ts'), fileContent);
}

/**
 * Generate the compat SFSymbol component (legacy renderer with deprecation warning)
 */
function generateCompatSFSymbol(outputDir: string): void {
  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Legacy SFSymbol renderer (Compat Layer)
 *
 * @deprecated Use tree-shakeable imports instead:
 *   Before: import { SFSymbol, SFCheckmarkCircle } from 'sf-symbols-lib'
 *   After:  import { SFCheckmarkCircle } from 'sf-symbols-lib/hierarchical'
 *
 * Generated by: scripts/generate-sfsymbols.ts
 */
import { type ReactElement, useEffect } from 'react';

import { sfSymbolsData as hierarchicalData, sfSymbolsViewBox as hierarchicalViewBox } from '@/compat/hierarchical/data';
import { sfSymbolsData as monochromeData, sfSymbolsViewBox as monochromeViewBox } from '@/compat/monochrome/data';
import { sfSymbolsData as paletteData, sfSymbolsViewBox as paletteViewBox } from '@/compat/palette/data';
import { sfSymbolsData as multicolorData, sfSymbolsViewBox as multicolorViewBox } from '@/compat/multicolor/data';

import { SFSymbolSize } from '@/types/sizes';
import { SFSymbolVariant } from '@/types/symbol-types';

export interface SFSymbolProps {
  name: string;
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  color?: string;
  svgContent?: string;
  viewBox?: string;
  variant?: SFSymbolVariant;
  [key: string]: any;
}

let deprecationWarned = false;

export function SFSymbol({
  name,
  size = SFSymbolSize.lg,
  className = '',
  strokeWidth = 1,
  color,
  svgContent,
  viewBox,
  variant = SFSymbolVariant.monochrome,
  ...rest
}: SFSymbolProps): ReactElement {
  // One-time deprecation warning in development
  useEffect(() => {
    if (!deprecationWarned && process.env.NODE_ENV === 'development') {
      deprecationWarned = true;
      console.warn(
        'sf-symbols-lib: The SFSymbol component is deprecated and will be removed in v3.0.\\n' +
        'Migrate to tree-shakeable imports for better bundle sizes:\\n\\n' +
        "  Before: import { SFSymbol, SFSymbolName } from 'sf-symbols-lib'\\n" +
        "  After:  import { SFCheckmarkCircle } from 'sf-symbols-lib/hierarchical'\\n\\n" +
        'See: https://github.com/phranck/sf-symbols-lib#migration-v2'
      );
    }
  }, []);

  let numSize: number;
  if (typeof size === 'string') {
    numSize = SFSymbolSize[size.toLowerCase()] ?? parseInt(size, 10);
  } else {
    numSize = size;
  }

  // Resolve SVG data by variant + name
  let resolvedSvg: string | undefined = svgContent;
  let resolvedViewBox: string | undefined = viewBox;
  if (!resolvedSvg) {
    switch (variant) {
      case SFSymbolVariant.hierarchical:
        resolvedSvg = hierarchicalData[name as keyof typeof hierarchicalData];
        resolvedViewBox = resolvedViewBox || hierarchicalViewBox[name as keyof typeof hierarchicalViewBox];
        break;
      case SFSymbolVariant.palette:
        resolvedSvg = paletteData[name as keyof typeof paletteData];
        resolvedViewBox = resolvedViewBox || paletteViewBox[name as keyof typeof paletteViewBox];
        break;
      case SFSymbolVariant.multicolor:
        resolvedSvg = multicolorData[name as keyof typeof multicolorData];
        resolvedViewBox = resolvedViewBox || multicolorViewBox[name as keyof typeof multicolorViewBox];
        break;
      case SFSymbolVariant.monochrome:
      default:
        resolvedSvg = monochromeData[name as keyof typeof monochromeData];
        resolvedViewBox = resolvedViewBox || monochromeViewBox[name as keyof typeof monochromeViewBox];
        break;
    }
  }

  if (!resolvedSvg) {
    console.warn(\`Symbol "\${name}" not found for variant \${variant}\`);
    return <svg /> as ReactElement;
  }

  const recolorRegex = /fill=(['"])(?:#(?:fff|ffffff)|white)\\1/gi;
  const processedSvg = color ? resolvedSvg.replace(recolorRegex, \`fill="\${color}"\`) : resolvedSvg;

  const shouldForceFill = !color && (variant === SFSymbolVariant.hierarchical || variant === SFSymbolVariant.monochrome);
  const svgFillAttr = shouldForceFill ? 'currentColor' : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={resolvedViewBox || \`0 0 \${SFSymbolSize.lg} \${SFSymbolSize.lg}\`}
      width={numSize}
      height={numSize}
      fill={svgFillAttr}
      strokeWidth={strokeWidth}
      className={className}
      style={{
        minWidth: numSize,
        minHeight: numSize,
        maxWidth: numSize,
        maxHeight: numSize,
        flex: \`0 0 \${numSize}px\`,
        ...((rest.style as any) || {}),
      }}
      {...rest}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  ) as ReactElement;
}

export default SFSymbol;
`;

  const dirPath = path.join(outputDir, 'compat');
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, 'SFSymbol.tsx'), fileContent);
  console.log('✅ CREATED: compat/SFSymbol.tsx');
}

/**
 * Generate the compat index.tsx entry point
 */
function generateCompatIndex(outputDir: string): void {
  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SF Symbols Library - Compatibility Layer (v1.x API)
 *
 * @deprecated Use tree-shakeable imports instead:
 *   import { SFCheckmarkCircle } from 'sf-symbols-lib/hierarchical';
 *
 * Generated by: scripts/generate-sfsymbols.ts
 */

// Re-export all symbol names and constants
export * from '@/components/sf-symbol-name';

export { SFSymbol, type SFSymbolProps } from '@/compat/SFSymbol';
export { default as SFSymbol_default } from '@/compat/SFSymbol';

export { SFSymbolVariant } from '@/types/symbol-types';
export { SFSymbolSize } from '@/types/sizes';
`;

  const dirPath = path.join(outputDir, 'compat');
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, 'index.tsx'), fileContent);
  console.log('✅ CREATED: compat/index.tsx');
}

// ---------------------------------------------------------------------------
// sf-symbol-name.ts enum generation (shared between both APIs)
// ---------------------------------------------------------------------------

/**
 * Generate sf-symbol-name.ts with enum and constants
 */
function generateSymbolNameFile(componentsDir: string, symbolFileNames: string[]): void {
  const sortedNames = symbolFileNames.sort();

  const enumEntries = sortedNames
    .map(fileName => {
      const pascalName = kebabToPascalCase(fileName);
      return `  ${pascalName} = '${fileName}',`;
    })
    .join('\n');

  const constantExports = sortedNames
    .map(fileName => {
      const pascalName = kebabToPascalCase(fileName);
      const exportLine = `export const ${pascalName} = SFSymbolName.${pascalName};`;
      return pascalName === 'Infinity' ? `// eslint-disable-next-line no-shadow-restricted-names\n${exportLine}` : exportLine;
    })
    .join('\n');

  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SF Symbol Names
 *
 * SOURCE OF TRUTH: This enum is generated directly from SVG filenames.
 * Generated by: scripts/generate-sfsymbols.ts
 */

export enum SFSymbolName {
${enumEntries}
}

export type SFSymbolNameType = \`\${SFSymbolName}\`;

/**
 * Individual symbol name constants for convenient imports
 */
${constantExports}

/**
 * Get all available symbol values as an array
 */
export function getAvailableSymbols(): string[] {
  return Object.values(SFSymbolName);
}

/**
 * Check if a symbol value is available
 */
export function isAvailableSymbol(symbolValue: string): boolean {
  return Object.values(SFSymbolName).includes(symbolValue as SFSymbolName);
}
`;

  const filePath = path.join(componentsDir, 'sf-symbol-name.ts');
  fs.writeFileSync(filePath, fileContent);
  console.log(`✅ CREATED: sf-symbol-name.ts with ${sortedNames.length} symbols`);
}

// ---------------------------------------------------------------------------
// Main index.ts generation
// ---------------------------------------------------------------------------

/**
 * Generate main index.ts that re-exports the compat layer for backward compatibility
 */
function generateMainIndex(srcDir: string): void {
  const fileContent = `/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       AUTO-GENERATED FILE - DO NOT EDIT MANUALLY         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SF Symbols Library
 *
 * For optimal bundle size, use tree-shakeable imports:
 *   import { SFCheckmarkCircle } from 'sf-symbols-lib/hierarchical';
 *
 * The default export re-exports the compat layer for backward compatibility.
 *
 * Generated by: scripts/generate-sfsymbols.ts
 */

// Re-export compat layer (backward compatible with v1.x)
export * from './compat';

// Export types
export { SFSymbolVariant } from './types/symbol-types';
export { SFSymbolSize } from './types/sizes';
export type { SFIconProps, SFIconSize, SFIconSizePreset } from './common/types';
`;

  fs.writeFileSync(path.join(srcDir, 'index.ts'), fileContent);
  console.log('✅ CREATED: index.ts (default: compat layer)');
}

// ---------------------------------------------------------------------------
// README / package.json updates
// ---------------------------------------------------------------------------

function updateReadmeSymbolCount(symbolCount: number): void {
  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) return;

  let content = fs.readFileSync(readmePath, 'utf-8');
  const formatted = symbolCount.toLocaleString();

  const badgeUrl = `https://img.shields.io/badge/SF%20Symbols-${symbolCount}-blue?style=flat-square&logo=apple&logoColor=white`;
  content = content.replace(/!\[SF Symbols\]\([^)]+\)/, `![SF Symbols](${badgeUrl})`);
  content = content.replace(
    /A React component library providing \*\*[\d,]+\s+SF Symbols\*\*/,
    `A React component library providing **${formatted} SF Symbols**`,
  );
  content = content.replace(/^- \*\*[\d,]+\s+Symbols\*\*/m, `- **${formatted} Symbols**`);
  content = content.replace(
    /console\.log\(`Total symbols: \$\{allSymbols\.length\}`\); \/\/ [\d,]+/,
    `console.log(\`Total symbols: \${allSymbols.length}\`); // ${symbolCount}`,
  );

  fs.writeFileSync(readmePath, content);
  console.log(`✅ UPDATED: README.md with ${symbolCount} symbols`);
}

function updatePackageJsonSymbolCount(symbolCount: number): void {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.description) {
    pkg.description = pkg.description.replace(
      /SF Symbols \([\d,]+\)/,
      `SF Symbols (${symbolCount.toLocaleString()})`,
    );
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✅ UPDATED: package.json description with ${symbolCount} symbols`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generateSFSymbols() {
  const svgsDir = path.join(process.cwd(), '.svgs');
  const srcDir = path.join(process.cwd(), 'src');
  const componentsDir = path.join(srcDir, 'components');

  const hierarchicalDir = path.join(svgsDir, 'hierarchical');
  if (!fs.existsSync(hierarchicalDir)) {
    console.error(`❌ ERROR: Expected directory structure not found: ${hierarchicalDir}`);
    process.exit(1);
  }

  const symbolFileNames = fs.readdirSync(hierarchicalDir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''));

  if (symbolFileNames.length === 0) {
    console.error('❌ No SVG files found.');
    process.exit(1);
  }

  console.log(`\n🔍 Found ${symbolFileNames.length} symbols\n`);

  // Step 1: Generate shared enum file
  generateSymbolNameFile(componentsDir, symbolFileNames);

  // Step 2: Process each variant - generate individual icons + compat data
  let totalProcessed = 0;

  for (const variant of VARIANTS) {
    const variantSvgDir = path.join(svgsDir, variant);
    if (!fs.existsSync(variantSvgDir)) {
      console.warn(`⚠️  Directory not found: ${variantSvgDir}`);
      continue;
    }

    const symbolData: Record<string, SymbolEntry> = {};
    const pascalNames: string[] = [];
    let variantCount = 0;

    for (const fileName of symbolFileNames) {
      const svgPath = path.join(variantSvgDir, `${fileName}.svg`);
      if (!fs.existsSync(svgPath)) continue;

      const pascalName = kebabToPascalCase(fileName);

      try {
        const entry = parseSvgFile(svgPath, variant);

        // Cross-validate lib name
        if (entry.metadata?.libName && entry.metadata.libName !== pascalName) {
          console.warn(`⚠️  Name mismatch for ${fileName}: embedded="${entry.metadata.libName}" vs generated="${pascalName}"`);
        }

        // Generate individual icon component file
        generateIconComponentFile(srcDir, variant, pascalName, entry);

        symbolData[pascalName] = entry;
        pascalNames.push(pascalName);
        variantCount++;
        totalProcessed++;
      } catch (error) {
        console.error(`❌ ERROR processing ${svgPath}:`, error instanceof Error ? error.message : error);
      }
    }

    // Generate tree-shakeable barrel export
    generateTreeShakeableBarrel(srcDir, variant, pascalNames);

    // Generate compat data file (all icons in one object)
    generateCompatDataFile(srcDir, variant, symbolData);

    console.log(`✓ ${variant}: ${variantCount} icons + compat data`);
  }

  // Step 3: Generate compat layer
  generateCompatSFSymbol(srcDir);
  generateCompatIndex(srcDir);

  // Step 4: Generate main index.ts
  generateMainIndex(srcDir);

  // Step 5: Update README and package.json
  updateReadmeSymbolCount(symbolFileNames.length);
  updatePackageJsonSymbolCount(symbolFileNames.length);

  // Step 6: Generate docs data
  console.log('\n📄 Generating docs data and preview page...');
  execSync('tsx ./scripts/generate-docs-data.ts', { stdio: 'inherit' });

  console.log(`\n📊 Summary: ${symbolFileNames.length} symbols x ${VARIANTS.length} variants = ${totalProcessed} individual icon components`);
  console.log(`   + compat layer with ${VARIANTS.length} data files\n`);
}

generateSFSymbols().catch(error => {
  console.error('❌ Error generating SF Symbols:', error);
  process.exit(1);
});
