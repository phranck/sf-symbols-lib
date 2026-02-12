import { useState, useEffect } from 'react';
import { markdownToHtml } from '@/lib/markdownToHtml';

// Import markdown files as raw text (Vite supports ?raw imports)
// Note: For now, using inline content. In production, import from public/*.md files
const ABOUT_CONTENT = `# About SF Symbols

**SF Symbols** is a comprehensive collection of 7,000+ configurable icons created by Apple.

This library provides **React components** for all SF Symbols in two render modes:
- **Dualtone**: Two-color symbols with accent colors
- **Monochrome**: Single-color symbols

Built with **Vite**, **React 19**, and **TypeScript** for optimal tree-shaking and performance.

Visit the [official SF Symbols website](https://developer.apple.com/sf-symbols/) for guidelines.`;

const SEARCH_CONTENT = `# Search Guide

Use the search box to find symbols by name or description.

## Search Operators

- **OR operator** (\`|\`): Find symbols matching *any* term
  - Example: \`folder | file\` finds symbols with "folder" OR "file"

- **AND operator** (\`&\` or space): Find symbols matching *all* terms
  - Example: \`chevron up\` finds symbols with "chevron" AND "up"

- **Combined**: You can mix operators
  - Example: \`circle | square & fill\` finds (circle) OR (square AND fill)`;

const SHORTCUTS_CONTENT = `# Keyboard Shortcuts

- **Arrow Keys**: Navigate through icons
- **Enter**: Select and open drawer
- **Escape**: Close drawer or modal
- **Cmd+F / Ctrl+F**: Focus search box
- **Click**: Select icon and open drawer`;

type TabId = 'about' | 'search' | 'shortcuts';

interface Tab {
  id: TabId;
  label: string;
  content: string;
}

const TABS: Tab[] = [
  { id: 'about', label: 'About', content: ABOUT_CONTENT },
  { id: 'search', label: 'Search', content: SEARCH_CONTENT },
  { id: 'shortcuts', label: 'Shortcuts', content: SHORTCUTS_CONTENT },
];

/**
 * AboutModal with 3 tabs: About, Search, Shortcuts.
 *
 * Displays markdown-formatted content with link support.
 * Keyboard accessible: Tab navigation, Escape to close.
 */
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('about');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="about-modal">
      {/* Header with close button */}
      <div className="about-modal-header">
        <h1 className="modal-title">SF Symbols Library</h1>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          title="Close modal (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Tab headers */}
      <div className="about-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="about-content">
        <div className="tab-pane">
          <div
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(currentTab.content),
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="about-modal-footer">
        <p className="footer-hint">Press Escape to close</p>
      </div>
    </div>
  );
}
