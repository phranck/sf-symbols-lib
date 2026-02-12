/**
 * Icon loading module.
 *
 * Exports metadata from the catalog immediately (sync) so the UI can render
 * the grid shell instantly. Icon React components are loaded asynchronously
 * in the background via ensureModeLoaded().
 *
 * Only the active render mode is loaded initially. The other mode is loaded
 * on demand when the user switches, avoiding ~13 MB of unnecessary JS parsing.
 */
import type { ComponentType } from 'react';

import { catalog, type CatalogEntry } from './catalog';

type IconModule = Record<string, ComponentType>;
type RenderMode = 'dualtone' | 'monochrome';

export type IconEntry = CatalogEntry;

/** Metadata array - available immediately (no component imports). */
export const icons: ReadonlyArray<IconEntry> = catalog;

/** Component lookup maps - populated after async load. */
let dualtoneMap: IconModule = {};
let monochromeMap: IconModule = {};
const _loadedModes = new Set<RenderMode>();

/** Number of loaded modes - changes on each new mode load, triggering re-renders. */
export function iconsLoadedCount(): number {
  return _loadedModes.size;
}

/** Whether at least one icon module has finished loading. */
export function iconsLoaded(): boolean {
  return _loadedModes.size > 0;
}

/** Get an icon component (returns undefined if not yet loaded). */
export function getIconComponent(
  pascalName: string,
  mode: RenderMode,
): ComponentType | undefined {
  const map = mode === 'dualtone' ? dualtoneMap : monochromeMap;
  return map[pascalName];
}

/**
 * Subscribe to icon loading completion.
 * Compatible with React's useSyncExternalStore:
 * - Does NOT call cb synchronously during subscribe
 * - Only removes listener via the returned unsubscribe function
 */
const listeners = new Set<() => void>();

export function onIconsLoaded(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyListeners(): void {
  for (const cb of listeners) cb();
}

/** Type guard for dynamically imported icon modules. */
function isIconModule(mod: unknown): mod is IconModule {
  return typeof mod === 'object' && mod !== null;
}

/** Load a single render mode. */
async function loadMode(mode: RenderMode): Promise<void> {
  if (_loadedModes.has(mode)) return;

  if (mode === 'dualtone') {
    const mod: unknown = await import('sf-symbols-lib/dualtone');
    if (isIconModule(mod)) dualtoneMap = mod;
  } else {
    const mod: unknown = await import('sf-symbols-lib/monochrome');
    if (isIconModule(mod)) monochromeMap = mod;
  }

  _loadedModes.add(mode);
  notifyListeners();
}

/**
 * Ensure a render mode is loaded. No-op if already loaded.
 * Call from App on mount and whenever the render mode changes.
 */
export async function ensureModeLoaded(mode: RenderMode): Promise<void> {
  await loadMode(mode);
}
