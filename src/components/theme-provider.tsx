"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ACCENT_COLOR_KEY = 'accent-color';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        {children}
    </NextThemesProvider>
  )
}

// Re-export useTheme to be a simple wrapper around next-themes' hook
export const useTheme = () => {
    const nextThemesContext = useNextTheme();
    return { ...nextThemesContext };
};
