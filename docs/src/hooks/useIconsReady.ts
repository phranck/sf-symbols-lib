/**
 * Hook that returns true once icon modules have finished loading.
 * Uses useSyncExternalStore for correct synchronization without
 * triggering cascading renders via setState in effects.
 *
 * Subscribes to iconsLoadedCount (not just iconsLoaded boolean) so that
 * loading a second render mode also triggers a re-render.
 */
import { useSyncExternalStore } from 'react';

import { iconsLoadedCount, onIconsLoaded } from '@/lib/icons';

export function useIconsReady(): boolean {
  const count = useSyncExternalStore(onIconsLoaded, iconsLoadedCount);
  return count > 0;
}
