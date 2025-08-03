import { createContext, useState, useContext, useEffect } from 'react';
import { createThemedFavicon, updateFavicon } from '../utils/faviconUtils';

export type ThemeName =
    'modern_ink' |
    'serika_dark' |
    'trackday' |
    'desert_oasis' |
    'lavender' |
    'ms_cupcakes' |
    'snes' |
    'dino' |
    'bento' |
    'eight_thousand_eight' |
    'nine_thousand_nine';

interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    bg: string;
    main: string;
    caret: string;
    sub: string;
    subAlt: string;
    text: string;
    error: string;
    errorExtra: string;
    colorfulError?: string; // Optional for themes that support colorful errors
    colorfulErrorExtra?: string; // Optional for themes that support colorful errors
  };
}

const themes: Record<ThemeName, Theme> = {
    modern_ink: {
        name: 'modern_ink',
        displayName: 'modern ink',
        colors: {
            bg: '#ffffff',
            main: '#ff360d',
            caret: '#ff0000',
            sub: '#b7b7b7',
            subAlt: '#ececec',
            text: '#000000',
            error: '#d70000',
            errorExtra: '#b00000',
            colorfulError: '#000000',
            colorfulErrorExtra: '#000000',
        }
    },
    serika_dark: {
        name: 'serika_dark',
        displayName: 'serika dark',
        colors: {
        bg: '#323437',
        main: '#e2b714',
        caret: '#e2b714',
        sub: '#646669',
        subAlt: '#2c2e31',
        text: '#d1d0c5',
        error: '#ca4754',
        errorExtra: '#7e2a33',
        }
    },
    trackday: {
        name: 'trackday',
        displayName: 'trackday',
        colors: {
        bg: '#464d66',
        main: '#e0513e',
        caret: '#475782',
        sub: '#5c7eb9',
        subAlt: '#3d4359',
        text: '#cfcfcf',
        error: '#e44e4e',
        errorExtra: '#fd3f3f',
        }
    },
    desert_oasis: {
        name: 'desert_oasis',
        displayName: 'desert oasis',
        colors: {
        bg: '#fff2d5',
        main: '#d19d01',
        caret: '#3a87fe',
        sub: '#0061fe',
        subAlt: '#eddebc',
        text: '#332800',
        error: '#76bb40',
        errorExtra: '#4e7a27',
        }
    },
    lavender: {
        name: 'lavender',
        displayName: 'lavender',
        colors: {
        bg: '#ada6c2',
        main: '#A6C2BB',
        caret: '#e4e3e9',
        sub: '#e4e3e9',
        subAlt: '#a19bb9',
        text: '#2f2a41',
        error: '#ca4754',
        errorExtra: '#7e2a33',
        }
    },
    ms_cupcakes: {
        name: 'ms_cupcakes',
        displayName: 'ms cupcakes',
        colors: {
        bg: '#ffffff',
        main: '#5ed5f3',
        caret: '#303030',
        sub: '#d64090',
        subAlt: '#edf8fa',
        text: '#0a282f',
        error: '#a4dd32',
        errorExtra: '#90bd34',
        }
    },
    snes: {
        name: 'snes',
        displayName: 'snes',
        colors: {
        bg: '#bfbec2',
        main: '#553d94',
        caret: '#523793',
        sub: '#9f8ad4',
        subAlt: '#b5b0c2',
        text: '#2e2e2e',
        error: '#ca4754',
        errorExtra: '#7e2a33',
        }
    },
    dino: {
        name: 'dino',
        displayName: 'dino',
        colors: {
            bg: "#ffffff",
            main: "#40d672",
            caret: "#40d672",
            sub: "#d5d5d5",
            subAlt: "#cafad8",
            text: "#1d221f",
            error: "#ff5f5f",
            errorExtra: "#d22a2a",
            colorfulError: "#ff5f5f",
            colorfulErrorExtra: "#d22a2a",
        }
    },
    bento: {
        name: 'bento',
        displayName: 'bento',
        colors: {
            bg: '#2d394d',
            main: '#ff7a90',
            caret: '#ff7a90',
            sub: '#4a768d',
            subAlt: '#263041',
            text: '#fffaf8',
            error: '#ee2a3a',
            errorExtra: '#f04040',
            colorfulError: '#fc2032',
            colorfulErrorExtra: '#f04040',
        }
    },
    eight_thousand_eight:{
        name: 'eight_thousand_eight',
        displayName: '8008',
        colors: {
            bg: '#333a45',
            main: '#f44c7f',
            caret: '#f44c7f',
            sub: '#939eae',
            subAlt: '#2e343d',
            text: '#e9ecf0',
            error: '#da3333',
            errorExtra: '#791717',
            colorfulError: '#c5da33',
            colorfulErrorExtra: '#849224',
        }
    },
    nine_thousand_nine: {
        name: 'nine_thousand_nine',
        displayName: '9009',
        colors: {
            bg: '#eeebe2',
            main: '#080909',
            caret: '#7fa480',
            sub: '#99947f',
            subAlt: '#d3cfc1',
            text: '#080909',
            error: '#c87e74',
            errorExtra: '#a56961',
            colorfulError: '#c87e74',
            colorfulErrorExtra: '#a56961',
        }
    }
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('kmig_theme') as ThemeName;
    return saved && themes[saved] ? saved : 'lavender';
  });

  const setTheme = (themeName: ThemeName) => {
    setCurrentThemeName(themeName);
    localStorage.setItem('kmig_theme', themeName);
  };

  // Apply theme to CSS variables and favicon
  useEffect(() => {
    const theme = themes[currentThemeName];
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--color-bg', theme.colors.bg);
    root.style.setProperty('--color-main', theme.colors.main);
    root.style.setProperty('--color-caret', theme.colors.caret);
    root.style.setProperty('--color-sub', theme.colors.sub);
    root.style.setProperty('--color-sub-alt', theme.colors.subAlt);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-error-extra', theme.colors.errorExtra);
    root.style.setProperty('--color-glow', theme.colors.main);

    // Set body background
    document.body.style.backgroundColor = theme.colors.bg;

    // Update favicon with theme colors
    const faviconUrl = createThemedFavicon(
      theme.colors.bg,
      theme.colors.main,
      theme.colors.text
    );
    updateFavicon(faviconUrl);
  }, [currentThemeName]);

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[currentThemeName],
      setTheme,
      availableThemes: Object.values(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
