#!/usr/bin/env node
/**
 * Generate runtime data and inline it into index.html for the docs.
 * This allows the page to work when opened directly from the file system.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const VARIANTS = ['hierarchical', 'monochrome', 'multicolor'];

async function main() {
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

    // Parse enum entries: EnumKey = 'enum.value',
    const enumMap = {}; // 'checkmark.circle' -> 'CheckmarkCircle'
    const enumLines = symbolNameContent.split('\n');
    for (const line of enumLines) {
      const match = line.match(/^\s*(\w+)\s*=\s*['"]([^'"]+)['"]/);
      if (match) {
        enumMap[match[2]] = match[1];
      }
    }

    // Build data structure for all variants and colors
    const allData = {};
    const allViewBox = {};

    for (const variant of VARIANTS) {
      allData[variant] = {};
      allViewBox[variant] = {};

      const dataFile = path.join(repoRootDir, 'src', variant, 'data.ts');

      try {
        const dataContent = await fs.readFile(dataFile, 'utf8');

        // Parse sfSymbolsData
        const symbolsData = {};
        const dataMatch = dataContent.match(/export const sfSymbolsData[^{]*=\s*\{([\s\S]*?)\n\};/);
        if (dataMatch) {
          const dataBlock = dataMatch[1];
          const entryRegex = /\[SFSymbolName\.(\w+)\]:\s*'([^']*(?:\\.[^']*)*)'/g;
          let entry;
          while ((entry = entryRegex.exec(dataBlock)) !== null) {
            const enumKey = entry[1];
            const svgContent = entry[2].replace(/\\'/g, "'");
            for (const [strKey, eKey] of Object.entries(enumMap)) {
              if (eKey === enumKey) {
                symbolsData[strKey] = svgContent;
                break;
              }
            }
          }
        }

        // Parse sfSymbolsViewBox
        const viewBoxData = {};
        const vbMatch = dataContent.match(/export const sfSymbolsViewBox[^{]*=\s*\{([\s\S]*?)\n\};/);
        if (vbMatch) {
          const vbBlock = vbMatch[1];
          const vbRegex = /\[SFSymbolName\.(\w+)\]:\s*'([^']*)'/g;
          let vbEntry;
          while ((vbEntry = vbRegex.exec(vbBlock)) !== null) {
            const enumKey = vbEntry[1];
            const viewBox = vbEntry[2];
            for (const [strKey, eKey] of Object.entries(enumMap)) {
              if (eKey === enumKey) {
                viewBoxData[strKey] = viewBox;
                break;
              }
            }
          }
        }

        allData[variant] = symbolsData;
        allViewBox[variant] = viewBoxData;

        console.log(`✓ Processed ${variant}: ${Object.keys(symbolsData).length} symbols`);
        console.log(`  Sample data:`, Object.keys(symbolsData).slice(0, 3));
      } catch (err) {
        console.warn(`⚠ Could not read ${dataFile}: ${err.message}`);
        allData[variant] = {};
        allViewBox[variant] = {};
      }
    }

    console.log('Final allData keys:', Object.keys(allData));
    console.log('hierarchical data keys count:', Object.keys(allData.hierarchical || {}).length);

    // Build component names map
    const componentNames = {};
    for (const [strKey, enumKey] of Object.entries(enumMap)) {
      componentNames[strKey] = enumKey;
    }

    // Chunk the large data into smaller JSON files and emit a small meta manifest
    const chunksDir = path.join(distDir, 'chunks');
    await fs.mkdir(chunksDir, { recursive: true });

    // Chunking strategy: fixed-size chunks per variant
    const CHUNK_SIZE = 500; // symbols per chunk (tuneable)
    const chunksManifest = {};

    for (const variant of VARIANTS) {
      const keys = Object.keys(allData[variant] || {});
      chunksManifest[variant] = [];
      for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
        const slice = keys.slice(i, i + CHUNK_SIZE);
        const chunkData = { data: {}, viewBox: {} };
        for (const key of slice) {
          chunkData.data[key] = allData[variant][key];
          if (allViewBox[variant] && allViewBox[variant][key]) {
            chunkData.viewBox[key] = allViewBox[variant][key];
          }
        }
        const chunkName = `chunks/${variant}-${Math.floor(i / CHUNK_SIZE)}.json`;
        const chunkPath = path.join(distDir, chunkName);
        await fs.writeFile(chunkPath, JSON.stringify(chunkData), 'utf8');
        chunksManifest[variant].push(chunkName);
      }
      // ensure at least one empty chunk exists if there are no symbols
      if (chunksManifest[variant].length === 0) {
        const chunkName = `chunks/${variant}-0.json`;
        const chunkPath = path.join(distDir, chunkName);
        await fs.writeFile(chunkPath, JSON.stringify({ data: {}, viewBox: {} }), 'utf8');
        chunksManifest[variant].push(chunkName);
      }
    }

    // Create meta manifest (small)
    const meta = {
      VARIANTS: VARIANTS,
      symbolNames: componentNames,
      chunks: chunksManifest
    };

    const metaPath = path.join(distDir, 'meta.json');
    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8');

    // Read HTML template
    let htmlContent = await fs.readFile(htmlInputFile, 'utf8');

    // Replace module import + initialization code in template with a small loader
    // The template previously did: const module = await import('./sf-symbols-data.js'); ...
    // We'll replace that block so the page fetches meta.json and the first chunk lazily.
    const importPattern = /const module = await import\('\.\/sf-symbols-data\.js'\);[\s\S]*?symbolNames = module\.sfSymbolNames \|\| \{\};/;

    // Build loader script that fetches meta.json and then fetches the first chunk for the default variant
    const loaderScript = `// Chunked data loader (auto-generated)
      const CHUNKED_META_URL = './meta.json';
      // Ensure safe globals exist on the global object without touching block-scoped bindings
      globalThis.symbolNames = globalThis.symbolNames || {};
      globalThis.allSymbolsData = globalThis.allSymbolsData || { hierarchical: {}, monochrome: {}, multicolor: {} };
      globalThis.allViewBoxData = globalThis.allViewBoxData || { hierarchical: {}, monochrome: {}, multicolor: {} };
      globalThis.CHUNKS = globalThis.CHUNKS || {};

        function normalizeChunkUrl(rawUrl) {
          if (!rawUrl) return rawUrl;
          if (rawUrl.startsWith('./') || rawUrl.startsWith('/')) return rawUrl;
          return './' + rawUrl;
        }

        function scheduleIdle(task) {
          if (typeof requestIdleCallback === 'function') return requestIdleCallback(task);
          return setTimeout(task, 50);
        }

        async function loadChunk(variant, index, options = { callUpdate: true }) {
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
            if (options.callUpdate && typeof updateData === 'function') {
              try { updateData(); } catch (err) { /* suppress update errors */ }
            }
          } catch (err) {
            console.error('Failed to load chunk', url, err);
          }
        }

        function loadAllChunksForVariant(variant) {
          if (!globalThis.CHUNKS[variant]) return;
          for (let i = 0; i < globalThis.CHUNKS[variant].length; i++) {
            if (i === 0) continue; // first chunk likely already loaded
            scheduleIdle(() => loadChunk(variant, i, { callUpdate: true }));
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
              if (globalThis.CHUNKS[defaultVariant] && globalThis.CHUNKS[defaultVariant].length) {
                await loadChunk(defaultVariant, 0);
                if (typeof updateData === 'function') {
                  try { updateData(); } catch (err) { /* suppress update errors */ }
                }
              }
              // Background-prefetch remaining chunks for all variants
              scheduleIdle(() => {
                for (const variantName of loaderVariants) {
                  scheduleIdle(() => loadAllChunksForVariant(variantName));
                }
              });
            }
          } catch (err) {
            console.error('Failed to load chunked meta:', err);
          }
        }

        // Start initialization asynchronously
        initChunkedData();`;

    htmlContent = htmlContent.replace(importPattern, loaderScript);

    // Insert a small inline metadata stub before the main script tag so page JS can use initial VARIANTS/symbolNames faster
    const inlineStub = `<script>/* meta will be fetched from ./meta.json */</script>`;
    htmlContent = htmlContent.replace('<script type="module">', `${inlineStub}\n    <script type="module">`);

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Write the modified HTML
    await fs.writeFile(htmlOutputFile, htmlContent, 'utf8');

    const totalSymbols = Object.keys(enumMap).length;
    const fileSize = (Buffer.byteLength(htmlContent, 'utf8') / 1024 / 1024).toFixed(1);
    console.log(`\n✅ Generated ${htmlOutputFile}`);
    console.log(`   ${totalSymbols} symbols × ${VARIANTS.length} variants`);
    console.log(`   File size: ${fileSize} MB`);
  } catch (err) {
    console.error('Failed to generate:', err.message);
    process.exit(1);
  }
}

main();
