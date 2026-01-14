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
 * Parse enum entries from sf-symbol-name.ts
 */
function parseEnumMap(content: string): SymbolData {
  const enumMap: SymbolData = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*(\w+)\s*=\s*['"]([^'"]+)['"]/);
    if (match) {
      enumMap[match[2]] = match[1];
    }
  }

  return enumMap;
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
 * Generate the loader script that will be injected into the HTML
 */
function generateLoaderScript(): string {
  return `// Chunked data loader (auto-generated)
      const CHUNKED_META_URL = './meta.json';
      // Ensure safe globals exist on the global object without touching block-scoped bindings
      globalThis.symbolNames = globalThis.symbolNames || {};
      globalThis.allSymbolsData = globalThis.allSymbolsData || { hierarchical: {}, monochrome: {} };
      globalThis.allViewBoxData = globalThis.allViewBoxData || { hierarchical: {}, monochrome: {} };
      globalThis.CHUNKS = globalThis.CHUNKS || {};
      globalThis.chunksLoaded = globalThis.chunksLoaded || { hierarchical: new Set(), monochrome: new Set() };

        function normalizeChunkUrl(rawUrl) {
          if (!rawUrl) return rawUrl;
          if (rawUrl.startsWith('./') || rawUrl.startsWith('/')) return rawUrl;
          return './' + rawUrl;
        }

        async function loadChunk(variant, index) {
          // Skip if already loaded
          if (globalThis.chunksLoaded[variant] && globalThis.chunksLoaded[variant].has(index)) return;
          if (!globalThis.CHUNKS[variant] || !globalThis.CHUNKS[variant][index]) return;

          const rawUrl = globalThis.CHUNKS[variant][index];
          const url = normalizeChunkUrl(rawUrl);
          try {
            const res = await fetch(url);
            const json = await res.json();
            globalThis.allSymbolsData[variant] = globalThis.allSymbolsData[variant] || {};
            globalThis.allViewBoxData[variant] = globalThis.allViewBoxData[variant] || {};
            Object.assign(globalThis.allSymbolsData[variant], json.data || {});
            Object.assign(globalThis.allViewBoxData[variant], json.viewBox || {});

            // Mark chunk as loaded
            if (!globalThis.chunksLoaded[variant]) globalThis.chunksLoaded[variant] = new Set();
            globalThis.chunksLoaded[variant].add(index);

            // Always call updateData after loading a chunk to refresh the display
            if (typeof globalThis.updateData === 'function') {
              try { globalThis.updateData(); } catch (err) { /* suppress update errors */ }
            }
          } catch (err) {
            console.error('Failed to load chunk', url, err);
          }
        }

        // Load all chunks for a variant sequentially to ensure progressive updates
        async function loadAllChunksForVariant(variant) {
          if (!globalThis.CHUNKS[variant]) return;
          for (let i = 0; i < globalThis.CHUNKS[variant].length; i++) {
            await loadChunk(variant, i);
          }
        }

        async function initChunkedData() {
          try {
            const res = await fetch(CHUNKED_META_URL);
            const meta = await res.json();
            // Write safe globals to globalThis to avoid touching block-scoped module bindings
            globalThis.VARIANTS = meta.VARIANTS || [];
            globalThis.symbolNames = meta.symbolNames || {};
            globalThis.CHUNKS = meta.chunks || {};

            // Call updateData to re-render with the loaded symbol names
            if (typeof globalThis.updateData === 'function') {
              try { globalThis.updateData(); } catch (err) { /* suppress update errors */ }
            }

            const loaderVariants = globalThis.VARIANTS || [];
            const defaultVariant = loaderVariants[0];

            if (defaultVariant) {
              // Use the existing variantSelect element declared in the page
              if (typeof variantSelect !== 'undefined' && variantSelect) variantSelect.value = defaultVariant;

              // Load all chunks for the default variant first (sequentially for progressive loading)
              await loadAllChunksForVariant(defaultVariant);

              // Then load remaining variants in the background
              for (const variantName of loaderVariants) {
                if (variantName !== defaultVariant) {
                  loadAllChunksForVariant(variantName); // fire and forget for other variants
                }
              }
            }
          } catch (err) {
            console.error('Failed to load chunked meta:', err);
          }
        }

        // Start initialization asynchronously
        initChunkedData();`;
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
 * Minify JavaScript module content
 * Note: Script minification is disabled because Terser breaks template literals
 * containing HTML content (e.g., `<span>...</span>`). The CSS is still minified,
 * and the scripts are relatively small compared to the symbol data.
 */
async function minifyScripts(htmlContent: string): Promise<string> {
  // Script minification disabled - Terser corrupts template literals with HTML
  // The original JS source remains readable and functional
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
  const repoDocsDir = path.resolve(path.dirname(__filename), '..');
  const repoRootDir = path.resolve(repoDocsDir, '..');
  const distDir = path.join(repoDocsDir, 'dist');
  const htmlInputFile = path.join(repoDocsDir, 'index.html');
  const htmlOutputFile = path.join(distDir, 'index.html');

  try {
    // Read the sf-symbol-name.ts to get enum values
    const symbolNameTs = path.join(repoRootDir, 'src', 'components', 'sf-symbol-name.ts');
    const symbolNameContent = await fs.readFile(symbolNameTs, 'utf8');
    const enumMap = parseEnumMap(symbolNameContent);

    // Build reverse map for O(1) lookups: enumKey -> strKey
    const reverseEnumMap: SymbolData = {};
    for (const [strKey, enumKey] of Object.entries(enumMap)) {
      reverseEnumMap[enumKey] = strKey;
    }

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

    // Build component names map
    const componentNames: SymbolData = {};
    for (const [strKey, enumKey] of Object.entries(enumMap)) {
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

    // Replace module import + initialization code in template with a small loader
    const importPattern =
      /const module = await import\('\.\/sf-symbols-data\.js'\);[\s\S]*?symbolNames = module\.sfSymbolNames \|\| \{\};/;
    const loaderScript = generateLoaderScript();
    htmlContent = htmlContent.replace(importPattern, loaderScript);

    // Insert a small inline metadata stub before the main script tag
    const inlineStub = `<script>/* meta will be fetched from ./meta.json */</script>`;
    htmlContent = htmlContent.replace('<script type="module">', `${inlineStub}\n    <script type="module">`);

    // Minify CSS and JavaScript
    htmlContent = minifyCss(htmlContent);
    htmlContent = await minifyScripts(htmlContent);

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

    const totalSymbols = Object.keys(enumMap).length;
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