import React from 'react';

interface PressableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function PressableButton({ children, onClick, disabled, className, type = 'button' }: PressableButtonProps) {
  // Use a CSS-backed pressable style that uses box-shadow (no layout shift)
  const base = `pressable-button px-6 py-2 font-bold select-none inline-block`;
  const stateStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Use theme CSS variables for bg and text; the pressable-button class handles the visual offset via box-shadow
  const styleClass = `bg-[var(--color-main)] text-[var(--color-text)] ${base} ${stateStyles} ${className || ''}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styleClass}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
