import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/state/store';
import { DrawerPreview } from './DrawerPreview';
import { DrawerInfo } from './DrawerInfo';
import { DrawerCode } from './DrawerCode';

/**
 * Bottom drawer container (Phase 4).
 *
 * Displays selected icon in 3-column layout: preview (left), info (middle), code (right).
 * Responsive: stacks vertically on < 900px.
 *
 * - Manages drawer-open class on <body> for padding/scroll handling
 * - Keyboard support: Escape to close
 * - Click-outside to close
 */
export function Drawer() {
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const renderMode = useAppStore((s) => s.renderMode);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const closeDrawer = useAppStore((s) => s.closeDrawer);
  const setCopyModalOpen = useAppStore((s) => s.setCopyModalOpen);

  // Sync drawer-open class to <body> for padding/scroll handling
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }

    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [drawerOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop itself, not content
      if (e.target === e.currentTarget) {
        closeDrawer();
      }
    },
    [closeDrawer]
  );

  const handleOpenCopyModal = useCallback(() => {
    setCopyModalOpen(true);
  }, [setCopyModalOpen]);

  if (!drawerOpen || !selectedIcon) {
    return null;
  }

  // Get the correct icon component based on render mode
  const Icon =
    renderMode === 'dualtone'
      ? selectedIcon.DualtoneIcon
      : selectedIcon.MonochromeIcon;

  return (
    <div className="bottom-drawer" onClick={handleBackdropClick}>
      <div className="drawer-content">
        {/* Drawer header with title and copy options button */}
        <div className="drawer-header">
          <h3 className="drawer-title">{selectedIcon.name}</h3>
          <button
            className="drawer-header-btn"
            onClick={handleOpenCopyModal}
            title="Copy options"
            aria-label="Copy options"
          >
            📋
          </button>
        </div>

        <div className="drawer-selected">
          <DrawerPreview icon={selectedIcon} Icon={Icon} />
          <DrawerInfo icon={selectedIcon} />
          <DrawerCode
            pascalName={selectedIcon.pascalName}
            packagePath={
              renderMode === 'dualtone'
                ? 'sf-symbols-lib/dualtone'
                : 'sf-symbols-lib/monochrome'
            }
          />
        </div>
      </div>
    </div>
  );
}
