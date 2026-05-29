"use client";
/**
 * ThemeProvider — wraps the app with next-themes for dark/light mode support.
 * attribute="class" means next-themes toggles the "dark" class on <html>.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Thin wrapper around next-themes ThemeProvider */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}

