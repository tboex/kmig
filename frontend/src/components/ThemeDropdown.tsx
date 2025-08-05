import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeDropdown() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
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
    <div className="flex items-center space-x-1 bg-theme-bg px-2 py-2 rounded"
        style={{ backgroundColor: theme.colors.bg }}
    >
        <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.main }}
            title="Main"
        />
        <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.sub }}
            title="Sub"
        />
        <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.text }}
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
          className="absolute bottom-full right-0 mb-2 py-2 rounded-lg shadow-lg border-4 z-50 min-w-[400px]"
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
                className={`w-full px-4 py-2 text-left transition-opacity flex items-center justify-between ${
                    currentTheme.name === theme.name ? 'font-bold' : ''
                }`}
                style={{
                    color: hoveredTheme === theme.name ? 'var(--color-text)' : 'var(--color-bg)',
                    backgroundColor: hoveredTheme === theme.name ? 'var(--color-sub-alt)' : 'var(--color-text)',
                }}
                onMouseEnter={() => setHoveredTheme(theme.name)}
                onMouseLeave={() => setHoveredTheme(null)}
            >
                <span>{theme.displayName}</span>
                <div className="flex items-center space-x-2">
                    <ColorPalette theme={theme} />
                </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
