import { createElement } from 'react';

import { IconButton } from '@/components/IconButton';
import { useIconsReady } from '@/hooks/useIconsReady';
import { getIconComponent } from '@/lib/icons';
import { useAppStore } from '@/state/store';

/**
 * Button to open the About modal.
 */
export function AboutButton() {
  const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);
  const renderMode = useAppStore((s) => s.renderMode);
  const iconsReady = useIconsReady();

  const Icon = iconsReady ? getIconComponent('SFInfoCircleFill', renderMode) : undefined;

  return (
    <IconButton
      icon={Icon ? createElement(Icon) : 'i'}
      onClick={() => setAboutModalOpen(true)}
      title="About SF Symbols"
    />
  );
}
