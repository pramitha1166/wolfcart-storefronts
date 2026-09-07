import React, { createContext, useContext } from "react";
import { DEFAULT_THEME, type StorefrontTheme, type ThemeLayout } from "./theme";

const ThemeContext = createContext<StorefrontTheme>(DEFAULT_THEME);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: StorefrontTheme;
  children: React.ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Full theme (id, vars, layout, fonts). */
export function useTheme(): StorefrontTheme {
  return useContext(ThemeContext);
}

/** Layout flags only — the common case in components. */
export function useLayout(): ThemeLayout {
  return useContext(ThemeContext).layout;
}
