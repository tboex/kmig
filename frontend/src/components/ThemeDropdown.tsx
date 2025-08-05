import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeDropdown() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ColorPalette = ({ theme }: { theme: any }) => (
    <div className="flex items-center space-x-1 bg-theme-bg px-2 py-2 rounded">
      <div
        className="w-3 h-3 rounded-full border border-opacity-30"
        style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.text }}
        title="Background"
      />
      <div
        className="w-3 h-3 rounded-full border border-opacity-30"
        style={{ backgroundColor: theme.colors.main, borderColor: theme.colors.text }}
        title="Main"
      />
      <div
        className="w-3 h-3 rounded-full border border-opacity-30"
        style={{ backgroundColor: theme.colors.text, borderColor: theme.colors.sub }}
        title="Text"
      />
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="themeButton flex flex-row items-center space-x-2 text-theme-sub hover:text-theme-text transition-colors"
      >
        <i className="fas fa-fw fa-palette"></i>
        <div>{currentTheme.displayName}</div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 py-2 rounded-lg shadow-lg border z-50 min-w-[200px]"
          style={{
            backgroundColor: 'var(--color-sub)',
            borderColor: 'var(--color-sub)',
          }}
        >
          {availableThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                setTheme(theme.name);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:opacity-80 transition-opacity flex items-center justify-between ${
                currentTheme.name === theme.name ? 'font-bold' : ''
              }`}
              style={{
                color: currentTheme.name === theme.name ? 'var(--color-main)' : 'var(--color-text)',
              }}
            >
              <div className="flex items-center space-x-3">
                <ColorPalette theme={theme} />
                <span>{theme.displayName}</span>
              </div>
              {currentTheme.name === theme.name && (
                <i className="fas fa-check text-xs"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
