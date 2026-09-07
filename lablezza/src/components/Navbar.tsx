import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { Store, Cart, Collection } from "../types";
import React, { useState } from "react";
import { useLayout } from "../ThemeProvider";
import { cx, headerClasses, inputClasses } from "../themeClasses";

interface NavbarProps {
  storeInfo: Store | null;
  collections: Collection[];
  activeCollection: string | null;
  cart: Cart | null;
  currentView: string;
  setView: (view: "home" | "products" | "pdp" | "checkout" | "order-success") => void;
  setSelectedProductSlug: (slug: string | null) => void;
  setActiveCollection: (slug: string | null) => void;
  setIsCartOpen: (open: boolean) => void;
  onSearch: (query: string) => void;
}

export default function Navbar({
  storeInfo,
  collections,
  activeCollection,
  cart,
  currentView,
  setView,
  setSelectedProductSlug,
  setActiveCollection,
  setIsCartOpen,
  onSearch,
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    setView("products");
    setIsSearchOpen(false);
  };

  const navigateToHome = () => {
    setView("home");
    setSelectedProductSlug(null);
    setIsMobileMenuOpen(false);
  };

  const navigateToProducts = (collectionSlug: string | null = null) => {
    setActiveCollection(collectionSlug);
    setView("products");
    setSelectedProductSlug(null);
    setIsMobileMenuOpen(false);
  };

  const { headerStyle, inputStyle } = useLayout();

  const cartItemCount = cart?.itemCount ?? 0;

  return (
    <header className={headerClasses(headerStyle)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Icon */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 sm:hidden text-body hover:text-muted focus:outline-none"
          aria-label="Toggle mobile menu"
          id="toggle-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Branding Navigation Left */}
        <div className="hidden sm:flex items-center space-x-6">
          <button
            onClick={navigateToHome}
            className={`text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
              currentView === "home" ? "font-bold text-heading" : "font-normal text-muted hover:text-heading"
            }`}
            id="nav-home"
          >
            Home
          </button>
          {storeInfo?.navMode === "collections" ? (
            collections && collections.filter(c => c.slug !== "all" && c.slug !== "new").slice(0, 6).map((col) => (
              <button
                key={col.id}
                onClick={() => navigateToProducts(col.slug)}
                className={`text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                  activeCollection === col.slug ? "font-bold text-heading" : "font-normal text-muted hover:text-heading"
                }`}
              >
                {col.name}
              </button>
            ))
          ) : storeInfo?.navMode === "categories" ? (
            <>
              <button
                onClick={() => navigateToProducts(null)}
                className={`text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                  currentView === "products" && !activeCollection ? "font-bold text-heading" : "font-normal text-muted hover:text-heading"
                }`}
                id="nav-all"
              >
                Shop All
              </button>
              {collections && collections.filter(c => c.slug !== "all" && c.slug !== "new").slice(0, 5).map((col) => {
                const hasChildren = col.children && col.children.length > 0;
                return (
                  <div key={col.id} className="relative group py-2">
                    <button
                      onClick={() => navigateToProducts(col.slug)}
                      className={`text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer flex items-center gap-1 ${
                        currentView === "products" && (activeCollection === col.slug || col.children?.some(child => activeCollection === child.slug))
                          ? "font-bold text-heading"
                          : "font-normal text-muted hover:text-heading"
                      }`}
                    >
                      {col.name}
                      {hasChildren && <span className="text-[8px] text-muted group-hover:rotate-180 transition-transform duration-200">▼</span>}
                    </button>

                    {hasChildren && (
                      <div className="absolute left-0 mt-2 hidden group-hover:block w-40 bg-surface border border-line shadow-xl rounded-md py-2 z-50 animate-fade-in font-mono">
                        <button
                          onClick={() => navigateToProducts(col.slug)}
                          className="block w-full text-left px-4 py-2 text-[10px] text-muted hover:text-heading hover:bg-black/5 uppercase font-semibold cursor-pointer"
                        >
                          All {col.name}
                        </button>
                        <div className="h-[1px] bg-line my-1" />
                        {col.children.map((child: any) => (
                          <button
                            key={child.id}
                            onClick={() => navigateToProducts(child.slug)}
                            className={`block w-full text-left px-4 py-2 text-[11px] uppercase transition-colors hover:bg-black/5 cursor-pointer ${
                              activeCollection === child.slug ? "text-heading font-bold" : "text-muted hover:text-heading"
                            }`}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <button
              onClick={() => navigateToProducts(null)}
              className={`text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                currentView === "products" && !activeCollection ? "font-bold text-heading" : "font-normal text-muted hover:text-heading"
              }`}
              id="nav-all"
            >
              Shop All
            </button>
          )}
        </div>

        {/* Dynamic Center Branding */}
        <div className="flex-1 flex justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2 cursor-pointer select-none"
            id="logo-brand"
          >
            {storeInfo?.logo ? (
              <img
                src={storeInfo.logo}
                alt={storeInfo.name}
                className="h-8 w-auto object-contain max-w-[150px]"
              />
            ) : (
              <span className="font-display text-xl tracking-widest text-heading uppercase truncate max-w-[150px] sm:max-w-xs md:max-w-md inline-block">
                {storeInfo?.name || "LABLEZZA"}
              </span>
            )}
          </button>
        </div>

        {/* Icons Right */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center border border-line rounded-md px-2 py-1 bg-surface">
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className={cx(inputClasses(inputStyle), "text-xs w-32 sm:w-48 border-none px-0 py-0")}
                autoFocus
                id="search-input"
              />
              <button type="submit" className="p-1 text-muted hover:text-body cursor-pointer">
                <Search size={14} />
              </button>
              <button
                type="button"
                className="p-1 text-muted hover:text-body ml-1 text-xs font-semibold cursor-pointer"
                onClick={() => setIsSearchOpen(false)}
                id="search-close"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-body hover:text-muted transition-colors focus:outline-none cursor-pointer"
              aria-label="Search"
              id="search-toggle"
            >
              <Search size={19} />
            </button>
          )}

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center p-2 text-body hover:text-muted transition-colors focus:outline-none cursor-pointer"
            id="cart-bag-btn"
          >
            <ShoppingBag size={19} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-fg ring-2 ring-[var(--wc-surface)]">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-line bg-surface py-3 px-4 space-y-3 shadow-inner fade-in">
          <button
            onClick={navigateToHome}
            className="block w-full text-left text-xs font-mono uppercase tracking-wider py-2 text-body border-b border-line"
            id="mobile-nav-home"
          >
            Home
          </button>
          {storeInfo?.navMode === "collections" ? (
            collections && collections.filter(c => c.slug !== "all" && c.slug !== "new").map((col) => (
              <button
                key={col.id}
                onClick={() => navigateToProducts(col.slug)}
                className={`block w-full text-left text-xs font-mono uppercase tracking-wider py-2 border-b border-line ${
                  activeCollection === col.slug ? "text-heading font-bold" : "text-muted"
                }`}
              >
                {col.name}
              </button>
            ))
          ) : storeInfo?.navMode === "categories" ? (
            <>
              <button
                onClick={() => navigateToProducts(null)}
                className="block w-full text-left text-xs font-mono uppercase tracking-wider py-2 text-body border-b border-line toggle-filter"
                id="mobile-nav-collections"
              >
                Shop All
              </button>
              {collections && collections.filter(c => c.slug !== "all" && c.slug !== "new").map((col) => {
                const hasChildren = col.children && col.children.length > 0;
                return (
                  <div key={col.id} className="space-y-1">
                    <button
                      onClick={() => navigateToProducts(col.slug)}
                      className={`block w-full text-left text-xs font-mono uppercase tracking-wider py-2 border-b border-line ${
                        activeCollection === col.slug ? "text-heading font-bold" : "text-muted"
                      }`}
                    >
                      {col.name}
                    </button>
                    {hasChildren && (
                      <div className="pl-4 space-y-1 border-l border-line ml-1">
                        {col.children.map((child: any) => (
                          <button
                            key={child.id}
                            onClick={() => navigateToProducts(child.slug)}
                            className={`block w-full text-left text-[11px] font-mono uppercase py-1.5 transition-colors cursor-pointer ${
                              activeCollection === child.slug ? "text-heading font-bold" : "text-muted hover:text-heading"
                            }`}
                          >
                            — {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <button
              onClick={() => navigateToProducts(null)}
              className="block w-full text-left text-xs font-mono uppercase tracking-wider py-2 text-body border-b border-line toggle-filter"
              id="mobile-nav-collections"
            >
              Shop All
            </button>
          )}
        </div>
      )}
    </header>
  );
}
