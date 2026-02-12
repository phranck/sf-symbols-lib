/**
 * Top-level application layout.
 *
 * Wires up the theme side-effect hook and renders the main structure:
 * Header, icon grid (main content), drawer, footer, and modals.
 */
import { useCallback, useEffect } from 'react';

import { Drawer } from '@/components/Drawer';
import { Header } from '@/components/Header';
import { IconGrid } from '@/components/IconGrid';
import { AboutModal } from '@/components/Modals/AboutModal';
import { CopyModal } from '@/components/Modals/CopyModal';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { Toast } from '@/components/Toast/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/state/store';

export function App() {
  useTheme();

  const aboutModalOpen = useAppStore((s) => s.aboutModalOpen);
  const copyModalOpen = useAppStore((s) => s.copyModalOpen);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);
  const setCopyModalOpen = useAppStore((s) => s.setCopyModalOpen);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  // Mutual exclusive: opening one closes the other
  const handleCopyModalOpen = useCallback(
    (open: boolean) => {
      setCopyModalOpen(open);
      if (open) setAboutModalOpen(false);
    },
    [setCopyModalOpen, setAboutModalOpen]
  );

  const handleAboutModalOpen = useCallback(
    (open: boolean) => {
      setAboutModalOpen(open);
      if (open) setCopyModalOpen(false);
    },
    [setAboutModalOpen, setCopyModalOpen]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCopyModalOpen(false);
        handleAboutModalOpen(false);
      }
    },
    [handleCopyModalOpen, handleAboutModalOpen]
  );

  const handleEscapeKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCopyModalOpen(false);
        handleAboutModalOpen(false);
      }
    },
    [handleCopyModalOpen, handleAboutModalOpen]
  );

  // Handle Cmd+F / Ctrl+F to focus search input and clear search
  useEffect(() => {
    const handleSearchFocus = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchQuery('');
        const searchInput = document.getElementById('symbols-search') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleSearchFocus);
    return () => document.removeEventListener('keydown', handleSearchFocus);
  }, [setSearchQuery]);

  return (
    <>
      <ProgressIndicator />

      <Header />

      <main style={{ flex: '1 1 auto', overflow: 'hidden' }}>
        <IconGrid />
      </main>

      <Drawer />

      <footer className="site-footer">
        SF Symbols Library by
        <a
          href="https://github.com/phranck"
          target="_blank"
          rel="noopener noreferrer"
        >
          phranck
        </a>
      </footer>

      {/* Modal overlay (mutual exclusive) */}
      <div
        className={`modal-overlay ${aboutModalOpen || copyModalOpen ? 'show' : ''}`}
        onClick={handleBackdropClick}
        onKeyDown={handleEscapeKey}
        role="presentation"
      >
        <AboutModal
          isOpen={aboutModalOpen}
          onClose={() => handleAboutModalOpen(false)}
        />
        <CopyModal
          isOpen={copyModalOpen}
          onClose={() => handleCopyModalOpen(false)}
          icon={selectedIcon}
        />
      </div>

      <Toast />
    </>
  );
}
