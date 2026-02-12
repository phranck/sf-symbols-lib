/**
 * Hook that provides smooth scroll-into-safe-zone logic for icon grid cards.
 *
 * Scrolls a card into the visible area between the fixed header and the
 * preview card, using an ease-out animation.
 */
import { useCallback } from 'react';

import { SCROLL_ANIMATION_MS, SCROLL_MARGIN_PX } from '@/constants';

interface UseScrollToCardResult {
  scrollCardIntoSafeZone: (card: HTMLElement) => void;
}

export function useScrollToCard(): UseScrollToCardResult {
  const scrollCardIntoSafeZone = useCallback((card: HTMLElement) => {
    const rect = card.getBoundingClientRect();
    const headerEl = document.querySelector('.frosted-header');
    const topBound = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
    const previewEl = document.querySelector('.preview-card-open');
    const bottomBound = previewEl
      ? previewEl.getBoundingClientRect().top
      : window.innerHeight;

    let delta = 0;
    if (rect.bottom > bottomBound - SCROLL_MARGIN_PX) {
      delta = rect.bottom - bottomBound + SCROLL_MARGIN_PX;
    } else if (rect.top < topBound + SCROLL_MARGIN_PX) {
      delta = rect.top - topBound - SCROLL_MARGIN_PX;
    }

    if (delta !== 0) {
      const start = window.scrollY;
      let t0: number | null = null;

      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const progress = Math.min((ts - t0) / SCROLL_ANIMATION_MS, 1);
        const easeOut = 1 - (1 - progress) * (1 - progress);
        window.scrollTo(0, start + delta * easeOut);
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }
  }, []);

  return { scrollCardIntoSafeZone };
}
