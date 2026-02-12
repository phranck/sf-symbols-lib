import { useCallback, memo } from 'react';

import { IconButton } from '@/components/IconButton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { IconEntry } from '@/lib/icons';

interface PreviewCardInfoProps {
  icon: IconEntry;
}

export const PreviewCardInfo = memo(function PreviewCardInfo({ icon }: PreviewCardInfoProps) {
  const { copy } = useCopyToClipboard();

  const handleCopy = useCallback(
    (text: string, trackType: 'name' | 'appleName') => {
      copy(text, `${text} copied to clipboard`, {
        iconName: icon.name,
        copyType: trackType,
      });
    },
    [icon.name, copy],
  );

  return (
    <div className="preview-card-info">
      {/* Package Symbol Name row */}
      <div className="preview-card-info-row">
        <div>
          <div className="preview-card-label">Package Symbol Name</div>
          <div className="preview-card-info-value">{icon.pascalName}</div>
        </div>
        <IconButton
          icon={<>&#x2398;</>}
          size="md"
          onClick={() => handleCopy(icon.pascalName, 'name')}
          title="Copy Package Symbol Name to Clipboard"
        />
      </div>

      {/* Apple Symbol Name row */}
      <div className="preview-card-info-row">
        <div>
          <div className="preview-card-label">Apple Symbol Name</div>
          <div className="preview-card-info-value">{icon.name}</div>
        </div>
        <IconButton
          icon={<>&#x2398;</>}
          size="md"
          onClick={() => handleCopy(icon.name, 'appleName')}
          title="Copy Apple Symbol Name to Clipboard"
        />
      </div>
    </div>
  );
});
