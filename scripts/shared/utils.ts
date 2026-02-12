/**
 * Shared utilities for SF Symbols generator scripts.
 *
 * Single source of truth for naming conventions, SVG parsing, metadata
 * extraction, and variant definitions used by all generator scripts.
 */
import fs from 'fs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All supported rendering mode variants */
export const VARIANTS = ['dualtone', 'monochrome'] as const;

/** A single rendering mode variant */
export type Variant = (typeof VARIANTS)[number];

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

/**
 * Convert kebab-case and dot-notation to PascalCase with SF prefix.
 *
 * @example
 * kebabToPascalCase("checkmark-circle-fill") // "SFCheckmarkCircleFill"
 * kebabToPascalCase("square.and.arrow.down")  // "SFSquareAndArrowDownOnSquare"
 * kebabToPascalCase("0.circle.fill")          // "SF0CircleFill"
 */
export function kebabToPascalCase(kebabStr: string): string {
  const result = kebabStr
    .split(/[-.]/)
    .filter((word) => word.length > 0)
    .map((word) => {
      if (/^\d+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

  return 'SF' + result;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/** Metadata extracted from a single SVG file's <metadata> block */
export interface SvgMetadata {
  appleName: string;
  libName: string;
  restricted: boolean;
  renderingMode: string;
  sfSymbolsVersion: string;
  categories: string[];
}

/**
 * Parse metadata from SVG file content.
 *
 * Extracts the `<metadata>` XML block and pulls out Apple name, lib name,
 * restriction status, rendering mode, SF Symbols version, and categories.
 *
 * @returns The parsed metadata, or `null` if no `<metadata>` block is found.
 */
export function parseMetadataFromContent(content: string): SvgMetadata | null {
  const metadataMatch = content.match(/<metadata>([\s\S]*?)<\/metadata>/);
  if (!metadataMatch) return null;

  const block = metadataMatch[1];
  const categories: string[] = [];
  const categoriesMatch = block.match(/<categories>([\s\S]*?)<\/categories>/);
  if (categoriesMatch) {
    for (const match of categoriesMatch[1].matchAll(
      /<category>([^<]*)<\/category>/g,
    )) {
      categories.push(match[1]);
    }
  }

  return {
    appleName:
      block.match(/<name type="apple">([^<]*)<\/name>/)?.[1] ?? '',
    libName: block.match(/<name type="lib">([^<]*)<\/name>/)?.[1] ?? '',
    restricted:
      block.match(/<restricted>([^<]*)<\/restricted>/)?.[1] === 'true',
    renderingMode:
      block.match(/<renderingMode>([^<]*)<\/renderingMode>/)?.[1] ?? '',
    sfSymbolsVersion:
      block.match(/<sfSymbolsVersion>([^<]*)<\/sfSymbolsVersion>/)?.[1] ?? '',
    categories,
  };
}

// ---------------------------------------------------------------------------
// SVG Parsing
// ---------------------------------------------------------------------------

/** Result of parsing a single SVG icon file */
export interface ParsedSvgEntry {
  /** Inner SVG content (paths, groups, etc.) with colors normalised */
  content: string;
  /** The SVG viewBox attribute value */
  viewBox: string;
  /** Metadata extracted from the embedded `<metadata>` block, if present */
  metadata: SvgMetadata | null;
}

/**
 * Parse an SVG file and return its inner content, viewBox, and metadata.
 *
 * The function reads the file synchronously, extracts metadata, strips XML
 * preamble / comments / metadata, collapses whitespace, and replaces
 * explicit color fills with `currentColor`.
 */
export function parseSvgFile(svgPath: string): ParsedSvgEntry {
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

  // Replace all explicit colors with currentColor
  content = content.replace(
    /fill="(white|black|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})"/g,
    'fill="currentColor"',
  );

  // Extract inner SVG content (between <svg> tags)
  const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const innerContent = svgMatch ? svgMatch[1].trim() : content;

  return { content: innerContent, viewBox, metadata };
}

// ---------------------------------------------------------------------------
// File System Helpers
// ---------------------------------------------------------------------------

/** Ensure a directory exists, creating it recursively if needed */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}
