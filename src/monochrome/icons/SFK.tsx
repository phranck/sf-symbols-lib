/**
 * AUTO-GENERATED - DO NOT EDIT
 * Icon: SFK (monochrome)
 */
import { forwardRef } from 'react';

import { SFIcon } from '@/common/SFIcon';
import { type SFIconProps } from '@/common/types';

const SVG_CONTENT = '<g><rect height="18.6621" opacity="0" width="13.7109" x="0" y="0"/><path d="M0.976562 18.6426C1.57227 18.6426 1.96289 18.252 1.96289 17.6465L1.96289 12.1094L4.25781 9.67773L11.4453 18.0957C11.7871 18.4961 12.0215 18.6426 12.3926 18.6426C12.9395 18.6426 13.3496 18.252 13.3496 17.7344C13.3496 17.4609 13.2129 17.1973 12.959 16.8945L5.6543 8.28125L12.2363 1.52344C12.4512 1.29883 12.5488 1.09375 12.5488 0.859375C12.5488 0.371094 12.168 0 11.6699 0C11.3867 0 11.1621 0.0976562 10.8789 0.390625L2.07031 9.56055L1.96289 9.56055L1.96289 0.986328C1.96289 0.390625 1.57227 0 0.976562 0C0.371094 0 0 0.390625 0 0.986328L0 17.6465C0 18.252 0.371094 18.6426 0.976562 18.6426Z" fill="currentColor" fill-opacity="0.85"/></g>';
const VIEW_BOX = '0 0 13.7109 18.6621';

/** SFK icon component (monochrome) */
export const SFK = forwardRef<SVGSVGElement, SFIconProps>((props, ref) => (
  <SFIcon ref={ref} svgContent={SVG_CONTENT} viewBox={VIEW_BOX} {...props} />
));

SFK.displayName = 'SFK';

export default SFK;
