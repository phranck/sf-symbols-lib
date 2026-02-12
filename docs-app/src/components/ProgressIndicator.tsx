/**
 * Loading progress indicator shown during initial icon render.
 *
 * Displays a simple spinner that fades out when grid is ready.
 * Uses CSS animations for performance.
 */
import { useAppStore } from '@/state/store';

export function ProgressIndicator() {
  const isLoadingInitial = useAppStore((s) => s.isLoadingInitial);

  if (!isLoadingInitial) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-blue))',
        backgroundSize: '200% 100%',
        animation: 'loading-progress 2s ease-in-out infinite',
        opacity: 1,
        zIndex: 1200,
        transition: 'opacity 300ms ease-out',
      }}
      role="status"
      aria-label="Loading icons"
    />
  );
}
