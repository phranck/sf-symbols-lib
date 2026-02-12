/**
 * Hook that handles arrow-key, Enter, and Escape keyboard navigation
 * for the icon grid.
 *
 * Extracted from IconGrid.tsx to reduce component complexity.
 */
import { useEffect, type RefObject } from 'react';

import { GRID_COLUMN_TOLERANCE_PX, PREVIEW_OPEN_DELAY_MS } from '@/constants';
import { useLatestRef } from '@/hooks/useLatestRef';
import { useScrollToCard } from '@/hooks/useScrollToCard';
import { analytics } from '@/lib/analytics';
import type { IconEntry } from '@/lib/icons';
import { useAppStore } from '@/state/store';

interface UseKeyboardNavigationOptions {
  gridRef: RefObject<HTMLDivElement | null>;
  icons: ReadonlyArray<IconEntry>;
}

/**
 * Count columns by measuring actual card positions in the DOM.
 * Counts how many cards share the same top offset as the first card.
 */
function getGridColumns(container: HTMLElement): number {
  const cards = container.querySelectorAll('.card');
  if (cards.length < 2) return 1;

  const firstTop = cards[0].getBoundingClientRect().top;
  let columns = 1;

  for (let i = 1; i < cards.length; i++) {
    const top = cards[i].getBoundingClientRect().top;
    if (Math.abs(top - firstTop) < GRID_COLUMN_TOLERANCE_PX) {
      columns++;
    } else {
      break;
    }
  }

  return columns;
}

/**
 * Find the card closest to the visible center of the viewport.
 * Accounts for the fixed header so the "center" is the center of
 * the actually visible grid area.
 */
function getCenteredCardIndex(container: HTMLElement): number {
  const cards = container.querySelectorAll('.card');
  if (cards.length === 0) return 0;

  const header = document.querySelector('.frosted-header');
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
  const visibleCenterY = (headerBottom + window.innerHeight) / 2;
  const visibleCenterX = window.innerWidth / 2;

  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const distance = Math.hypot(cardCenterX - visibleCenterX, cardCenterY - visibleCenterY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function useKeyboardNavigation({
  gridRef,
  icons,
}: UseKeyboardNavigationOptions): void {
  const focusedIndex = useAppStore((s) => s.focusedIndex);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const previewOpen = useAppStore((s) => s.previewOpen);
  const setFocusedIndex = useAppStore((s) => s.setFocusedIndex);
  const openPreview = useAppStore((s) => s.openPreview);
  const closePreview = useAppStore((s) => s.closePreview);

  const { scrollCardIntoSafeZone } = useScrollToCard();

  // Refs for stable keyboard handler
  const filteredIconsRef = useLatestRef(icons);
  const focusedIndexRef = useLatestRef(focusedIndex);
  const selectedIconRef = useLatestRef(selectedIcon);

  // Scroll focused card into view during keyboard navigation
  useEffect(() => {
    if (focusedIndex < 0 || !gridRef.current) return;
    const card = gridRef.current.querySelectorAll('.card')[focusedIndex] as HTMLElement | undefined;
    if (card) {
      scrollCardIntoSafeZone(card);
    }
  }, [focusedIndex, scrollCardIntoSafeZone, gridRef]);

  // When preview card opens, ensure the selected card is not hidden behind it
  useEffect(() => {
    if (!previewOpen || !gridRef.current) return;
    const timer = setTimeout(() => {
      const selectedCard = gridRef.current?.querySelector('.card.selected') as HTMLElement | null;
      if (selectedCard) {
        scrollCardIntoSafeZone(selectedCard);
      }
    }, PREVIEW_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [previewOpen, scrollCardIntoSafeZone, gridRef]);

  const aboutModalOpen = useAppStore((s) => s.aboutModalOpen);
  const copyModalOpen = useAppStore((s) => s.copyModalOpen);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Don't handle keys when a modal is open
      if (aboutModalOpen || copyModalOpen) return;

      const container = gridRef.current;
      if (!container) return;
      const currentIcons = filteredIconsRef.current;
      const count = currentIcons.length;
      if (count === 0) return;
      const currentFocused = focusedIndexRef.current;

      const setFocus = (getDelta: (from: number) => number) => {
        e.preventDefault();
        let from: number;
        if (currentFocused === -1) {
          const sel = selectedIconRef.current;
          const selIdx = sel ? currentIcons.findIndex((i) => i.pascalName === sel.pascalName) : -1;
          from = selIdx >= 0 ? selIdx : getCenteredCardIndex(container);
        } else {
          from = currentFocused;
        }
        const newIndex = getDelta(from);
        setFocusedIndex(Math.max(0, Math.min(count - 1, newIndex)));
      };

      switch (e.key) {
        case 'ArrowUp':
          setFocus((from) => from - getGridColumns(container));
          break;
        case 'ArrowDown':
          setFocus((from) => from + getGridColumns(container));
          break;
        case 'ArrowLeft':
          setFocus((from) => from - 1);
          break;
        case 'ArrowRight':
          setFocus((from) => from + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (currentFocused >= 0 && currentFocused < count) {
            const icon = currentIcons[currentFocused];
            analytics.trackIconSelect(icon.pascalName);
            openPreview(icon);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closePreview();
          break;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs from useLatestRef are stable
  }, [setFocusedIndex, openPreview, closePreview, gridRef, aboutModalOpen, copyModalOpen]);
}
