import { SFXmarkCircleFill } from 'sf-symbols-lib/dualtone';

interface CloseButtonProps {
  onClick: () => void;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

/** Reusable close button using the SF Symbol xmark.circle.fill icon. */
export function CloseButton({
  onClick,
  size = 24,
  className = '',
  ariaLabel = 'Close',
}: CloseButtonProps) {
  return (
    <button
      className={`close-btn ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <SFXmarkCircleFill size={size} />
    </button>
  );
}
