/**
 * Lightweight SVG wrapper for tree-shakeable SF Symbol icon components.
 *
 * Each generated icon component calls this renderer with its inline SVG data.
 * Unlike the legacy SFSymbol component, this does NOT import any data files,
 * keeping the bundle size to only the icons that are actually imported.
 */
import { type ReactElement } from 'react';

import { resolveSize, type SFIconProps } from '@/common/types';

/** Internal props passed by generated icon components */
export interface SFIconRenderProps extends SFIconProps {
  /** Raw SVG inner content (paths, groups, etc.) */
  svgContent: string;
  /** SVG viewBox attribute */
  viewBox: string;
  /** Whether to force fill="currentColor" on the root SVG */
  currentColorFill?: boolean;
}

/**
 * Render an SF Symbol as an inline SVG element.
 *
 * This is intentionally minimal for performance. Generated icon components
 * call this directly with their pre-baked SVG data.
 */
export function SFIcon({
  svgContent,
  viewBox,
  currentColorFill = true,
  size = 'lg',
  className,
  style,
  ...rest
}: SFIconRenderProps): ReactElement {
  const px = resolveSize(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={px}
      height={px}
      fill={currentColorFill ? 'currentColor' : undefined}
      className={className}
      style={{
        minWidth: px,
        minHeight: px,
        maxWidth: px,
        maxHeight: px,
        flex: `0 0 ${px}px`,
        ...style,
      }}
      {...rest}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  ) as ReactElement;
}

export default SFIcon;
