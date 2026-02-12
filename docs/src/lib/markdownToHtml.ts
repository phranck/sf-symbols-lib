/**
 * Markdown to HTML converter using the `marked` library.
 * Used by the AboutModal to render tab content.
 */
import { marked } from 'marked';

// Configure marked for safe, synchronous rendering
marked.setOptions({
  async: false,
  gfm: true,
  breaks: false,
});

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}
