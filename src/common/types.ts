/**
 * Shared prop types for all SF Symbol icon components.
 *
 * Every generated icon component accepts `SFIconProps`. Size can be
 * specified as a named preset (`'xs'` through `'xl'`) or a numeric
 * pixel value.
 */
import { type CSSProperties, type SVGAttributes } from 'react';

/** Named size presets for icon components */
export type SFIconSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Size can be a named preset or a numeric pixel value */
export type SFIconSize = SFIconSizePreset | number;

/** Pixel values for named size presets */
export const SF_ICON_SIZES: Record<SFIconSizePreset, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/** Resolve a size value to pixels */
export function resolveSize(size: SFIconSize): number {
  if (typeof size === 'number') return size;
  return SF_ICON_SIZES[size] ?? 24;
}

/** Props shared by all generated icon components */
export interface SFIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'dangerouslySetInnerHTML'> {
  /** Icon size as named preset or pixel number. Defaults to 'lg' (24px). */
  size?: SFIconSize;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}
