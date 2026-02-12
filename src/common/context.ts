/**
 * Global context for SF Symbol icon defaults.
 *
 * Wrap your app (or a subtree) with `SFIconContext.Provider` to set
 * default `size`, `className`, or any SVG attribute for all icons below.
 *
 * @example
 * ```tsx
 * import { SFIconContext } from 'sf-symbols-lib/dualtone';
 *
 * <SFIconContext.Provider value={{ size: 'sm', className: 'icon' }}>
 *   <SFCheckmarkCircleFill />
 *   <SFPhone />
 * </SFIconContext.Provider>
 * ```
 */
import { createContext } from 'react';

import { type SFIconProps } from '@/common/types';

/** Context for providing default icon props to all descendant icons */
export const SFIconContext = createContext<Partial<SFIconProps>>({});
