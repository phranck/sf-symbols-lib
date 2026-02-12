import { useAppStore } from '@/state/store';

/**
 * Button to open the About modal.
 */
export function AboutButton() {
  const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);

  return (
    <button
      className="header-btn about-btn"
      onClick={() => setAboutModalOpen(true)}
      title="About SF Symbols"
      aria-label="About SF Symbols"
    >
      ℹ️
    </button>
  );
}
