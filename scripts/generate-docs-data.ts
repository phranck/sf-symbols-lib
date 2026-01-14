#!/usr/bin/env tsx
/**
 * Generate runtime data and inline it into index.html for the docs.
 * This allows the page to work when opened directly from the file system.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import CleanCSS from 'clean-css';
import { marked } from 'marked';

// Import the generated symbol names directly from the package
import { SFSymbolName } from '../src/components/sf-symbol-name.js';

// Type definitions
type Variant = 'hierarchical' | 'monochrome';

interface SymbolData {
  [key: string]: string;
}

interface VariantData {
  hierarchical: SymbolData;
  monochrome: SymbolData;
}

interface ChunkData {
  data: SymbolData;
  viewBox: SymbolData;
}

interface ChunksManifest {
  [variant: string]: string[];
}

interface MetaManifest {
  VARIANTS: readonly Variant[];
  symbolNames: SymbolData;
  chunks: ChunksManifest;
}

const VARIANTS = ['hierarchical', 'monochrome'] as const;

/**
 * Create reverse enum map from the imported SFSymbolName enum
 */
function createReverseEnumMap(): SymbolData {
  const reverseEnumMap: SymbolData = {};
  // Iterate through all enum values to create reverse mapping
  for (const [key, value] of Object.entries(SFSymbolName)) {
    reverseEnumMap[key] = value;
  }
  return reverseEnumMap;
}

/**
 * Parse symbols data from a variant's data.ts file
 */
