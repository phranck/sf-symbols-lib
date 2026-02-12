import { useCallback } from 'react';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { generateCodeSnippet, toAppleName } from '@/lib/codeGeneration';
import type { IconEntry } from '@/lib/icons';
import { useAppStore } from '@/state/store';

/**
 * Modal dialog with 3 copy options for the selected icon.
 *
 * Displays:
 * 1. Symbol name (e.g., "arrow.down.circle.fill")
 * 2. Apple name (e.g., "Arrow Down Circle Fill")
 * 3. Code snippet (full React import + usage)
 *
 * Each copy action shows toast feedback and closes the modal.
 */
interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: IconEntry | null;
}

export function CopyModal({ isOpen, onClose, icon }: CopyModalProps) {
  const { copy } = useCopyToClipboard();
  const renderMode = useAppStore((s) => s.renderMode);

  const handleCopySymbolName = useCallback(async () => {
    if (!icon) return;
    await copy(icon.name, `Copied: ${icon.name}`, {
      iconName: icon.name,
      copyType: 'name',
    });
    onClose();
  }, [icon, copy, onClose]);

  const handleCopyAppleName = useCallback(async () => {
    if (!icon) return;
    const appleName = toAppleName(icon.name);
    await copy(appleName, `Copied: ${appleName}`, {
      iconName: icon.name,
      copyType: 'appleName',
    });
    onClose();
  }, [icon, copy, onClose]);

  const handleCopyCode = useCallback(async () => {
    if (!icon) return;
    const code = generateCodeSnippet(icon.pascalName, renderMode);
    await copy(code, 'Copied: Code snippet', {
      iconName: icon.name,
      copyType: 'code',
    });
    onClose();
  }, [icon, renderMode, copy, onClose]);

  if (!isOpen || !icon) {
    return null;
  }

  const appleName = toAppleName(icon.name);
  const codeSnippet = generateCodeSnippet(icon.pascalName, renderMode);

  return (
    <div className="copy-modal">
      <h2 className="modal-title">Copy Options</h2>

      <div className="copy-options">
        <button className="copy-option" onClick={handleCopySymbolName}>
          <div className="copy-option-label">Symbol Name</div>
          <code className="copy-option-value">{icon.name}</code>
        </button>

        <button className="copy-option" onClick={handleCopyAppleName}>
          <div className="copy-option-label">Apple Name</div>
          <code className="copy-option-value">{appleName}</code>
        </button>

        <button className="copy-option" onClick={handleCopyCode}>
          <div className="copy-option-label">Code Snippet</div>
          <code className="copy-option-value copy-option-value-small">
            {codeSnippet.substring(0, 40)}...
          </code>
        </button>
      </div>

      <p className="copy-modal-hint">Click any option to copy to clipboard</p>
    </div>
  );
}
