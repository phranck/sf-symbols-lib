/**
 * Top-level application layout.
 *
 * Wires up the theme side-effect hook and renders the main structure:
 * Header, icon grid (main content), drawer, footer, and modals.
 */
import { useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/state/store';
import { Header } from '@/components/Header';
import { IconGrid } from '@/components/IconGrid';
import { Drawer } from '@/components/Drawer';
import { CopyModal } from '@/components/Modals/CopyModal';
import { AboutModal } from '@/components/Modals/AboutModal';
import { Toast } from '@/components/Toast/Toast';

export function App() {
  useTheme();

  const aboutModalOpen = useAppStore((s) => s.aboutModalOpen);
  const copyModalOpen = useAppStore((s) => s.copyModalOpen);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);
  const setCopyModalOpen = useAppStore((s) => s.setCopyModalOpen);

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

  return (
    <>
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
