/**
 * Generate lightweight metadata files for instant search
 * 
 * Output: docs/data/{variant}-metadata.json
 * Size: ~100 KB per variant (just names, no SVG data)
 * 
 * This enables instant search on all 7,007 icons without loading SVG data.
 */

import fs from 'fs';
import path from 'path';

const VARIANTS = ['hierarchical', 'monochrome'] as const;

interface IconMetadata {
  fileName: string;      // e.g., "checkmark.circle"
  pascalName: string;    // e.g., "SFCheckmarkCircle"
  category?: string;     // Optional: icon category (for future filtering)
}

function kebabToPascalCase(kebabStr: string): string {
  const result = kebabStr
    .split(/[-.]/)
    .filter(word => word.length > 0)
    .map(word => {
      if (/^\d+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
  return 'SF' + result;
}

/**
 * Extract category from icon name (heuristic)
 */
function extractCategory(fileName: string): string {
  // Extract first word before dot or dash
  const match = fileName.match(/^([a-z]+)/);
  if (match) {
    const firstWord = match[1];
    
    // Map common prefixes to categories
    const categoryMap: Record<string, string> = {
      'arrow': 'Arrows',
      'chevron': 'Arrows',
      'circle': 'Shapes',
      'square': 'Shapes',
      'triangle': 'Shapes',
      'person': 'People',
      'figure': 'People',
      'folder': 'Files',
      'document': 'Files',
      'calendar': 'Time',
      'clock': 'Time',
      'play': 'Media',
      'pause': 'Media',
      'music': 'Media',
      'phone': 'Communication',
      'message': 'Communication',
      'envelope': 'Communication',
      'gear': 'Settings',
      'wrench': 'Settings',
      'heart': 'Health',
      'star': 'Favorites',
      'bookmark': 'Favorites',
      'trash': 'Actions',
      'plus': 'Actions',
      'minus': 'Actions',
      'checkmark': 'Actions',
      'xmark': 'Actions',
    };
    
    return categoryMap[firstWord] || 'Other';
  }
  
  return 'Other';
}

async function generateMetadata() {
  console.log('\n📋 Generating icon metadata for instant search...\n');
  
  const svgsDir = path.join(process.cwd(), '.svgs');
  const outputDir = path.join(process.cwd(), 'docs', 'data');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const variant of VARIANTS) {
    const variantDir = path.join(svgsDir, variant);
    
    if (!fs.existsSync(variantDir)) {
      console.log(`⚠️  Skipping ${variant} (directory not found)`);
      continue;
    }
    
    // Get all SVG files
    const files = fs.readdirSync(variantDir)
      .filter(file => file.endsWith('.svg'))
      .map(file => file.replace('.svg', ''))
      .sort();
    
    // Generate metadata
    const metadata: IconMetadata[] = files.map(fileName => ({
      fileName,
      pascalName: kebabToPascalCase(fileName),
      category: extractCategory(fileName),
    }));
    
    // Write to JSON file
    const outputFile = path.join(outputDir, `${variant}-metadata.json`);
    fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));
    
    const fileSizeKB = (fs.statSync(outputFile).size / 1024).toFixed(2);
    
    console.log(`✅ ${variant}: ${metadata.length.toLocaleString()} icons → ${outputFile}`);
    console.log(`   Size: ${fileSizeKB} KB`);
  }
  
  console.log('\n📊 Summary:');
  console.log('   Metadata files enable instant search on all icons');
  console.log('   SVG components are loaded lazily when icons become visible\n');
}

generateMetadata().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
