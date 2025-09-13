
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ACCENT_COLOR_KEY = 'accent-color';

const accentColors: Record<string, Record<string, string>> = {
  default: {
    light: '217 91% 60%',
    dark: '217 91% 65%',
  },
  rose: {
    light: '347 77% 55%',
    dark: '347 87% 60%',
  },
  orange: {
    light: '25 95% 53%',
    dark: '25 95% 58%',
  },
  green: {
    light: '142 71% 45%',
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

  React.useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    const color = accentColors[accentColor]?.[currentTheme] || accentColors.default[currentTheme];
    root.style.setProperty('--primary', color);
    localStorage.setItem(ACCENT_COLOR_KEY, accentColor);
  }, [accentColor, props.theme, props.systemTheme]);

  const extendedSetTheme = (theme: string) => {
    if (props.setTheme) {
      props.setTheme(theme);
    }
  };

  const value = {
    ...props,
    setTheme: extendedSetTheme,
    accentColor: accentColor,
    setAccentColor: (color: string) => {
      if (accentColors[color]) {
        setAccentColor(color);
      }
    },
  };

  return <NextThemesProvider {...props}><ThemeContext.Provider value={value}>{children}</ThemeContext.Provider></NextThemesProvider>
}


// Custom context to pass down accent color functions
const ThemeContext = React.createContext<{
  accentColor?: string;
  setAccentColor?: (color: string) => void;
} | undefined>(undefined);

// Custom hook to use the extended theme context
export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    const nextThemesContext = (NextThemesProvider as any).useTheme();
    if (context === undefined) {
        // Fallback for when not inside our custom provider
        return { ...nextThemesContext, accentColor: 'default', setAccentColor: () => {} };
    }
    return { ...nextThemesContext, ...context };
};

    