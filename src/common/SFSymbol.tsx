/**
 * Shared SFSymbol renderer used by all variants (hierarchical, monochrome, multicolor).
 *
 * This centralizes the SVG rendering logic so variant wrappers remain thin and DRY.
 */
import { ReactElement } from 'react';

import { sfSymbolsData as hierarchicalData, sfSymbolsViewBox as hierarchicalViewBox } from '@/hierarchical/data';
import { sfSymbolsData as monochromeData, sfSymbolsViewBox as monochromeViewBox } from '@/monochrome/data';
import { sfSymbolsData as multicolorData, sfSymbolsViewBox as multicolorViewBox } from '@/multicolor/data';

import { SFSymbolSize } from '@/types/sizes';
import { SFSymbolVariant } from '@/types/symbol-types';

export interface SFSymbolProps {
  name: string;
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  // Optional color to apply to paths marked with fill="white"
  color?: string;
  // Optional: raw svg content and viewBox can be provided directly
  svgContent?: string;
  viewBox?: string;
  variant?: SFSymbolVariant;
  [key: string]: any;
}

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
  let numSize: number;
  if (typeof size === 'string') {
    numSize = SFSymbolSize[size.toLowerCase()] ?? parseInt(size, 10);
  } else {
    numSize = size;
  }

  // If svgContent not provided, resolve from built data by variant + name
  let resolvedSvg: string | undefined = svgContent;
  let resolvedViewBox: string | undefined = viewBox;
  if (!resolvedSvg) {
    switch (variant) {
      case SFSymbolVariant.multicolor:
        resolvedSvg = multicolorData[name as keyof typeof multicolorData];
        resolvedViewBox = resolvedViewBox || multicolorViewBox[name as keyof typeof multicolorViewBox];
        break;
      case SFSymbolVariant.hierarchical:
        resolvedSvg = hierarchicalData[name as keyof typeof hierarchicalData];
        resolvedViewBox = resolvedViewBox || hierarchicalViewBox[name as keyof typeof hierarchicalViewBox];
        break;
      case SFSymbolVariant.monochrome:
      default:
        resolvedSvg = monochromeData[name as keyof typeof monochromeData];
        resolvedViewBox = resolvedViewBox || monochromeViewBox[name as keyof typeof monochromeViewBox];
        break;
    }
  }

  if (!resolvedSvg) {
    console.warn(`Symbol "${name}" not found for variant ${variant}`);
    return <svg /> as ReactElement;
  }

  // Recolor only paths that are explicitly white (#fff, #ffffff or 'white') when a color is provided.
  const recolorRegex = /fill=(['"])(?:#(?:fff|ffffff)|white)\1/gi;
  const processedSvg = color ? resolvedSvg.replace(recolorRegex, `fill="${color}"`) : resolvedSvg;

  const shouldForceFill = variant !== SFSymbolVariant.multicolor && !color;
  const svgFillAttr = shouldForceFill ? 'currentColor' : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={resolvedViewBox || `0 0 ${SFSymbolSize.lg} ${SFSymbolSize.lg}`}
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
        flex: `0 0 ${numSize}px`,
        ...((rest.style as any) || {}),
      }}
      {...rest}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  ) as ReactElement;
}

export default SFSymbol;
