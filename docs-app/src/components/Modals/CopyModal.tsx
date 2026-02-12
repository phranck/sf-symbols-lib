import { useCallback } from 'react';
import { useAppStore } from '@/state/store';
import type { IconEntry } from '@/lib/icons';

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

/** Convert dot-separated name to capitalized Apple Name: "arrow.down" → "Arrow Down" */
function toAppleName(name: string): string {
  return name
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Generate React code snippet for usage */
function generateCodeSnippet(pascalName: string, renderMode: 'dualtone' | 'monochrome'): string {
  const packagePath =
    renderMode === 'dualtone' ? 'sf-symbols-lib/dualtone' : 'sf-symbols-lib/monochrome';
  return `import { ${pascalName} } from '${packagePath}';\n\n<${pascalName} size={24} />`;
}

export function CopyModal({ isOpen, onClose, icon }: CopyModalProps) {
  const setToastMessage = useAppStore((s) => s.setToastMessage);
  const renderMode = useAppStore((s) => s.renderMode);

  const handleCopySymbolName = useCallback(async () => {
    if (!icon) return;
    try {
      await navigator.clipboard.writeText(icon.name);
      setToastMessage(`Copied: ${icon.name}`);
    } catch {
      setToastMessage('Copy failed. Try again.');
    }
    onClose();
  }, [icon, setToastMessage, onClose]);

  const handleCopyAppleName = useCallback(async () => {
    if (!icon) return;
    const appleName = toAppleName(icon.name);
    try {
      await navigator.clipboard.writeText(appleName);
      setToastMessage(`Copied: ${appleName}`);
    } catch {
      setToastMessage('Copy failed. Try again.');
    }
    onClose();
  }, [icon, setToastMessage, onClose]);

  const handleCopyCode = useCallback(async () => {
    if (!icon) return;
    const code = generateCodeSnippet(icon.pascalName, renderMode);
    try {
      await navigator.clipboard.writeText(code);
      setToastMessage('Copied: Code snippet');
    } catch {
      setToastMessage('Copy failed. Try again.');
    }
    onClose();
  }, [icon, renderMode, setToastMessage, onClose]);

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
          <code className="copy-option-value" style={{ fontSize: '0.85em' }}>
            {codeSnippet.substring(0, 40)}...
          </code>
        </button>
      </div>

      <p className="copy-modal-hint">Click any option to copy to clipboard</p>
    </div>
  );
}
