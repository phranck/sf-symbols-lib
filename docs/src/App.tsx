/**
 * Top-level application layout.
 *
 * Wires up the theme side-effect hook and renders the main structure:
 * Header, icon grid (main content), preview card, footer, and modals.
 */
import { useCallback, useEffect, useRef } from 'react';

import { Header } from '@/components/Header';
import { IconGrid } from '@/components/IconGrid';
import { AboutModal } from '@/components/Modals/AboutModal';
import { CopyModal } from '@/components/Modals/CopyModal';
import { PreviewCard } from '@/components/PreviewCard';
import { Toast } from '@/components/Toast/Toast';
import { useHeaderPadding } from '@/hooks/useHeaderPadding';
import { useTheme } from '@/hooks/useTheme';
import { ensureModeLoaded } from '@/lib/icons';
import { useAppStore } from '@/state/store';

export function App() {
  useTheme();

  const renderMode = useAppStore((s) => s.renderMode);

  // Ensure the active render mode's icons are loaded (on mount + mode switch).
  useEffect(() => {
    ensureModeLoaded(renderMode);
  }, [renderMode]);

  const aboutModalOpen = useAppStore((s) => s.aboutModalOpen);
  const copyModalOpen = useAppStore((s) => s.copyModalOpen);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const closeAllModals = useAppStore((s) => s.closeAllModals);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeAllModals();
      }
    },
    [closeAllModals],
  );

  // Close modals on Escape (document-level so it works regardless of focus)
  useEffect(() => {
    if (!aboutModalOpen && !copyModalOpen) return;
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [aboutModalOpen, copyModalOpen, closeAllModals]);

  // Measure header height so main content starts below the fixed header.
  const mainRef = useRef<HTMLElement>(null);
  useHeaderPadding(mainRef, '.frosted-header');

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
      <Header />

      <main ref={mainRef}>
        <IconGrid />
      </main>

      <PreviewCard />

      <footer className="site-footer">
        <div className="footer-content">
          <span>Made with ❤️ in Bregenz</span>
          <span>at Lake Constance</span>
          <span>Austria</span>
        </div>
      </footer>

      {/* Modal overlay (mutual exclusive) */}
      <div
        className={`modal-overlay ${aboutModalOpen || copyModalOpen ? 'show' : ''}`}
        onClick={handleBackdropClick}
        role="presentation"
      >
        <AboutModal
          isOpen={aboutModalOpen}
          onClose={closeAllModals}
        />
        <CopyModal
          isOpen={copyModalOpen}
          onClose={closeAllModals}
          icon={selectedIcon}
        />
      </div>

      <Toast />
    </>
  );
}
