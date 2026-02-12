/**
 * Lightweight SVG wrapper for tree-shakeable SF Symbol icon components.
 *
 * Each generated icon component calls this renderer with its inline SVG data.
 * Supports ref forwarding and inherits defaults from SFIconContext.
 *
 * Security note: `dangerouslySetInnerHTML` is used here because the SVG content
 * is baked into each generated component at build time (not user-supplied at
 * runtime). The content originates from Apple's official SF Symbols SVG exports
 * and is processed by `scripts/generate-sfsymbols.ts`.
 */
import { forwardRef, useContext } from 'react';

import { SFIconContext } from '@/common/context';
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
 * Reads defaults from the nearest `SFIconContext.Provider`. Explicit props
 * passed to the icon component always take precedence over context values.
 */
export const SFIcon = forwardRef<SVGSVGElement, SFIconRenderProps>(
  (
    {
      svgContent,
      viewBox,
      currentColorFill = true,
      ...props
    },
    ref,
  ) => {
    const context = useContext(SFIconContext);

    const {
      size = context.size ?? 'lg',
      className = context.className,
      style = context.style,
      ...rest
    } = props;

    const pixelSize = resolveSize(size);

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={pixelSize}
        height={pixelSize}
        fill={currentColorFill ? 'currentColor' : undefined}
        className={className}
        style={style}
        {...rest}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  },
);

SFIcon.displayName = 'SFIcon';

export default SFIcon;
