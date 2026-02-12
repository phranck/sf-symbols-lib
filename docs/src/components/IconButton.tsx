import type { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  title: string;
  className?: string;
}

export function IconButton({
  icon,
  size = 'md',
  onClick,
  title,
  className,
}: IconButtonProps) {
  return (
    <button
      className={`icon-btn icon-btn-${size}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}
