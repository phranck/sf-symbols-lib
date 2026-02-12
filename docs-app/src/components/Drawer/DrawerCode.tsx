/**
 * Syntax-highlighted code preview for the selected icon.
 *
 * Shows a React usage example with line numbers and colored tokens.
 * Includes a copy button that copies the plain-text version.
 */
import { useCallback } from 'react';

import { useAppStore } from '@/state/store';

interface DrawerCodeProps {
  pascalName: string;
  packagePath: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generatePlainText(name: string, pkg: string): string {
  return `import { ${name} } from '${pkg}';

function MyComponent() {
  return (
    <div>
      {/* Basic usage */}
      <${name} />

      {/* With size */}
      <${name} size={32} />

      {/* With size preset */}
      <${name} size="lg" />

      {/* Color via CSS */}
      <${name} className="text-red-500" />

      {/* Inline style */}
      <${name} style={{ color: '#ff0000' }} />
    </div>
  );
}`;
}

function generateHighlighted(name: string, pkg: string): string {
  const n = (s: string) => `<span class="syntax-component">${escapeHtml(s)}</span>`;
  const kw = (s: string) => `<span class="syntax-keyword">${s}</span>`;
  const str = (s: string) => `<span class="syntax-string">'${s}'</span>`;
  const prop = (s: string) => `<span class="syntax-property">${s}</span>`;
  const num = (s: string) => `<span class="syntax-number">${s}</span>`;
  const cmt = (s: string) => `<span class="syntax-comment">${s}</span>`;
  const punc = (s: string) => `<span class="syntax-punctuation">${s}</span>`;
  const ln = (i: number) => `<span class="line-number">${i}</span>  `;

  const lines = [
    `${ln(1)}${kw('import')} ${punc('{')} ${n(name)} ${punc('}')} ${kw('from')} ${str(pkg)};`,
    `${ln(2)}`,
    `${ln(3)}${kw('function')} ${n('MyComponent')}() ${punc('{')}`,
    `${ln(4)}  ${kw('return')} (`,
    `${ln(5)}    ${n('<div>')}`,
    `${ln(6)}      ${cmt('{/* Basic usage */}')}`,
    `${ln(7)}      ${n(`<${name}`)} ${n('/>')}`,
    `${ln(8)}`,
    `${ln(9)}      ${cmt('{/* With size */}')}`,
    `${ln(10)}     ${n(`<${name}`)} ${prop('size')}=${punc('{') + num('32') + punc('}')} ${n('/>')}`,
    `${ln(11)}`,
    `${ln(12)}     ${cmt('{/* With size preset */}')}`,
    `${ln(13)}     ${n(`<${name}`)} ${prop('size')}=${str('lg')} ${n('/>')}`,
    `${ln(14)}`,
    `${ln(15)}     ${cmt('{/* Color via CSS */}')}`,
    `${ln(16)}     ${n(`<${name}`)} ${prop('className')}=${str('text-red-500')} ${n('/>')}`,
    `${ln(17)}`,
    `${ln(18)}     ${cmt('{/* Inline style */}')}`,
    `${ln(19)}     ${n(`<${name}`)} ${prop('style')}=${punc('{{')} ${prop('color:')} ${str('#ff0000')} ${punc('}}')} ${n('/>')}`,
    `${ln(20)}   ${n('</div>')}`,
    `${ln(21)}  );`,
    `${ln(22)}${punc('}')}`,
  ];

  return lines.join('\n');
}

export function DrawerCode({ pascalName, packagePath }: DrawerCodeProps) {
  const setCopyModalOpen = useAppStore((s) => s.setCopyModalOpen);
  const setToastMessage = useAppStore((s) => s.setToastMessage);

  const handleCopy = useCallback(() => {
    const text = generatePlainText(pascalName, packagePath);
    navigator.clipboard.writeText(text).then(
      () => {
        setToastMessage('Copied: Code snippet');
        setCopyModalOpen(false);
      },
      () => {
        setToastMessage('Copy failed. Try again.');
      }
    );
  }, [pascalName, packagePath, setCopyModalOpen, setToastMessage]);

  return (
    <div className="drawer-code" style={{ position: 'relative' }}>
      <pre
        className="codebox-bg"
        dangerouslySetInnerHTML={{
          __html: generateHighlighted(pascalName, packagePath),
        }}
      />
      <button
        className="drawer-copy-btn"
        title="Copy code to clipboard"
        aria-label="Copy code to clipboard"
        onClick={handleCopy}
      >
        &#x2398;
      </button>
    </div>
  );
}
