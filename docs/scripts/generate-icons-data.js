#!/usr/bin/env node
/**
 * Generate a runtime JS export `sf-icons-data.js` from the generated TypeScript declaration
 * located at `../dist/components/icons-data.d.ts`.
 * This allows the static docs to import the icon SVG strings at runtime.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const repoDocsDir = path.resolve(path.dirname(__filename), '..');
  const repoRootDir = path.resolve(repoDocsDir, '..');
  const inputDts = path.join(repoDocsDir, 'dist', 'components', 'icons-data.d.ts');
  const iconsMapTs = path.join(repoRootDir, 'src', 'components', 'icons-map.ts');
  const outFile = path.join(repoDocsDir, 'dist', 'sf-icons-data.js');

  try {
    const content = await fs.readFile(inputDts, 'utf8');
    // Extract sfIconsData object
    const dataMarker = 'export declare const sfIconsData';
    let dataStart = content.indexOf(dataMarker);
    if (dataStart === -1) dataStart = content.indexOf('export const sfIconsData');
    if (dataStart === -1) throw new Error('sfIconsData marker not found in ' + inputDts);

    const dataBraceStart = content.indexOf('{', dataStart);
    if (dataBraceStart === -1) throw new Error('Opening brace not found for sfIconsData');

    let idx = dataBraceStart;
    let depth = 0;
    while (idx < content.length) {
      const ch = content[idx];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) break;
      }
      idx++;
    }
    if (depth !== 0) throw new Error('Failed to locate matching closing brace for sfIconsData');
    const dataObjectText = content.slice(dataBraceStart, idx + 1);

    // Extract sfIconsViewBox object if present
    let viewBoxObjectText = null;
    const vbMarker = 'export declare const sfIconsViewBox';
    let vbStart = content.indexOf(vbMarker);
    if (vbStart === -1) vbStart = content.indexOf('export const sfIconsViewBox');
    if (vbStart !== -1) {
      const vbBraceStart = content.indexOf('{', vbStart);
      if (vbBraceStart !== -1) {
        let j = vbBraceStart;
        let vd = 0;
        while (j < content.length) {
          const ch = content[j];
          if (ch === '{') vd++;
          else if (ch === '}') {
            vd--;
            if (vd === 0) break;
          }
          j++;
        }
        if (vd === 0) viewBoxObjectText = content.slice(vbBraceStart, j + 1);
      }
    }

    // Read icons-map.ts to build component names mapping
    const iconsMapContent = await fs.readFile(iconsMapTs, 'utf8');
    const componentNames = {};
    // Simple parsing: find the sfIconMap object
    const mapStart = iconsMapContent.indexOf('export const sfIconMap = {');
    if (mapStart !== -1) {
      const mapBraceStart = iconsMapContent.indexOf('{', mapStart);
      let k = mapBraceStart;
      let md = 0;
      while (k < iconsMapContent.length) {
        const ch = iconsMapContent[k];
        if (ch === '{') md++;
        else if (ch === '}') {
          md--;
          if (md === 0) break;
        }
        k++;
      }
      const mapText = iconsMapContent.slice(mapBraceStart, k + 1);
      // Parse the map: it's like [AvailableSFSymbol.SunMax]: 'SFSunMax',
      // But to get the string key, we need the enum value.
      // Since AvailableSFSymbol.SunMax corresponds to 'sun.max', we can use that.
      // Read available-sfsymbols.ts
      const availableTs = path.join(repoRootDir, 'src', 'components', 'available-sfsymbols.ts');
      const availableContent = await fs.readFile(availableTs, 'utf8');
      const enumMap = {};
      const enumLines = availableContent.split('\n');
      for (const line of enumLines) {
        const match = line.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/);
        if (match) {
          enumMap[match[2]] = match[1]; // 'sun.max' -> 'SunMax'
        }
      }
      // Now parse mapText
      const mapLines = mapText.split('\n');
      for (const line of mapLines) {
        const match = line.match(/\[AvailableSFSymbol\.(\w+)\]:\s*['"]([^'"]+)['"]/);
        if (match) {
          const enumKey = match[1];
          const componentName = match[2];
          // Find the string value from enumMap
          for (const [strVal, enumVal] of Object.entries(enumMap)) {
            if (enumVal === enumKey) {
              componentNames[strVal] = componentName;
              break;
            }
          }
        }
      }
    }

    // Convert TS declaration lines to valid JS object literal:
    // - remove `readonly ` tokens
    // - replace trailing semicolons with commas
    // - keep keys and string values as-is
    let jsDataObject = dataObjectText.replace(/readonly\s+/g, '');
    jsDataObject = jsDataObject.replace(/;\s*\n/g, ',\n');

    let jsViewBoxObject = '{}';
    if (viewBoxObjectText) {
      jsViewBoxObject = viewBoxObjectText.replace(/readonly\s+/g, '');
      jsViewBoxObject = jsViewBoxObject.replace(/;\s*\n/g, ',\n');
    }

    let jsComponentNames = JSON.stringify(componentNames);

    const outContent = `export const sfIconsData = ${jsDataObject};\nexport const sfIconsViewBox = ${jsViewBoxObject};\nexport const sfIconComponentNames = ${jsComponentNames};\nexport default { sfIconsData, sfIconsViewBox, sfIconComponentNames };\n`;

    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, outContent, 'utf8');
    // eslint-disable-next-line no-console
    console.log('Generated', outFile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate sf-icons-data.js:', err.message);
    process.exit(1);
  }
}

main();
