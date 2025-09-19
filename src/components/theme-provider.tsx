
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ACCENT_COLOR_KEY = 'accent-color';

const accentColors: Record<string, Record<string, string>> = {
  default: {
    light: '221 83% 53%',
    dark: '217 91% 65%',
  },
  rose: {
    light: '347 77% 50%',
    dark: '347 87% 60%',
  },
  orange: {
    light: '25 95% 53%',
    dark: '25 95% 58%',
  },
  green: {
    light: '142 71% 40%',
    dark: '142 71% 50%',
  },
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { defaultAccent?: string }) {
  const [accentColor, setAccentColor] = React.useState('default');

  React.useEffect(() => {
    const storedAccent = localStorage.getItem(ACCENT_COLOR_KEY);
    if (storedAccent && accentColors[storedAccent]) {
      setAccentColor(storedAccent);
    }
  }, []);

  const value = {
    ...props,
    accentColor: accentColor,
    setAccentColor: (color: string) => {
      if (accentColors[color]) {
        setAccentColor(color);
      }
    },
  };

  return (
    <NextThemesProvider {...props}>
      <ThemeContext.Provider value={value}>
        <AccentColorUpdater accentColor={accentColor} />
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

function AccentColorUpdater({ accentColor }: { accentColor: string }) {
  const { resolvedTheme } = useNextTheme();
  
  React.useEffect(() => {
    const root = document.documentElement;
    const mode = resolvedTheme === 'dark' ? 'dark' : 'light';
    const color = accentColors[accentColor]?.[mode] || accentColors.default[mode];
    root.style.setProperty('--primary', color);
    localStorage.setItem(ACCENT_COLOR_KEY, accentColor);
  }, [accentColor, resolvedTheme]);

  return null;
}


// Custom context to pass down accent color functions
const ThemeContext = React.createContext<{
  accentColor?: string;
  setAccentColor?: (color: string) => void;
} | undefined>(undefined);

// Custom hook to use the extended theme context
export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    const nextThemesContext = useNextTheme();
    if (context === undefined) {
        // Fallback for when not inside our custom provider
        return { ...nextThemesContext, accentColor: 'default', setAccentColor: () => {} };
    }
    return { ...nextThemesContext, ...context };
};
