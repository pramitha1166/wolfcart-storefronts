/**
 * Runtime theming.
 *
 * The storefront ships as ONE build. The merchant's chosen theme arrives at
 * runtime inside `window.__WC_CONFIG__.theme`, injected into /config.js by the
 * platform provisioner at sync time. Switching a theme therefore rewrites a
 * single ~2KB file in R2 — the bundle itself never changes.
 *
 * Keep this contract in sync with `toStorefrontTheme()` in @wolfcart/themes.
 */

export type HeaderStyle = "sticky" | "static" | "transparent-hero";
export type NavStyle = "simple" | "mega-menu";
export type BtnStyle = "filled" | "outline" | "pill-filled" | "pill-outline";
export type ProductCardStyle = "minimal" | "bordered" | "shadow" | "overlay-hover";
export type BadgeStyle = "rounded" | "square" | "pill";
export type InputStyle = "outline" | "underline" | "filled";

export interface ThemeLayout {
  headerStyle: HeaderStyle;
  navStyle: NavStyle;
  btnStyle: BtnStyle;
  productCardStyle: ProductCardStyle;
  badgeStyle: BadgeStyle;
  inputStyle: InputStyle;
}

export interface StorefrontTheme {
  id: string;
  name: string;
  /** CSS custom properties, already prefixed (`--wc-primary`, …). */
  vars: Record<string, string>;
  layout: ThemeLayout;
  /** Google Font families to load, e.g. ["Cormorant Garamond:500,600", "DM Sans:300,400"]. */
  fonts: string[];
}

/**
 * Fallback theme — matches the look the template had before theming existed.
 * Used in local dev and if a storefront is served with a stale config.js that
 * predates the theme payload.
 */
export const DEFAULT_THEME: StorefrontTheme = {
  id: "possystem-default",
  name: "POS Systems",
  vars: {
    "--wc-bg": "#F8FAFC",
    "--wc-surface": "#FFFFFF",
    "--wc-border": "#E2E8F0",
    "--wc-primary": "#1D4ED8",
    "--wc-primary-fg": "#FFFFFF",
    "--wc-accent": "#F59E0B",
    "--wc-accent-fg": "#0F172A",
    "--wc-text": "#334155",
    "--wc-muted": "#64748B",
    "--wc-heading": "#0F172A",
    "--wc-font-heading": "'Space Grotesk', sans-serif",
    "--wc-font-body": "'Inter', ui-sans-serif, system-ui, sans-serif",
    "--wc-weight-heading": "700",
    "--wc-weight-body": "400",
    "--wc-size-base": "16px",
    "--wc-ls-heading": "-0.01em",
    "--wc-lh-body": "1.6",
    "--wc-radius-sm": "4px",
    "--wc-radius-md": "8px",
    "--wc-radius-lg": "14px",
    "--wc-radius-btn": "8px",
    "--wc-radius-card": "10px",
    "--wc-container": "80rem",
    "--wc-section-gap": "72px",
  },
  layout: {
    headerStyle: "sticky",
    navStyle: "simple",
    btnStyle: "filled",
    productCardStyle: "bordered",
    badgeStyle: "square",
    inputStyle: "outline",
  },
  fonts: ["Space Grotesk:500,600,700", "Inter:300,400,500,600"],
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Reads the injected theme and merges it over the default, so a partial or
 * malformed payload can never leave the store unstyled.
 */
export function resolveTheme(): StorefrontTheme {
  const injected =
    typeof window !== "undefined" ? window.__WC_CONFIG__?.theme : undefined;

  if (!isRecord(injected)) return DEFAULT_THEME;

  const vars = isRecord(injected.vars)
    ? Object.fromEntries(
        Object.entries(injected.vars)
          // Only accept our own namespace — never let config.js set arbitrary properties.
          .filter(([k, v]) => k.startsWith("--wc-") && typeof v === "string")
          .map(([k, v]) => [k, v as string]),
      )
    : {};

  const layout = isRecord(injected.layout) ? injected.layout : {};

  return {
    id: typeof injected.id === "string" ? injected.id : DEFAULT_THEME.id,
    name: typeof injected.name === "string" ? injected.name : DEFAULT_THEME.name,
    vars: { ...DEFAULT_THEME.vars, ...vars },
    layout: { ...DEFAULT_THEME.layout, ...(layout as Partial<ThemeLayout>) },
    fonts: Array.isArray(injected.fonts)
      ? (injected.fonts.filter((f) => typeof f === "string") as string[])
      : DEFAULT_THEME.fonts,
  };
}

/** Writes the theme's custom properties onto <html>. */
export function applyThemeVars(theme: StorefrontTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.wcTheme = theme.id;
}

/**
 * Loads the theme's fonts from Google Fonts.
 *
 * Font files are the one asset a token swap cannot cover, so they are fetched
 * at runtime rather than bundled — otherwise every theme's faces would ship to
 * every store.
 */
export function loadThemeFonts(theme: StorefrontTheme): void {
  if (typeof document === "undefined" || theme.fonts.length === 0) return;

  const families = theme.fonts
    .map((entry) => {
      const [family, weights] = entry.split(":");
      const name = family.trim().replace(/\s+/g, "+");
      return weights
        ? `family=${name}:wght@${weights.split(",").map((w) => w.trim()).join(";")}`
        : `family=${name}`;
    })
    .join("&");

  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

  const existing = document.querySelector<HTMLLinkElement>("link[data-wc-fonts]");
  if (existing?.href === href) return;
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.wcFonts = "";
  document.head.appendChild(link);
}

/**
 * Applies vars + fonts before React paints. Called from main.tsx so the store
 * never renders a frame in the wrong palette.
 */
export function initTheme(): StorefrontTheme {
  const theme = resolveTheme();
  applyThemeVars(theme);
  loadThemeFonts(theme);
  return theme;
}
