/**
 * Icon loading module.
 *
 * Merges the wildcard imports from sf-symbols-lib with the metadata catalog
 * to produce a single array of IconEntry objects used throughout the app.
 *
 * This follows the same pattern as Phosphor Icons: import all components
 * at once and pair them with metadata for search and filtering.
 */
import type { ComponentType } from 'react';

import * as DualtoneIcons from 'sf-symbols-lib/dualtone';
import * as MonochromeIcons from 'sf-symbols-lib/monochrome';

import { catalog, type CatalogEntry } from './catalog';

type IconModule = Record<string, ComponentType>;

// Cast via unknown: barrel re-exports SFIcon (generic renderer with different
// props) alongside the icon components, which makes a direct cast fail.
const dualtone = DualtoneIcons as unknown as IconModule;
const monochrome = MonochromeIcons as unknown as IconModule;

export interface IconEntry extends CatalogEntry {
  DualtoneIcon: ComponentType;
  MonochromeIcon: ComponentType;
}

export const icons: ReadonlyArray<IconEntry> = catalog
  .filter((entry) => {
    const hasD = entry.pascalName in dualtone;
    const hasM = entry.pascalName in monochrome;
    if (!hasD || !hasM) {
      console.warn(
        `Icon ${entry.pascalName} missing: dualtone=${hasD}, monochrome=${hasM}`,
      );
    }
    return hasD && hasM;
  })
  .map((entry) => ({
    ...entry,
    DualtoneIcon: dualtone[entry.pascalName],
    MonochromeIcon: monochrome[entry.pascalName],
  }));
