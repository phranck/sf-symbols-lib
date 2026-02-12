#!/usr/bin/env tsx
/**
 * Generate runtime data and inline it into index.html for the docs.
 * Reads SVG data directly from .svgs/ source files and metadata from embedded XML.
 */
import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import CleanCSS from 'clean-css';
import { marked } from 'marked';

import {
  VARIANTS,
  type Variant,
  type SvgMetadata,
  kebabToPascalCase,
  parseSvgFile,
} from './shared/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of symbols per JSON chunk file */
const CHUNK_SIZE = 500;

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

interface SymbolData {
  [key: string]: string;
}

interface SymbolMetadataMap {
  [key: string]: Omit<SvgMetadata, 'appleName' | 'libName'>;
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
  categories: string[];
  symbolCategories: { [key: string]: string[] };
  sfSymbolsVersion: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read a markdown file and convert it to HTML.
 *
 * @returns The rendered HTML string, or an empty string if the file cannot be read.
 */
async function readMarkdownAsHtml(filePath: string): Promise<string> {
  try {
    const markdown = await fs.readFile(filePath, 'utf8');
    return await marked(markdown);
  } catch {
    console.warn(`⚠ Could not read markdown file ${filePath}`);
    return '';
  }
}

/**
 * Minify all inline `<style>` blocks in an HTML string.
 */
function minifyCss(htmlContent: string): string {
  const styleRegex = /(<style>)([\s\S]*?)(<\/style>)/g;
  const cleanCss = new CleanCSS();

  for (const match of [...htmlContent.matchAll(styleRegex)]) {
    if (match[2].trim()) {
      try {
        const minified = cleanCss.minify(match[2]);
        if (minified.styles) {
          htmlContent = htmlContent.replace(
            match[0],
            `${match[1]}${minified.styles}${match[3]}`,
          );
        }
      } catch (error) {
        console.error('Failed to minify style content:', error);
      }
    }
  }
  return htmlContent;
}

/**
 * Escape a string for safe embedding inside a JavaScript template literal.
 *
 * Handles backticks and `${` template expressions (defense-in-depth against
 * accidental template injection from markdown sources).
 */
function escapeForTemplateLiteral(value: string): string {
  return value.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// ---------------------------------------------------------------------------
// Chunk Writer
// ---------------------------------------------------------------------------

/**
 * Write chunk files for a variant.
 *
 * Splits the symbol data into smaller JSON files of `CHUNK_SIZE` entries each,
 * and records the chunk file paths in the manifest.
 */
async function writeChunks(
  distDir: string,
  variant: Variant,
  symbolsData: SymbolData,
  viewBoxData: SymbolData,
  chunksManifest: ChunksManifest,
): Promise<void> {
  const keys = Object.keys(symbolsData);
  chunksManifest[variant] = [];

  for (
    let chunkStartIndex = 0;
    chunkStartIndex < keys.length;
    chunkStartIndex += CHUNK_SIZE
  ) {
    const slice = keys.slice(chunkStartIndex, chunkStartIndex + CHUNK_SIZE);
    const chunkData: ChunkData = { data: {}, viewBox: {} };

    for (const key of slice) {
      chunkData.data[key] = symbolsData[key];
      if (viewBoxData[key]) {
        chunkData.viewBox[key] = viewBoxData[key];
      }
    }

    const chunkIndex = Math.floor(chunkStartIndex / CHUNK_SIZE);
    const chunkName = `chunks/${variant}-${chunkIndex}.json`;
    await fs.writeFile(
      path.join(distDir, chunkName),
      JSON.stringify(chunkData),
      'utf8',
    );
    chunksManifest[variant].push(chunkName);
  }

  if (chunksManifest[variant].length === 0) {
    const chunkName = `chunks/${variant}-0.json`;
    await fs.writeFile(
      path.join(distDir, chunkName),
      JSON.stringify({ data: {}, viewBox: {} }),
      'utf8',
    );
    chunksManifest[variant].push(chunkName);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Main function to generate docs data.
 *
 * Reads all SVG source files, extracts content and metadata, chunks the data
 * into JSON files, and assembles the final docs HTML with injected content.
 */
async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const repoRootDir = path.resolve(path.dirname(__filename), '..');
  const repoDocsDir = path.resolve(repoRootDir, 'docs');
  const distDir = path.join(repoDocsDir, 'dist');
  const htmlInputFile = path.join(repoDocsDir, 'index.html');
  const htmlOutputFile = path.join(distDir, 'index.html');
  const svgsDir = path.join(repoRootDir, '.svgs');

  // Discover symbols from dualtone directory (reference variant)
  const dualtoneDir = path.join(svgsDir, 'dualtone');
  const symbolFileNames = fsSync
    .readdirSync(dualtoneDir)
    .filter((fileName) => fileName.endsWith('.svg'))
    .map((fileName) => fileName.replace('.svg', ''))
    .sort();

  console.log(`🔍 Found ${symbolFileNames.length} symbols`);

  // Build component names map (kebab -> PascalCase)
  const componentNames: SymbolData = {};
  for (const fileName of symbolFileNames) {
    componentNames[fileName] = kebabToPascalCase(fileName);
  }

  // Process each variant: read SVGs, extract data + metadata
  const allSymbolsData: Record<Variant, SymbolData> = {
    dualtone: {},
    monochrome: {},
  };
  const allViewBoxData: Record<Variant, SymbolData> = {
    dualtone: {},
    monochrome: {},
  };
  const allMetadata: Record<Variant, SymbolMetadataMap> = {
    dualtone: {},
    monochrome: {},
  };

  for (const variant of VARIANTS) {
    const variantSvgDir = path.join(svgsDir, variant);
    if (!fsSync.existsSync(variantSvgDir)) {
      console.warn(`⚠ Directory not found: ${variantSvgDir}`);
      continue;
    }

    let count = 0;
    for (const fileName of symbolFileNames) {
      const svgPath = path.join(variantSvgDir, `${fileName}.svg`);
      if (!fsSync.existsSync(svgPath)) continue;

      const { content, viewBox, metadata } = parseSvgFile(svgPath);
      allSymbolsData[variant][fileName] = content;
      allViewBoxData[variant][fileName] = viewBox;
      if (metadata) {
        allMetadata[variant][fileName] = {
          restricted: metadata.restricted,
          renderingMode: metadata.renderingMode,
          sfSymbolsVersion: metadata.sfSymbolsVersion,
          categories: metadata.categories,
        };
      }
      count++;
    }

    console.log(`✓ Processed ${variant}: ${count} symbols`);
  }

  // Chunk the data into smaller JSON files
  const chunksDir = path.join(distDir, 'chunks');
  await fs.mkdir(chunksDir, { recursive: true });

  const chunksManifest: ChunksManifest = {};
  for (const variant of VARIANTS) {
    await writeChunks(
      distDir,
      variant,
      allSymbolsData[variant],
      allViewBoxData[variant],
      chunksManifest,
    );
  }

  // Collect categories from dualtone metadata (canonical source)
  const categoriesSet = new Set<string>();
  const symbolCategories: { [key: string]: string[] } = {};
  let sfSymbolsVersion = '';

  for (const [symbolKey, meta] of Object.entries(allMetadata.dualtone)) {
    if (!sfSymbolsVersion && meta.sfSymbolsVersion) {
      sfSymbolsVersion = meta.sfSymbolsVersion;
    }
    if (meta.categories?.length > 0) {
      meta.categories.forEach((category) => categoriesSet.add(category));
      symbolCategories[symbolKey] = meta.categories;
    }
  }

  const categories = Array.from(categoriesSet).sort();
  console.log(`✓ Collected ${categories.length} unique categories`);
  console.log(`✓ SF Symbols version: ${sfSymbolsVersion}`);

  // Create meta manifest
  const meta: MetaManifest = {
    VARIANTS,
    symbolNames: componentNames,
    chunks: chunksManifest,
    categories,
    symbolCategories,
    sfSymbolsVersion,
  };

  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(
    path.join(distDir, 'meta.json'),
    JSON.stringify(meta),
    'utf8',
  );

  // Read and process HTML template
  let htmlContent = await fs.readFile(htmlInputFile, 'utf8');

  // Read and inject markdown content
  const aboutHtml = await readMarkdownAsHtml(
    path.join(repoDocsDir, 'about.md'),
  );
  const searchHtml = await readMarkdownAsHtml(
    path.join(repoDocsDir, 'search.md'),
  );
  const shortcutsHtml = await readMarkdownAsHtml(
    path.join(repoDocsDir, 'shortcuts.md'),
  );

  htmlContent = htmlContent.replace('<!-- ABOUT_CONTENT -->', aboutHtml);
  htmlContent = htmlContent.replace('<!-- SEARCH_CONTENT -->', searchHtml);
  console.log('✓ Injected markdown content (about.md, search.md)');

  htmlContent = minifyCss(htmlContent);

  await fs.writeFile(htmlOutputFile, htmlContent, 'utf8');

  // Copy CSS files
  const stylesDir = path.join(distDir, 'styles');
  await fs.mkdir(stylesDir, { recursive: true });
  for (const file of ['main.css', 'drawer.css', 'variables.css']) {
    await fs.copyFile(
      path.join(repoDocsDir, 'styles', file),
      path.join(stylesDir, file),
    );
  }

  // Process and copy JS files
  const scriptsDir = path.join(distDir, 'scripts');
  await fs.mkdir(scriptsDir, { recursive: true });

  // Inject markdown into modals.js
  const modalsJsPath = path.join(repoDocsDir, 'scripts', 'modals.js');
  let modalsJsContent = await fs.readFile(modalsJsPath, 'utf8');
  const escapedAboutHtml = escapeForTemplateLiteral(aboutHtml);
  const escapedSearchHtml = escapeForTemplateLiteral(searchHtml);
  const escapedShortcutsHtml = escapeForTemplateLiteral(shortcutsHtml);

  modalsJsContent = modalsJsContent.replace(
    '`<!-- ABOUT_CONTENT -->`',
    `\`${escapedAboutHtml}\``,
  );
  modalsJsContent = modalsJsContent.replace(
    '`<!-- SEARCH_CONTENT -->`',
    `\`${escapedSearchHtml}\``,
  );
  modalsJsContent = modalsJsContent.replace(
    '`<!-- SHORTCUTS_CONTENT -->`',
    `\`${escapedShortcutsHtml}\``,
  );
  modalsJsContent = modalsJsContent.replace(
    '<!-- ABOUT_CONTENT -->',
    escapedAboutHtml,
  );
  modalsJsContent = modalsJsContent.replace(
    '<!-- SEARCH_CONTENT -->',
    escapedSearchHtml,
  );
  modalsJsContent = modalsJsContent.replace(
    '<!-- SHORTCUTS_CONTENT -->',
    escapedShortcutsHtml,
  );
  await fs.writeFile(
    path.join(scriptsDir, 'modals.js'),
    modalsJsContent,
    'utf8',
  );
  console.log('✓ Injected about content into modals.js');

  for (const file of [
    'data.js',
    'utils.js',
    'theme.js',
    'colors.js',
    'symbols.js',
    'main.js',
  ]) {
    await fs.copyFile(
      path.join(repoDocsDir, 'scripts', file),
      path.join(scriptsDir, file),
    );
  }

  // Copy Markdown files
  await fs.copyFile(
    path.join(repoDocsDir, 'about.md'),
    path.join(distDir, 'about.md'),
  );
  await fs.copyFile(
    path.join(repoDocsDir, 'search.md'),
    path.join(distDir, 'search.md'),
  );

  const fileSize = (
    Buffer.byteLength(htmlContent, 'utf8') /
    1024 /
    1024
  ).toFixed(1);
  console.log(`\n✅ Generated ${htmlOutputFile}`);
  console.log(
    `   ${symbolFileNames.length} symbols x ${VARIANTS.length} variants`,
  );
  console.log(`   File size: ${fileSize} MB`);
}

main().catch((error: unknown) => {
  console.error('❌ Error generating docs data:', error);
  process.exit(1);
});
