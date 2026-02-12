/**
 * Custom hook for tracking user interactions with Umami Analytics.
 *
 * Requires Umami script tag in index.html for window.umami to be available.
 * Safe to call even if window.umami is not defined (no-op if missing).
 */
export function useAnalytics() {
  const isDev = process.env.NODE_ENV === 'development';

  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    const umami = (window as any).umami;
    if (!umami) {
      if (isDev) {
        console.warn('[Analytics] Umami not loaded yet');
      }
      return;
    }

    if (isDev) {
      console.log(`[Analytics] Event: ${eventName}`, eventData);
    }

    umami.trackEvent(eventName, eventData);
  };

  return {
    trackIconCopy: (iconName: string, copyType: 'name' | 'appleName' | 'code') => {
      trackEvent(`copy_${copyType}`, {
        icon: iconName,
        timestamp: new Date().toISOString()
      });
    },

    trackIconSelect: (iconName: string) => {
      trackEvent('icon_select', { icon: iconName });
    },

    trackSearch: (query: string, resultCount: number) => {
      trackEvent('search', {
        query,
        results: resultCount,
        timestamp: new Date().toISOString()
      });
    },

    trackRenderModeSwitch: (mode: 'dualtone' | 'monochrome') => {
      trackEvent('render_mode_change', { mode });
    },

    trackCategoryChange: (category: string) => {
      trackEvent('category_filter', { category });
    },

    trackThemeToggle: (theme: 'light' | 'dark') => {
      trackEvent('theme_toggle', { theme });
    },

    trackColorPickerChange: (color: string) => {
      trackEvent('color_change', { color });
    },
  };
}
