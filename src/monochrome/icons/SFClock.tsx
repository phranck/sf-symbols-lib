/**
 * AUTO-GENERATED - DO NOT EDIT
 * Icon: SFClock (monochrome)
 */
import { forwardRef } from 'react';

import { SFIcon } from '@/common/SFIcon';
import { type SFIconProps } from '@/common/types';

const SVG_CONTENT = '<g><rect height="25.459" opacity="0" width="25.8008" x="0" y="0"/><path d="M12.7148 25.4395C19.7363 25.4395 25.4395 19.7461 25.4395 12.7246C25.4395 5.70312 19.7363 0 12.7148 0C5.69336 0 0 5.70312 0 12.7246C0 19.7461 5.69336 25.4395 12.7148 25.4395ZM12.7148 23.623C6.68945 23.623 1.81641 18.75 1.81641 12.7246C1.81641 6.69922 6.68945 1.82617 12.7148 1.82617C18.7402 1.82617 23.6133 6.69922 23.6133 12.7246C23.6133 18.75 18.7402 23.623 12.7148 23.623Z" fill="currentColor" fill-opacity="0.85"/><path d="M5.95703 14.0039L12.7051 14.0039C13.1348 14.0039 13.4668 13.6719 13.4668 13.2422L13.4668 4.53125C13.4668 4.11133 13.1348 3.7793 12.7051 3.7793C12.2949 3.7793 11.9531 4.11133 11.9531 4.53125L11.9531 12.4902L5.95703 12.4902C5.52734 12.4902 5.20508 12.8223 5.20508 13.2422C5.20508 13.6719 5.52734 14.0039 5.95703 14.0039Z" fill="currentColor" fill-opacity="0.85"/></g>';
const VIEW_BOX = '0 0 25.8008 25.459';

/** SFClock icon component (monochrome) */
export const SFClock = forwardRef<SVGSVGElement, SFIconProps>((props, ref) => (
  <SFIcon ref={ref} svgContent={SVG_CONTENT} viewBox={VIEW_BOX} {...props} />
));

SFClock.displayName = 'SFClock';

export default SFClock;
