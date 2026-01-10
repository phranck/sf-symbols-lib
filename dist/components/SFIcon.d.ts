import { ReactElement } from 'react';
import type { AvailableSFSymbol } from './available-sfsymbols';
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
export declare function createSFIcon(iconName: AvailableSFSymbol): ({ size, color, className, strokeWidth, ...rest }: SFIconProps) => ReactElement;
//# sourceMappingURL=SFIcon.d.ts.map