
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ACCENT_COLOR_KEY = 'accent-color';

const navyBlueAccent: Record<string, string> = {
    light: '220 40% 40%', // A pleasant navy blue for light mode
    dark: '210 90% 55%',  // A vibrant navy blue for dark mode
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
    const color = navyBlueAccent[mode];
    root.style.setProperty('--primary', color);
  }, [resolvedTheme]);

  return null;
}

// Re-export useTheme to be a simple wrapper around next-themes' hook
export const useTheme = () => {
    const nextThemesContext = useNextTheme();
    return { ...nextThemesContext };
};
