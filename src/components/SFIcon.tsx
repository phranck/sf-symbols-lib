import { ReactElement } from 'react';

import { PAIconSize } from '../types/sizes';

import type { AvailableSFSymbol } from './available-sfsymbols';
import { sfIconsData, sfIconsViewBox } from './icons-data';

interface SFIconProps {
  /**
   * Size of the icon - either a pixel value (number/string) or a size preset (xs, sm, md, lg, xl)
   * @default 24
   */
  size?: number | string;

  /**
   * Color of the icon
   * @default 'currentColor'
   */
  color?: string;

  /**
   * CSS class name to apply to the SVG element
   */
  className?: string;

  /**
   * Stroke width of the icon
   * @default 1
   */
  strokeWidth?: number | string;

  /**
   * Additional SVG attributes
   */
  [key: string]: any;
}

/**
 * Props interface for SF Symbol icon components
 */
export type { SFIconProps };

/**
 * Factory function to create SF Symbol icon components
 * Each icon is a pre-configured SVG component with consistent styling
 *
 * @param iconName - The name of the icon to render
 * @returns A React component that renders the SF Symbol icon
 */
export function createSFIcon(iconName: AvailableSFSymbol) {
  /**
   * SF Symbol Icon Component
   *
   * A custom SVG icon from SF Symbols.
   * Follows the same API conventions as React Icons library components.
   *
   * @param props - Component props
   * @returns {JSX.Element} The SVG icon element
   *
   * @example
   * // Basic usage
   * <SFCheckmark size={24} color="currentColor" />
   *
   * @example
   * // With custom styling
   * <SFCheckmark size={32} color="#ff0000" className="custom-class" />
   */
  return function SFIcon({
    size = 24,
    color = 'currentColor',
    className = '',
    strokeWidth = 1,
    ...rest
  }: SFIconProps): ReactElement {
    // Convert size to numeric pixels - handle both preset sizes (xs, sm, md, lg, xl) and numeric values
    let numSize: number;
    
    if (typeof size === 'string') {
      // Check if it's a preset size
      numSize = PAIconSize[size.toLowerCase()] ?? parseInt(size, 10);
    } else {
      numSize = size;
    }

    const svgContent = sfIconsData[iconName];
    const viewBox = sfIconsViewBox[iconName] || '0 0 24 24';

    if (!svgContent) {
      console.warn(`Icon "${iconName}" not found in icons-data`);
      return <svg />;
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={numSize}
        height={numSize}
        fill={color}
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
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  };
}
