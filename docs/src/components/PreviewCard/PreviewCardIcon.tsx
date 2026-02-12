import { memo, type ComponentType } from 'react';

interface PreviewCardIconProps {
  Icon: ComponentType<{ size?: number | string }> | undefined;
}

export const PreviewCardIcon = memo(function PreviewCardIcon({
  Icon,
}: PreviewCardIconProps) {
  return (
    <div className="preview-card-left">
      {Icon ? <Icon size="100%" /> : null}
    </div>
  );
});
