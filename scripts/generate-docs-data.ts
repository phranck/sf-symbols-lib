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

interface SymbolMetadata {
  restricted: boolean;
  renderingMode: string;
  sfSymbolsVersion: string;
  categories: string[];
}

interface SymbolMetadataMap {
  [key: string]: SymbolMetadata;
}

interface VariantData {
  hierarchical: SymbolData;
  monochrome: SymbolData;
}

interface VariantMetadata {
  hierarchical: SymbolMetadataMap;
  monochrome: SymbolMetadataMap;
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
): { symbolsData: SymbolData; viewBoxData: SymbolData; metadataMap: SymbolMetadataMap } {
  const symbolsData: SymbolData = {};
  const viewBoxData: SymbolData = {};
  const metadataMap: SymbolMetadataMap = {};

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

  // Parse sfSymbolsMetadata
  const mdMatch = dataContent.match(/export const sfSymbolsMetadata[^{]*=\s*\{([\s\S]*?)\n\};/);
  if (mdMatch) {
    const mdBlock = mdMatch[1];
    const mdRegex = /\[SFSymbolName\.(\w+)\]:\s*\{\s*restricted:\s*(true|false),\s*renderingMode:\s*'([^']*)',\s*sfSymbolsVersion:\s*'([^']*)',\s*categories:\s*\[(.*?)\]\s*\}/g;
    let mdEntry: RegExpExecArray | null;

    while ((mdEntry = mdRegex.exec(mdBlock)) !== null) {
      const enumKey = mdEntry[1];
      const restricted = mdEntry[2] === 'true';
      const renderingMode = mdEntry[3];
      const sfSymbolsVersion = mdEntry[4];
      const categoriesStr = mdEntry[5];
      const categories = categoriesStr
        .split(',')
        .map(c => c.trim().replace(/'/g, ''))
        .filter(c => c.length > 0);

      const strKey = reverseEnumMap[enumKey];
      if (strKey) {
        metadataMap[strKey] = { restricted, renderingMode, sfSymbolsVersion, categories };
      }
    }
  }

  return { symbolsData, viewBoxData, metadataMap };
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
    const allMetadata: VariantMetadata = {
      hierarchical: {},
      monochrome: {},
    };

    for (const variant of VARIANTS) {
      const dataFile = path.join(repoRootDir, 'src', variant, 'data.ts');

      try {
        const dataContent = await fs.readFile(dataFile, 'utf8');
        const { symbolsData, viewBoxData, metadataMap } = parseSymbolsData(dataContent, reverseEnumMap);

        allData[variant] = symbolsData;
        allViewBox[variant] = viewBoxData;
        allMetadata[variant] = metadataMap;

        console.log(`✓ Processed ${variant}: ${Object.keys(symbolsData).length} symbols`);
        console.log(`  Sample data:`, Object.keys(symbolsData).slice(0, 3));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`⚠ Could not read ${dataFile}: ${errorMessage}`);
        allData[variant] = {};
        allViewBox[variant] = {};
        allMetadata[variant] = {};
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

    // Collect unique categories and build symbol-to-categories mapping
    const categoriesSet = new Set<string>();
    const symbolCategories: { [key: string]: string[] } = {};

    // Iterate through all variants to collect categories
    for (const variant of VARIANTS) {
      const metadata = allMetadata[variant];
      for (const [symbolKey, meta] of Object.entries(metadata)) {
        if (meta.categories && meta.categories.length > 0) {
          meta.categories.forEach(cat => categoriesSet.add(cat));
          // Use hierarchical variant as canonical source for categories
          if (variant === 'hierarchical') {
            symbolCategories[symbolKey] = meta.categories;
          }
        }
      }
    }

    const categories = Array.from(categoriesSet).sort();
    console.log(`✓ Collected ${categories.length} unique categories`);

    // Create meta manifest
    const meta: MetaManifest = {
      VARIANTS,
      symbolNames: componentNames,
      chunks: chunksManifest,
      categories,
      symbolCategories,
    };

    const metaPath = path.join(distDir, 'meta.json');
    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8');

    // Read HTML template
    let htmlContent = await fs.readFile(htmlInputFile, 'utf8');

    // Read and inject markdown content
    const aboutMdPath = path.join(repoDocsDir, 'about.md');
    const searchMdPath = path.join(repoDocsDir, 'search.md');
    const shortcutsMdPath = path.join(repoDocsDir, 'shortcuts.md');

    const aboutHtml = await readMarkdownAsHtml(aboutMdPath);
    const searchHtml = await readMarkdownAsHtml(searchMdPath);
    const shortcutsHtmlRaw = await readMarkdownAsHtml(shortcutsMdPath);

    // Transform inline code (<code>...</code>) in shortcuts HTML to a simpler placeholder
    // We'll post-process it in the modal script, but convert inline code to <code> tags remain.
    const shortcutsHtml = shortcutsHtmlRaw;

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

    // Process modals.js to inject about content
    const modalsJsPath = path.join(repoDocsDir, 'scripts', 'modals.js');
    let modalsJsContent = await fs.readFile(modalsJsPath, 'utf8');
    // Escape any backticks in the rendered HTML so it can be safely embedded
    const escapedAboutHtml = aboutHtml.replace(/`/g, '\\`');
    const escapedSearchHtml = searchHtml.replace(/`/g, '\\`');

    // Prefer replacing the exact backtick-wrapped placeholder (old format),
    // but also replace plain HTML comments inside the template as a fallback.
    modalsJsContent = modalsJsContent.replace('`<!-- ABOUT_CONTENT -->`', `\`${escapedAboutHtml}\``);
    modalsJsContent = modalsJsContent.replace('`<!-- SEARCH_CONTENT -->`', `\`${escapedSearchHtml}\``);
    modalsJsContent = modalsJsContent.replace('`<!-- SHORTCUTS_CONTENT -->`', `\`${shortcutsHtml.replace(/`/g, '\\`')}\``);
    modalsJsContent = modalsJsContent.replace('<!-- ABOUT_CONTENT -->', escapedAboutHtml);
    modalsJsContent = modalsJsContent.replace('<!-- SEARCH_CONTENT -->', escapedSearchHtml);
    modalsJsContent = modalsJsContent.replace('<!-- SHORTCUTS_CONTENT -->', shortcutsHtml);
    await fs.writeFile(path.join(scriptsDir, 'modals.js'), modalsJsContent, 'utf8');

    console.log('✓ Injected about content into modals.js');

    const scriptFiles = ['data.js', 'utils.js', 'theme.js', 'colors.js', 'symbols.js', 'main.js'];
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