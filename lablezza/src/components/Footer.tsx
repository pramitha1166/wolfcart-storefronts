import React from "react";
import { HelpCircle, MapPin, Share2 } from "lucide-react";
import { Store } from "../types";

interface FooterProps {
  storeInfo: Store | null;
  onNavigate: (view: "home" | "products") => void;
  onPolicyClick: (type: "about" | "privacy" | "terms") => void;
  onLinkClick: (label: string, href: string) => boolean;
}

export default function Footer({
  storeInfo,
  onNavigate,
  onPolicyClick,
  onLinkClick,
}: FooterProps) {
  const storeName = storeInfo?.name || "Store";

  const addresses: string[] = storeInfo?.storeAddresses?.length
    ? storeInfo.storeAddresses
    : storeInfo?.storeAddress
      ? [storeInfo.storeAddress]
      : [];

  const hasContact = !!storeInfo?.storeEmail || addresses.length > 0;

  // Standard system pages — always shown, always clickable
  const policyNavLinks: Array<{ label: string; action: () => void }> = [
    { label: "About Us",           action: () => onPolicyClick("about")   },
    { label: "Terms & Conditions", action: () => onPolicyClick("terms")   },
    { label: "Privacy Policy",     action: () => onPolicyClick("privacy") },
  ];

  // Custom footer links added in dashboard footer tab
  const customNavLinks: Array<{ label: string; action: () => void }> = (storeInfo?.footerLinks ?? []).map(link => ({
    label: link.label,
    action: () => {
      const intercepted = onLinkClick(link.label, link.href);
      if (!intercepted) {
        if (link.href === "home" || link.href === "/") onNavigate("home");
        else if (link.href === "products" || link.href === "/products") onNavigate("products");
        else window.open(link.href, "_blank", "noopener,noreferrer");
      }
    },
  }));

  // Policy links always shown first, custom links appended after
  const navLinks = [...policyNavLinks, ...customNavLinks];

  const renderSocialIcon = (platform: string, url: string) => {
    if (!url) return null;
    const normalized = platform.toLowerCase();
    let icon = <Share2 size={14} />;

    if (normalized.includes("instagram")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    } else if (normalized.includes("facebook")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    } else if (normalized.includes("twitter") || normalized.includes("x")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    } else if (normalized.includes("youtube")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    } else if (normalized.includes("tiktok")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.96-1.74a6.22 6.22 0 01-1.01-.75v7.39c.05 1.54-.42 3.12-1.47 4.25a6.45 6.45 0 01-5.74 2.3 6.57 6.57 0 01-4.7-3.91 6.55 6.55 0 011.66-6.6 6.57 6.57 0 016.03-1.63V13a2.53 2.53 0 00-2.88 1.45 2.54 2.54 0 00.32 2.76 2.53 2.53 0 002.83.66c.86-.34 1.42-1.18 1.41-2.12V.02z" />
        </svg>
      );
    } else if (normalized.includes("whatsapp")) {
      icon = (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.117-2.884-6.978C16.59 1.9 14.113.873 11.48.871c-5.441 0-9.866 4.422-9.87 9.865-.001 1.748.46 3.453 1.336 4.968l-.985 3.597 3.686-.967zm12.385-7.464c-.266-.134-1.58-.78-1.823-.867-.243-.088-.419-.133-.596.134-.177.265-.685.866-.839 1.043-.155.177-.311.2-.577.067-.266-.134-1.127-.416-2.146-1.326-.792-.708-1.328-1.582-1.484-1.848-.155-.266-.016-.41.117-.542.12-.12.266-.31.4-.464.133-.156.177-.267.266-.443.089-.178.045-.333-.022-.467-.067-.133-.597-1.44-.817-1.97-.215-.52-.43-.448-.597-.456-.153-.008-.33-.008-.507-.008-.178 0-.467.067-.712.333-.243.266-.93.909-.93 2.219 0 1.31.952 2.573 1.085 2.75.133.177 1.874 2.862 4.542 4.013.635.273 1.13.436 1.517.559.638.203 1.22.175 1.679.107.513-.077 1.58-.646 1.8-1.27.22-.646.22-1.2.156-1.3-.064-.1-.24-.15-.506-.284z" />
        </svg>
      );
    }

    return (
      <a
        key={platform}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-muted hover:text-white hover:border-primary hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        aria-label={platform}
      >
        {icon}
      </a>
    );
  };

  const gridClass = hasContact
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 pb-12 border-b border-line"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 pb-12 border-b border-line";

  return (
    <footer className="bg-primary text-primary-fg pt-16 pb-8 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className={gridClass}>

          {/* Brand column */}
          <div className="space-y-4 sm:col-span-2">
            {storeInfo?.logoUrl || storeInfo?.logo ? (
              <img
                src={(storeInfo.logoUrl || storeInfo.logo)!}
                alt={storeName}
                className="h-10 max-w-[160px] object-contain brightness-0 invert"
              />
            ) : (
              <span className="font-display text-2xl font-black tracking-widest uppercase">
                {storeName}
              </span>
            )}

            {storeInfo?.description && (
              <p className="text-muted text-xs tracking-wide max-w-sm font-light leading-relaxed">
                {storeInfo.description}
              </p>
            )}

            {storeInfo?.socialLinks && Object.keys(storeInfo.socialLinks).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {Object.entries(storeInfo.socialLinks).map(([platform, url]) =>
                  renderSocialIcon(platform, url)
                )}
              </div>
            )}
          </div>

          {/* Navigation column — always visible */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase">
              Navigate
            </h4>
            <ul className="space-y-2 text-xs text-muted font-light">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          {hasContact && (
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase">
                Contact
              </h4>
              <ul className="space-y-2 text-xs text-muted font-light">
                {storeInfo?.storeEmail && (
                  <li className="flex items-start gap-1.5 text-muted">
                    <HelpCircle size={12} className="text-muted flex-shrink-0 mt-0.5" />
                    <a href={`mailto:${storeInfo.storeEmail}`} className="hover:text-white transition-colors break-all">
                      {storeInfo.storeEmail}
                    </a>
                  </li>
                )}
                {addresses.map((addr, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-muted text-[11px] leading-relaxed">
                    <MapPin size={11} className="flex-shrink-0 mt-0.5" />
                    <span>{addr}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4 text-muted font-mono text-[9px] uppercase tracking-widest">
          <span>© {new Date().getFullYear()} {storeName}. ALL RIGHTS RESERVED.</span>
          <span>Powered by WolfCart</span>
        </div>
      </div>
    </footer>
  );
}