function parseSymbolsData(
  dataContent: string,
  reverseEnumMap: SymbolData
): { symbolsData: SymbolData; viewBoxData: SymbolData } {
  const symbolsData: SymbolData = {};
  const viewBoxData: SymbolData = {};

  // Parse sfSymbolsData
  const dataMatch = dataContent.match(/export const sfSymbolsData[^{]*=\s*\{([\s\S]*?)\n\};/);
  if (dataMatch) {
    const dataBlock = dataMatch[1];
    const entryRegex = /\[SFSymbolName\.(\w+)\]:\s*'([^']*(?:\\.[^']*)*)'/g;
    let entry: RegExpExecArray | null;

    while ((entry = entryRegex.exec(dataBlock)) !== null) {
      const enumKey = entry[1];
      const svgContent = entry[2].replace(/\\'/g, "'");
      // O(1) lookup instead of O(n) loop
      const strKey = reverseEnumMap[enumKey];
      if (strKey) {
        symbolsData[strKey] = svgContent;
      }
    }
  }

  // Parse sfSymbolsViewBox
  const vbMatch = dataContent.match(/export const sfSymbolsViewBox[^{]*=\s*\{([\s\S]*?)\n\};/);
  if (vbMatch) {
    const vbBlock = vbMatch[1];
    const vbRegex = /\[SFSymbolName\.(\w+)\]:\s*'([^']*)'/g;
    let vbEntry: RegExpExecArray | null;

    while ((vbEntry = vbRegex.exec(vbBlock)) !== null) {
      const enumKey = vbEntry[1];
      const viewBox = vbEntry[2];
      // O(1) lookup instead of O(n) loop
      const strKey = reverseEnumMap[enumKey];
      if (strKey) {
        viewBoxData[strKey] = viewBox;
      }
    }
  }

  return { symbolsData, viewBoxData };
}



/**
 * Read a markdown file and convert it to HTML
 *
 * @param filePath - Path to the markdown file
 * @returns HTML string or empty string if file not found
 */
async function readMarkdownAsHtml(filePath: string): Promise<string> {
  try {
    const markdown = await fs.readFile(filePath, 'utf8');
    const html = await marked(markdown);
    return html;
  } catch (error) {
    console.warn(`⚠ Could not read markdown file ${filePath}:`, error);
    return '';
  }
}

/**
 * Minify CSS content
 */
function minifyCss(htmlContent: string): string {
  const styleRegex = /(<style>)([\s\S]*?)(<\/style>)/g;
  const styleMatches = [...htmlContent.matchAll(styleRegex)];
  const cleanCss = new CleanCSS();

  for (const match of styleMatches) {
    const styleTagStart = match[1];
    const styleContent = match[2];
    const styleTagEnd = match[3];

    if (styleContent.trim()) {
      try {
        const minified = cleanCss.minify(styleContent);
        if (minified.styles) {
          const newStyle = `${styleTagStart}${minified.styles}${styleTagEnd}`;
          htmlContent = htmlContent.replace(match[0], newStyle);
        }
      } catch (e) {
        console.error('Failed to minify style content:', e);
      }
    }
  }

  return htmlContent;
}



/**
 * Write chunk files for a variant
 */
async function writeChunks(
  distDir: string,
  variant: Variant,
  allData: VariantData,
  allViewBox: VariantData,
  chunksManifest: ChunksManifest
): Promise<void> {
  const CHUNK_SIZE = 500;
  const keys = Object.keys(allData[variant] || {});
  chunksManifest[variant] = [];

  for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
    const slice = keys.slice(i, i + CHUNK_SIZE);
    const chunkData: ChunkData = { data: {}, viewBox: {} };

    for (const key of slice) {
      chunkData.data[key] = allData[variant][key];
      if (allViewBox[variant]?.[key]) {
        chunkData.viewBox[key] = allViewBox[variant][key];
      }
    }

    const chunkName = `chunks/${variant}-${Math.floor(i / CHUNK_SIZE)}.json`;
    const chunkPath = path.join(distDir, chunkName);
    await fs.writeFile(chunkPath, JSON.stringify(chunkData), 'utf8');
    chunksManifest[variant].push(chunkName);
  }

  // Ensure at least one empty chunk exists if there are no symbols
  if (chunksManifest[variant].length === 0) {
    const chunkName = `chunks/${variant}-0.json`;
    const chunkPath = path.join(distDir, chunkName);
    await fs.writeFile(chunkPath, JSON.stringify({ data: {}, viewBox: {} }), 'utf8');
    chunksManifest[variant].push(chunkName);
  }
}

/**
 * Main function to generate docs data
 */
async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const repoRootDir = path.resolve(path.dirname(__filename), '..');
  const repoDocsDir = path.resolve(repoRootDir, 'docs');
  const distDir = path.join(repoDocsDir, 'dist');
  const htmlInputFile = path.join(repoDocsDir, 'index.html');
  const htmlOutputFile = path.join(distDir, 'index.html');

  try {
    // Use the imported SFSymbolName enum to build reverse map for O(1) lookups: enumKey -> strKey
    const reverseEnumMap = createReverseEnumMap();

    // Build data structure for all variants
    const allData: VariantData = {
      hierarchical: {},
      monochrome: {},
    };
    const allViewBox: VariantData = {
      hierarchical: {},
      monochrome: {},
    };

    for (const variant of VARIANTS) {
      const dataFile = path.join(repoRootDir, 'src', variant, 'data.ts');

      try {
        const dataContent = await fs.readFile(dataFile, 'utf8');
        const { symbolsData, viewBoxData } = parseSymbolsData(dataContent, reverseEnumMap);

        allData[variant] = symbolsData;
        allViewBox[variant] = viewBoxData;

        console.log(`✓ Processed ${variant}: ${Object.keys(symbolsData).length} symbols`);
        console.log(`  Sample data:`, Object.keys(symbolsData).slice(0, 3));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`⚠ Could not read ${dataFile}: ${errorMessage}`);
        allData[variant] = {};
        allViewBox[variant] = {};
      }
    }

    console.log('Final allData keys:', Object.keys(allData));
    console.log('hierarchical data keys count:', Object.keys(allData.hierarchical || {}).length);

    // Build component names map from imported enum
    const componentNames: SymbolData = {};
    for (const [enumKey, strKey] of Object.entries(SFSymbolName)) {
      componentNames[strKey] = enumKey;
    }

    // Chunk the large data into smaller JSON files
    const chunksDir = path.join(distDir, 'chunks');
    await fs.mkdir(chunksDir, { recursive: true });

    const chunksManifest: ChunksManifest = {};

    for (const variant of VARIANTS) {
      await writeChunks(distDir, variant, allData, allViewBox, chunksManifest);
    }

    // Create meta manifest
    const meta: MetaManifest = {
      VARIANTS,
      symbolNames: componentNames,
      chunks: chunksManifest,
    };

    const metaPath = path.join(distDir, 'meta.json');
    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8');

    // Read HTML template
    let htmlContent = await fs.readFile(htmlInputFile, 'utf8');

    // Read and inject markdown content
    const aboutMdPath = path.join(repoDocsDir, 'about.md');
    const searchMdPath = path.join(repoDocsDir, 'search.md');

    const aboutHtml = await readMarkdownAsHtml(aboutMdPath);
    const searchHtml = await readMarkdownAsHtml(searchMdPath);

    // Replace placeholders with rendered markdown content
    htmlContent = htmlContent.replace('<!-- ABOUT_CONTENT -->', aboutHtml);
    htmlContent = htmlContent.replace('<!-- SEARCH_CONTENT -->', searchHtml);

    console.log('✓ Injected markdown content (about.md, search.md)');

    // Minify CSS
    htmlContent = minifyCss(htmlContent);

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Write the modified HTML
    await fs.writeFile(htmlOutputFile, htmlContent, 'utf8');

    // Copy CSS files to dist/styles/
    const stylesDir = path.join(distDir, 'styles');
    await fs.mkdir(stylesDir, { recursive: true });
    await fs.copyFile(path.join(repoDocsDir, 'styles', 'main.css'), path.join(stylesDir, 'main.css'));
    await fs.copyFile(path.join(repoDocsDir, 'styles', 'drawer.css'), path.join(stylesDir, 'drawer.css'));
    await fs.copyFile(path.join(repoDocsDir, 'styles', 'variables.css'), path.join(stylesDir, 'variables.css'));

    // Copy JS files to dist/scripts/
    const scriptsDir = path.join(distDir, 'scripts');
    await fs.mkdir(scriptsDir, { recursive: true });
    const scriptFiles = ['data.js', 'utils.js', 'theme.js', 'modals.js', 'colors.js', 'symbols.js', 'main.js'];
    for (const file of scriptFiles) {
      await fs.copyFile(path.join(repoDocsDir, 'scripts', file), path.join(scriptsDir, file));
    }

    // Copy Markdown files to dist/
    await fs.copyFile(path.join(repoDocsDir, 'about.md'), path.join(distDir, 'about.md'));
    await fs.copyFile(path.join(repoDocsDir, 'search.md'), path.join(distDir, 'search.md'));

    const totalSymbols = Object.keys(SFSymbolName).length;
    const fileSize = (Buffer.byteLength(htmlContent, 'utf8') / 1024 / 1024).toFixed(1);
    console.log(`\n✅ Generated ${htmlOutputFile}`);
    console.log(`   ${totalSymbols} symbols × ${VARIANTS.length} variants`);
    console.log(`   File size: ${fileSize} MB`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to generate:', errorMessage);
    process.exit(1);
  }
}

// Run the generator
main().catch((error: unknown) => {
  console.error('❌ Error generating docs data:', error);
  process.exit(1);
});