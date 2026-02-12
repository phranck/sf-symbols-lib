import { useState, useEffect, useRef, useCallback } from 'react';

import { CloseButton } from '@/components/CloseButton';
import { markdownToHtml } from '@/lib/markdownToHtml';

// ---------------------------------------------------------------------------
// Tab content – matches the old docs/*.md files exactly
// ---------------------------------------------------------------------------

const ABOUT_CONTENT = `This package was developed out of the need to have Apple's SF symbols available in React projects as well. The result, the SF Symbols displayed, were manually extracted from Apple's [SF Symbols app](https://developer.apple.com/sf-symbols/) (version 7.3) and processed automatically.

The aim was to make these icons available in React with Typescript. For this reason, I created a package with these SF symbols extracted as SVGs, which can be used with any React frontend.

Further information can be found in the [package repository on GitHub](https://github.com/phranck/sf-symbols-lib).
This package is also available on [npmjs](https://www.npmjs.com/package/sf-symbols-lib).`;

const SEARCH_CONTENT = `Use \`|\` for OR, \`&\` or spaces for AND.

**folder | file**
→ matches items containing "folder" OR "file"

**chevron up**
→ matches items containing both "chevron" AND "up"

**person|user & circle**
→ matches items containing "person & circle" OR "user & circle"`;

// ---------------------------------------------------------------------------
// Shortcuts: structured data so we can render keycap badges
// ---------------------------------------------------------------------------

interface Shortcut {
  keys: string[];   // e.g. ['cmd', 'f'] or ['up']
  desc: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['up'], desc: 'Move selection up in the grid' },
  { keys: ['down'], desc: 'Move selection down in the grid' },
  { keys: ['left'], desc: 'Move selection left' },
  { keys: ['right'], desc: 'Move selection right' },
  { keys: ['enter'], desc: 'Mark focused symbol as selected' },
  { keys: ['esc'], desc: 'Close preview / Close About Box / Cancel actions' },
  { keys: ['cmd', 'f'], desc: 'Focus on the search field so you can start writing right away.' },
];

/** Map a key token to a visual symbol (matches old mapKeyToSymbol). */
function mapKeyToSymbol(token: string): string {
  const normalized = token.replace(/[^\w\d]/g, '').toLowerCase();
  switch (normalized) {
    case 'arrowup': case 'uparrow': case 'up': return '↑';
    case 'arrowdown': case 'downarrow': case 'down': return '↓';
    case 'arrowleft': case 'leftarrow': case 'left': return '←';
    case 'arrowright': case 'rightarrow': case 'right': return '→';
    case 'enter': case 'return': return '⏎';
    case 'esc': case 'escape': return '⎋';
    case 'shift': return '⇧';
    case 'ctrl': case 'control': return '⌃';
    case 'alt': case 'option': case 'opt': return '⌥';
    case 'cmd': case 'command': case 'meta': return '⌘';
    default:
      if (/^f\d+$/i.test(token)) return token.toUpperCase();
      if (/^[a-z0-9]$/i.test(token)) return token.toUpperCase();
      return token;
  }
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type TabId = 'about' | 'search' | 'shortcuts';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'about', label: 'About' },
  { id: 'search', label: 'Search' },
  { id: 'shortcuts', label: 'Shortcuts' },
];

// ---------------------------------------------------------------------------
// Shortcuts pane component
// ---------------------------------------------------------------------------

function ShortcutsPane() {
  return (
    <div>
      {SHORTCUTS.map((sc, i) => (
        <div key={i} className="shortcut-row">
          <div className="kbd-group">
            {sc.keys.map((k, j) => (
              <span key={j} className="kbd-key">{mapKeyToSymbol(k)}</span>
            ))}
          </div>
          <div className="shortcut-desc">{sc.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AboutModal
// ---------------------------------------------------------------------------

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure content height after tab change or open
  const measureHeight = useCallback(() => {
    if (contentRef.current) {
      const pane = contentRef.current.querySelector('.tab-pane') as HTMLElement | null;
      if (pane) {
        setContentHeight(pane.scrollHeight);
      }
    }
  }, []);

  useEffect(() => {
    measureHeight();
  }, [activeTab, isOpen, measureHeight]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="about-modal">
      {/* Header with close button */}
      <div className="about-modal-header">
        <h1 className="modal-title">SF Symbols Library</h1>
        <CloseButton onClick={onClose} ariaLabel="Close modal (Esc)" />
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

      {/* Tab content with animated height */}
      <div
        className="about-content"
        ref={contentRef}
        style={{ height: contentHeight != null ? `${contentHeight}px` : 'auto' }}
      >
        <div className="tab-pane" key={activeTab}>
          {activeTab === 'shortcuts' ? (
            <ShortcutsPane />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(
                  activeTab === 'about' ? ABOUT_CONTENT : SEARCH_CONTENT,
                ),
              }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
