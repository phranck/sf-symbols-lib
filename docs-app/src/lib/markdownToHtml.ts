/**
 * Simple markdown to HTML converter for AboutModal content.
 *
 * Supports:
 * - **bold** -> <strong>bold</strong>
 * - `code` -> <code>code</code>
 * - [link](url) -> <a href="url">link</a>
 * - Line breaks are preserved as <br />
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Code: `text` -> <code>text</code>
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links: [text](url) -> <a href="url">text</a>
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Preserve line breaks as <br />
  html = html.replace(/\n/g, '<br />');

  return html;
}
