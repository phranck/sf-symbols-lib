import { CloseButton } from '@/components/CloseButton';
import { getPackagePath } from '@/lib/codeGeneration';
import { getIconComponent } from '@/lib/icons';
import { useAppStore } from '@/state/store';

import { PreviewCardCode } from './PreviewCardCode';
import { PreviewCardIcon } from './PreviewCardIcon';
import { PreviewCardInfo } from './PreviewCardInfo';

/**
 * Preview card container.
 *
 * Fixed-positioned at the bottom of the viewport. Slides up with a smooth
 * CSS transition when an icon is selected. Always in the DOM so the
 * transition can animate in both directions.
 */
export function PreviewCard() {
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const renderMode = useAppStore((s) => s.renderMode);
  const previewOpen = useAppStore((s) => s.previewOpen);
  const closePreview = useAppStore((s) => s.closePreview);

  const Icon = selectedIcon
    ? getIconComponent(selectedIcon.pascalName, renderMode)
    : undefined;

  return (
    <div className={`preview-card ${previewOpen ? 'preview-card-open' : ''}`}>
      <CloseButton onClick={closePreview} ariaLabel="Close preview" />
      <div className="preview-card-content">
        {selectedIcon && (
          <div className="preview-card-layout">
            <PreviewCardIcon Icon={Icon} />
            <PreviewCardInfo icon={selectedIcon} />
            <PreviewCardCode
              pascalName={selectedIcon.pascalName}
              packagePath={getPackagePath(renderMode)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
