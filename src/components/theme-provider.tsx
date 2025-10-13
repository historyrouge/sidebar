
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ACCENT_COLOR_KEY = 'accent-color';

const grayAccent: Record<string, string> = {
    light: '0 0% 50%',
    dark: '0 0% 80%',
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        <AccentColorUpdater />
        {children}
    </NextThemesProvider>
  )
}

function AccentColorUpdater() {
  const { resolvedTheme } = useNextTheme();
  
  React.useEffect(() => {
    const root = document.documentElement;
    const mode = resolvedTheme === 'dark' ? 'dark' : 'light';
    const color = grayAccent[mode];
    root.style.setProperty('--primary', color);
  }, [resolvedTheme]);

  return null;
}

// Re-export useTheme to be a simple wrapper around next-themes' hook
export const useTheme = () => {
    const nextThemesContext = useNextTheme();
    return { ...nextThemesContext };
};
