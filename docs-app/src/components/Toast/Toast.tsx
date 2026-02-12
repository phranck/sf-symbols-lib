import { useEffect } from 'react';
import { useAppStore } from '@/state/store';

/**
 * Toast notification component.
 *
 * Displays a temporary message from the store that auto-dismisses after 2.5 seconds.
 * No manual close button; component removes itself automatically.
 */
export function Toast() {
  const toastMessage = useAppStore((s) => s.toastMessage);
  const setToastMessage = useAppStore((s) => s.setToastMessage);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  return (
    <div className={`sf-toast ${toastMessage ? 'show' : ''}`}>
      {toastMessage}
    </div>
  );
}
