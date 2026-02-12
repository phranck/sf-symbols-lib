/**
 * Syntax-highlighted code preview for the selected icon.
 *
 * Shows a React usage example with line numbers and colored tokens.
 * Includes a copy button that copies the plain-text version.
 */
import { useCallback } from 'react';

import { IconButton } from '@/components/IconButton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { generateHighlightedHtml, generatePlainText } from '@/lib/codeGeneration';

interface PreviewCardCodeProps {
  pascalName: string;
  packagePath: string;
}

export function PreviewCardCode({ pascalName, packagePath }: PreviewCardCodeProps) {
  const { copy } = useCopyToClipboard();

  const handleCopy = useCallback(() => {
    const text = generatePlainText(pascalName, packagePath);
    copy(text, 'Code copied to clipboard', {
      iconName: pascalName,
      copyType: 'code',
    });
  }, [pascalName, packagePath, copy]);

  return (
    <div className="preview-card-code">
      <IconButton
        icon={<>&#x2398;</>}
        size="sm"
        onClick={handleCopy}
        title="Copy code to clipboard"
        className="preview-card-code-copy"
      />
      <div className="preview-card-code-scroll">
        <pre
          className="codebox-bg"
          dangerouslySetInnerHTML={{
            __html: generateHighlightedHtml(pascalName, packagePath),
          }}
        />
      </div>
    </div>
  );
}
