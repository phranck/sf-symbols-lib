/**
 * Shared hook for copy-to-clipboard with toast feedback and analytics tracking.
 *
 * Eliminates the duplicated clipboard + toast + analytics pattern found in
 * PreviewCardInfo, PreviewCardCode, and CopyModal.
 */
import { useCallback } from 'react';

import { analytics } from '@/lib/analytics';
import { useAppStore } from '@/state/store';

type CopyType = 'name' | 'appleName' | 'code';

interface CopyToClipboard {
  copy: (
    text: string,
    toastMessage: string,
    trackInfo?: { iconName: string; copyType: CopyType },
  ) => Promise<boolean>;
}

export function useCopyToClipboard(): CopyToClipboard {
  const setToastMessage = useAppStore((s) => s.setToastMessage);

  const copy = useCallback(
    async (
      text: string,
      toastMessage: string,
      trackInfo?: { iconName: string; copyType: CopyType },
    ): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        if (trackInfo) {
          analytics.trackIconCopy(trackInfo.iconName, trackInfo.copyType);
        }
        setToastMessage(toastMessage);
        return true;
      } catch {
        setToastMessage('Copy failed. Try again.');
        return false;
      }
    },
    [setToastMessage],
  );

  return { copy };
}
