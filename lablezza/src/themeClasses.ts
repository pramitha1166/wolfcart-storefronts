/**
 * Maps theme layout flags to concrete class strings.
 *
 * Every branch is written as a complete literal class name so Tailwind's
 * scanner emits all of them — never build these by interpolation.
 */
import type {
  BadgeStyle,
  BtnStyle,
  HeaderStyle,
  InputStyle,
  ProductCardStyle,
} from "./theme";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

export function btnClasses(style: BtnStyle, variant: "primary" | "secondary" = "primary"): string {
  const shape =
    style === "pill-filled" || style === "pill-outline"
      ? "rounded-full"
      : "rounded-btn";

  const isOutline = style === "outline" || style === "pill-outline";

  if (variant === "secondary") {
    return cx(
      BTN_BASE,
      shape,
      "border border-line bg-surface text-body hover:bg-primary hover:text-primary-fg hover:border-primary",
    );
  }

  return cx(
    BTN_BASE,
    shape,
    isOutline
      ? "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg"
      : "bg-primary text-primary-fg hover:opacity-90",
  );
}

export function cardClasses(style: ProductCardStyle): string {
  const base = "group relative overflow-hidden bg-surface transition-all duration-300 rounded-card";

  switch (style) {
    case "bordered":
      return cx(base, "border border-line hover:border-primary");
    case "shadow":
      return cx(base, "shadow-sm hover:shadow-xl hover:-translate-y-1");
    case "overlay-hover":
      return cx(base, "border border-transparent hover:shadow-lg");
    case "minimal":
    default:
      return cx(base, "border border-transparent");
  }
}

export function inputClasses(style: InputStyle): string {
  const base =
    "w-full text-body placeholder:text-muted outline-none transition-colors duration-200 bg-transparent";

  switch (style) {
    case "underline":
      return cx(base, "border-0 border-b border-line px-0 py-2 focus:border-primary");
    case "filled":
      return cx(base, "border border-transparent bg-black/5 px-3 py-2 rounded-md focus:border-primary");
    case "outline":
    default:
      return cx(base, "border border-line px-3 py-2 rounded-md focus:border-primary");
  }
}

export function badgeClasses(style: BadgeStyle): string {
  const base = "inline-flex items-center px-2 py-0.5 text-xs font-medium";

  switch (style) {
    case "square":
      return cx(base, "rounded-none");
    case "pill":
      return cx(base, "rounded-full");
    case "rounded":
    default:
      return cx(base, "rounded-sm");
  }
}

/**
 * `transparent-hero` headers overlay the hero image, so the page must not
 * reserve space for them — App handles that via `headerOverlaps`.
 */
export function headerClasses(style: HeaderStyle): string {
  const base = "z-40 w-full transition-colors duration-300";

  switch (style) {
    case "static":
      return cx(base, "relative border-b border-line bg-surface");
    case "transparent-hero":
      return cx(base, "absolute top-0 left-0 border-b border-white/10 bg-transparent");
    case "sticky":
    default:
      return cx(base, "sticky top-0 border-b border-line bg-surface/85 backdrop-blur-md");
  }
}

export function headerOverlaps(style: HeaderStyle): boolean {
  return style === "transparent-hero";
}
