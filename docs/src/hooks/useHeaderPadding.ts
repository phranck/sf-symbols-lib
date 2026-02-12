/**
 * Hook that measures the fixed header height via ResizeObserver
 * and applies matching padding-top to the main content element.
 *
 * Extracted from App.tsx to reduce component complexity.
 */
import { useEffect, type RefObject } from 'react';

export function useHeaderPadding(
  mainRef: RefObject<HTMLElement | null>,
  headerSelector: string,
): void {
  useEffect(() => {
    const header = document.querySelector(headerSelector);
    if (!header) return;

    const updatePadding = () => {
      const height = header.getBoundingClientRect().height;
      if (mainRef.current) {
        mainRef.current.style.paddingTop = `${height}px`;
      }
    };

    const observer = new ResizeObserver(updatePadding);
    observer.observe(header);
    updatePadding();

    return () => observer.disconnect();
  }, [mainRef, headerSelector]);
}
