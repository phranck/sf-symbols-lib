/**
 * Shared code generation and name conversion utilities.
 *
 * Used by CopyModal and PreviewCardCode to generate code snippets
 * and convert SF Symbol names to different formats.
 */
import type { RenderMode } from '@/state/store';

/** Convert dot-separated SF Symbol name to capitalized Apple Name: "arrow.down" -> "Arrow Down" */
export function toAppleName(sfSymbolName: string): string {
  return sfSymbolName
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Generate a compact React code snippet for the copy modal. */
export function generateCodeSnippet(pascalName: string, renderMode: RenderMode): string {
  const packagePath =
    renderMode === 'dualtone' ? 'sf-symbols-lib/dualtone' : 'sf-symbols-lib/monochrome';
  return `import { ${pascalName} } from '${packagePath}';\n\n<${pascalName} size={24} />`;
}

/** Resolve the package import path for a given render mode. */
export function getPackagePath(renderMode: RenderMode): string {
  return renderMode === 'dualtone' ? 'sf-symbols-lib/dualtone' : 'sf-symbols-lib/monochrome';
}

/** Escape HTML special characters for safe insertion into innerHTML. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Generate plain-text React usage example for clipboard copy. */
export function generatePlainText(name: string, pkg: string): string {
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

      {/* With CSS variable */}
      <${name} style={{ color: 'var(--accent-color)' }} />

      {/* Icon button */}
      <button className="icon-button">
        <${name} size="sm" />
      </button>

      {/* Button with icon and text */}
      <button className="flex items-center gap-2">
        <${name} size="xs" />
        <span>Edit</span>
      </button>

      {/* Danger button */}
      <button className="flex items-center gap-2 text-red-500">
        <${name} size="xs" />
        <span>Delete</span>
      </button>
    </div>
  );
}`;
}

/** Generate syntax-highlighted HTML for the code preview panel. */
export function generateHighlightedHtml(name: string, pkg: string): string {
  const n = (s: string) => `<span class="syntax-component">${escapeHtml(s)}</span>`;
  const kw = (s: string) => `<span class="syntax-keyword">${s}</span>`;
  const str = (s: string) => `<span class="syntax-string">'${s}'</span>`;
  const prop = (s: string) => `<span class="syntax-property">${s}</span>`;
  const num = (s: string) => `<span class="syntax-number">${s}</span>`;
  const cmt = (s: string) => `<span class="syntax-comment">${s}</span>`;
  const punc = (s: string) => `<span class="syntax-punctuation">${s}</span>`;
  const ln = (i: number) => `<span class="line-number">${i}</span>  `;
  const componentSpan = `<span class="syntax-component">${name}</span>`;

  return `
${ln(1)}${kw('import')} { ${componentSpan} } ${kw('from')} ${str(pkg)};
${ln(2)}
${ln(3)}${kw('function')} ${n('MyComponent')}() {
${ln(4)}  ${kw('return')} (
${ln(5)}    ${n('<div>')}
${ln(6)}      ${cmt('{/* Basic usage */}')}
${ln(7)}      ${n(`<${name}`)} ${n('/>')}
${ln(8)}
${ln(9)}      ${cmt('{/* With size */}')}
${ln(10)}     ${n(`<${name}`)} ${prop('size')}=${punc('{') + num('32') + punc('}')} ${n('/>')}
${ln(11)}
${ln(12)}     ${cmt('{/* With size preset */}')}
${ln(13)}     ${n(`<${name}`)} ${prop('size')}=${str('lg')} ${n('/>')}
${ln(14)}
${ln(15)}     ${cmt('{/* Color via CSS */}')}
${ln(16)}     ${n(`<${name}`)} ${prop('className')}=${str('text-red-500')} ${n('/>')}
${ln(17)}
${ln(18)}     ${cmt('{/* Inline style */}')}
${ln(19)}     ${n(`<${name}`)} ${prop('style')}=${punc('{{')} ${prop('color:')} ${str('#ff0000')} ${punc('}}')} ${n('/>')}
${ln(20)}
${ln(21)}     ${cmt('{/* With CSS variable */}')}
${ln(22)}     ${n(`<${name}`)} ${prop('style')}=${punc('{{')} ${prop('color:')} ${str("var(--accent-color)")} ${punc('}}')} ${n('/>')}
${ln(23)}
${ln(24)}     ${cmt('{/* Icon button */}')}
${ln(25)}     ${n('<button')} ${prop('className')}=${str('icon-button')}${n('>')}
${ln(26)}       ${n(`<${name}`)} ${prop('size')}=${str('sm')} ${n('/>')}
${ln(27)}     ${n('</button>')}
${ln(28)}
${ln(29)}     ${cmt('{/* Button with icon and text */}')}
${ln(30)}     ${n('<button')} ${prop('className')}=${str('flex items-center gap-2')}${n('>')}
${ln(31)}       ${n(`<${name}`)} ${prop('size')}=${str('xs')} ${n('/>')}
${ln(32)}       ${n('<span>')}Edit${n('</span>')}
${ln(33)}     ${n('</button>')}
${ln(34)}
${ln(35)}     ${cmt('{/* Danger button */}')}
${ln(36)}     ${n('<button')} ${prop('className')}=${str('flex items-center gap-2 text-red-500')}${n('>')}
${ln(37)}       ${n(`<${name}`)} ${prop('size')}=${str('xs')} ${n('/>')}
${ln(38)}       ${n('<span>')}Delete${n('</span>')}
${ln(39)}     ${n('</button>')}
${ln(40)}   ${n('</div>')}
${ln(41)}  );
${ln(42)}}
  `;
}
