import React, { useState, useEffect, useRef } from "react";
import { api } from "./api";
import { Cart, Product, Collection, Store, HomeConfig, HomeCustomBlock, formatLKR } from "./types";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import CheckoutView from "./components/CheckoutView";
import SuccessView from "./components/SuccessView";
import Footer from "./components/Footer";
import { useSeo } from "./hooks/useSeo";
import { useLayout } from "./ThemeProvider";
import { cx, headerOverlaps } from "./themeClasses";
import { Loader2, ArrowRight, Shield, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// ── Banner Carousel ────────────────────────────────────────────────────────────
function BannerCarousel({ images }: { images: string[] }) {
  const valid = images.filter(Boolean);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (valid.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % valid.length);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [valid.length]);

  if (valid.length === 0) return null;

  const prev = () => setCurrent(c => (c - 1 + valid.length) % valid.length);
  const next = () => setCurrent(c => (c + 1) % valid.length);

  return (
    <div className="relative w-full overflow-hidden bg-primary" style={{ maxHeight: 520 }}>
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {valid.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Banner slide ${i + 1}`}
            className="w-full shrink-0 object-cover"
            style={{ maxHeight: 520, minHeight: 260 }}
          />
        ))}
      </div>

      {valid.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface flex items-center justify-center shadow-md transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={18} className="text-body" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface flex items-center justify-center shadow-md transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={18} className="text-body" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {valid.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-surface' : 'w-2 h-2 bg-surface/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Custom Block ───────────────────────────────────────────────────────────────
function CustomBlock({ block }: { block: HomeCustomBlock }) {
  const images = block.images.filter(Boolean);
  const isTop = block.layout === 'image-top';
  const isRight = block.layout === 'image-right';

  const imagesSection = images.length > 0 && (
    <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${!isTop ? (isRight ? 'md:col-span-5' : 'md:col-span-5') : 'w-full'}`}>
      {images.map((src, i) => (
        <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-black/5">
          <img src={src} alt={`${block.title} ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );

  const textSection = (
    <div className={`flex flex-col justify-center space-y-4 ${!isTop ? 'md:col-span-7' : ''}`}>
      <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-heading">
        {block.title}
      </h2>
      <div className="h-0.5 w-12 bg-primary" />
      {block.description.type === 'paragraph' ? (
        <p className="text-muted text-sm leading-relaxed font-light">
          {block.description.content}
        </p>
      ) : (
        <ul className="space-y-2">
          {block.description.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted font-light">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (isTop) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {imagesSection}
        {textSection}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 items-center ${isRight ? '' : ''}`}>
        {isRight ? (
          <>
            {textSection}
            {imagesSection}
          </>
        ) : (
          <>
            {imagesSection}
            {textSection}
          </>
        )}
      </div>
    </section>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { headerStyle } = useLayout();
  const overlapHeader = headerOverlaps(headerStyle);

  const [view, setView] = useState<"home" | "products" | "pdp" | "checkout" | "order-success" | "about-us" | "privacy-policy" | "terms-conditions">("home");
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

  const [storeInfo, setStoreInfo] = useState<Store | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Product[] | null>(null);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  // Cache: slug → fetched products. Never triggers re-renders; persists for the session.
  const collectionCache = useRef<Map<string, Product[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const navigateTo = (nextView: typeof view) => {
    const urlMap: Partial<Record<typeof view, string>> = {
      home: "/", products: "/products", checkout: "/checkout",
      "order-success": "/order-success", "about-us": "/about-us",
      "privacy-policy": "/privacy-policy", "terms-conditions": "/terms-conditions",
    };
    window.history.pushState({}, "", urlMap[nextView] ?? "/");
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successMethod, setSuccessMethod] = useState<"cod" | "payhere" | "bank_transfer" | "directpay" | null>(null);
  const [successPaymentData, setSuccessPaymentData] = useState<any>(null);

  const [sortBy, setSortBy] = useState<string>("newest");

  const initializeStorefront = async () => {
    try {
      setIsDataLoaded(false);

      const [storeData, collectionsData, productsData] = await Promise.all([
        api.getStore().catch(() => null),
        api.getCollections().catch(() => []),
        api.getProducts({ limit: 100 }).catch(() => []),
      ]);

      setStoreInfo(storeData);
      setCollections(collectionsData || []);
      setAllProducts(productsData || []);

      try {
        const cachedId = localStorage.getItem("wc_cart_id");
        if (cachedId) {
          try {
            const freshCart = await api.getCart(cachedId);
            setCart(freshCart);
            setCartId(cachedId);
          } catch {
            const newCart = await api.createCart();
            setCart(newCart);
            setCartId(newCart.id);
            localStorage.setItem("wc_cart_id", newCart.id);
          }
        } else {
          const newCart = await api.createCart();
          setCart(newCart);
          setCartId(newCart.id);
          localStorage.setItem("wc_cart_id", newCart.id);
        }
      } catch {
        const localCartId = "local_cart_" + Math.random().toString(36).substring(3);
        setCartId(localCartId);
        setCart({ id: localCartId, items: [], subtotal: 0, itemCount: 0, createdAt: new Date().toISOString() });
      }
    } catch {
      const localCartId = "local_cart_" + Math.random().toString(36).substring(3);
      setStoreInfo(null);
      setCollections([]);
      setAllProducts([]);
      setCartId(localCartId);
      setCart({ id: localCartId, items: [], subtotal: 0, itemCount: 0, createdAt: new Date().toISOString() });
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => { initializeStorefront(); }, []);

  // Resolve URL → view on initial load and browser back/forward
  useEffect(() => {
    const resolveRoute = (products: Product[]) => {
      const path = window.location.pathname;
      if (path === "/" || path === "") return;
      if (path === "/products") { setView("products"); return; }
      if (path === "/checkout") { setView("checkout"); return; }
      if (path === "/order-success") { setView("order-success"); return; }
      if (path === "/about-us") { setView("about-us"); return; }
      if (path === "/privacy-policy") { setView("privacy-policy"); return; }
      if (path === "/terms-conditions") { setView("terms-conditions"); return; }

      const slug = path.slice(1);
      const match = products.find(p => p.slug === slug);
      if (match) {
        setSelectedProductSlug(slug);
        setView("pdp");
      }
    };

    // Run once after data loads (handles direct URL / page refresh)
    if (isDataLoaded) resolveRoute(allProducts);
  }, [isDataLoaded]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (path === "/" || path === "") { setView("home"); setSelectedProductSlug(null); return; }
      if (path === "/products") { setView("products"); return; }
      if (path === "/checkout") { setView("checkout"); return; }
      if (path === "/order-success") { setView("order-success"); return; }
      if (path === "/about-us") { setView("about-us"); return; }
      if (path === "/privacy-policy") { setView("privacy-policy"); return; }
      if (path === "/terms-conditions") { setView("terms-conditions"); return; }

      const slug = path.slice(1);
      const match = allProducts.find((p: Product) => p.slug === slug);
      if (match) { setSelectedProductSlug(slug); setView("pdp"); }
      else { setView("home"); setSelectedProductSlug(null); }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [allProducts]);

  // Server-side collection filter — fetches once per slug, then serves from cache
  useEffect(() => {
    if (!activeCollection || activeCollection === "all") {
      setCollectionProducts(null);
      return;
    }
    const cached = collectionCache.current.get(activeCollection);
    if (cached) {
      setCollectionProducts(cached);
      return;
    }
    let cancelled = false;
    setIsCollectionLoading(true);
    api.getProducts({ collection: activeCollection, limit: 100 })
      .then(results => {
        if (!cancelled) {
          collectionCache.current.set(activeCollection, results);
          setCollectionProducts(results);
        }
      })
      .catch(() => { if (!cancelled) setCollectionProducts([]); })
      .finally(() => { if (!cancelled) setIsCollectionLoading(false); });
    return () => { cancelled = true; };
  }, [activeCollection]);

  const handleAddToCart = async (variantId: string, quantity: number) => {
    if (!cartId || !cart) return;
    try {
      const updatedCart = await api.addToCart(cartId, variantId, quantity);
      setCart(updatedCart);
    } catch {
      const currentProduct = allProducts.find(p => p.variants.some(v => v.id === variantId));
      if (currentProduct) {
        const matchingVariant = currentProduct.variants.find(v => v.id === variantId);
        const existingIdx = cart.items.findIndex(item => item.variantId === variantId);
        let newItems = [...cart.items];
        const itemPrice = matchingVariant?.price || currentProduct.price;
        if (existingIdx !== -1) {
          const m = newItems[existingIdx];
          const newQty = m.quantity + quantity;
          newItems[existingIdx] = { ...m, quantity: newQty, lineTotal: newQty * itemPrice };
        } else {
          newItems.push({
            id: "opt_" + Math.random().toString(36).substring(3),
            variantId,
            productId: currentProduct.id,
            productName: currentProduct.name,
            variantTitle: matchingVariant?.title || "S",
            price: itemPrice,
            quantity,
            lineTotal: quantity * itemPrice,
            imageUrl: currentProduct.images?.[0]?.url || "",
            slug: currentProduct.slug,
          });
        }
        const newSubtotal = newItems.reduce((acc, i) => acc + i.lineTotal, 0);
        const newItemCount = newItems.reduce((acc, i) => acc + i.quantity, 0);
        setCart({ ...cart, items: newItems, subtotal: newSubtotal, itemCount: newItemCount });
      }
    }
  };

  const handleUpdateQty = async (variantId: string, quantity: number) => {
    if (!cartId || !cart) return;
    if (quantity <= 0) { await handleRemoveItem(variantId); return; }
    try {
      const updatedCart = await api.updateCartItem(cartId, variantId, quantity);
      setCart(updatedCart);
    } catch {
      let newItems = [...cart.items];
      const idx = newItems.findIndex(i => i.variantId === variantId);
      if (idx !== -1) {
        const item = newItems[idx];
        newItems[idx] = { ...item, quantity, lineTotal: quantity * item.price };
      }
      setCart({ ...cart, items: newItems, subtotal: newItems.reduce((a, i) => a + i.lineTotal, 0), itemCount: newItems.reduce((a, i) => a + i.quantity, 0) });
    }
  };

  const handleRemoveItem = async (variantId: string) => {
    if (!cartId || !cart) return;
    try {
      const updatedCart = await api.removeFromCart(cartId, variantId);
      setCart(updatedCart);
    } catch {
      const newItems = cart.items.filter(i => i.variantId !== variantId);
      setCart({ ...cart, items: newItems, subtotal: newItems.reduce((a, i) => a + i.lineTotal, 0), itemCount: newItems.reduce((a, i) => a + i.quantity, 0) });
    }
  };

  const handleCheckoutSuccess = (orderId: string, method: "cod" | "payhere" | "bank_transfer" | "directpay", paymentData?: any) => {
    setSuccessOrderId(orderId);
    setSuccessMethod(method);
    setSuccessPaymentData(paymentData);
    navigateTo("order-success");
    setCart({ id: cart?.id || "empty", items: [], subtotal: 0, itemCount: 0, createdAt: new Date().toISOString() });
    localStorage.removeItem("wc_cart_id");
  };

  const productClickHandler = (slug: string) => {
    setSelectedProductSlug(slug);
    setView("pdp");
    window.history.pushState({}, "", `/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Base product list: use server-filtered results when a collection is active
  const baseProducts = collectionProducts ?? allProducts;

  const filteredProducts = baseProducts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "name_asc") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedProduct = allProducts.find(p => p.slug === selectedProductSlug);

  useSeo({ view, storeInfo, product: view === "pdp" ? selectedProduct : null });

  const handlePolicyClick = (type: "about" | "privacy" | "terms") => {
    if (type === "about") navigateTo("about-us");
    if (type === "privacy") navigateTo("privacy-policy");
    if (type === "terms") navigateTo("terms-conditions");
  };

  const handleFooterLinkClick = (label: string, href: string) => {
    const ll = label.toLowerCase(), lh = href.toLowerCase();
    if (ll.includes("about") || lh.includes("about")) { handlePolicyClick("about"); return true; }
    if (ll.includes("privacy") || lh.includes("privacy")) { handlePolicyClick("privacy"); return true; }
    if (ll.includes("term") || ll.includes("condition") || lh.includes("term")) { handlePolicyClick("terms"); return true; }
    return false;
  };

  if (!isDataLoaded) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black/5 space-y-3">
        <Loader2 className="animate-spin text-heading" size={32} />
        {/* <span className="font-mono text-xs text-muted uppercase tracking-widest">Loading...</span> */}
      </div>
    );
  }

  // ── Resolve homeConfig with fallbacks ──────────────────────────────────────
  const hc: HomeConfig = storeInfo?.homeConfig ?? {
    banner: { enabled: storeInfo?.bannerEnabled !== false, images: storeInfo?.bannerImage ? [storeInfo.bannerImage] : [] },
    hero: { enabled: true },
    collections: { enabled: true, title: 'Shop by Collection', description: '', viewMoreLink: '/products' },
    featuredProducts: { enabled: true, title: 'Featured Products', description: '', viewMoreLink: '/products', productIds: [], primaryProductId: null },
    newReleases: { enabled: true, title: 'New Releases', description: '', viewMoreLink: '/products', productIds: [], primaryProductId: null },
    customBlocks: [],
  };

  // ── Resolve hero showcase products ────────────────────────────────────────
  const heroProd1 = (hc.featuredProducts.primaryProductId
    ? allProducts.find(p => p.id === hc.featuredProducts.primaryProductId)
    : null) ?? allProducts[0] ?? null;

  const heroProd2 = (hc.newReleases.primaryProductId
    ? allProducts.find(p => p.id === hc.newReleases.primaryProductId)
    : null) ?? allProducts[1] ?? null;

  // ── Resolve section products ───────────────────────────────────────────────
  // Priority: is_featured flag (set via ⭐ on Products page) → homeConfig productIds → nothing
  const featuredByFlag = allProducts.filter((p: Product) => p.isFeatured);
  const featuredProducts = featuredByFlag.length > 0
    ? featuredByFlag
    : hc.featuredProducts.productIds.map(id => allProducts.find((p: Product) => p.id === id)).filter((p): p is Product => !!p);

  const newReleasesByFlag = allProducts.filter((p: Product) => p.isNewRelease);
  const newReleasesProducts = newReleasesByFlag.length > 0
    ? newReleasesByFlag
    : hc.newReleases.productIds.map(id => allProducts.find((p: Product) => p.id === id)).filter((p): p is Product => !!p);

  return (
    <div className={cx(
      "min-h-screen flex flex-col bg-bg text-body selection:bg-primary selection:text-primary-fg",
      // A transparent header sits over the hero, so the shell must not clip it.
      overlapHeader && "relative",
    )}>
      <Navbar
        storeInfo={storeInfo}
        collections={collections}
        activeCollection={activeCollection}
        cart={cart}
        currentView={view}
        setView={(v) => navigateTo(v as typeof view)}
        setSelectedProductSlug={setSelectedProductSlug}
        setActiveCollection={setActiveCollection}
        setIsCartOpen={setIsCartOpen}
        onSearch={setSearchQuery}
      />

      <main className={cx("flex-grow", overlapHeader && "pt-0")}>
        {view === "home" && (
          <div className="fade-in">

            {/* ── Banner Carousel ─────────────────────────────────────────── */}
            {hc.banner.enabled && hc.banner.images.filter(Boolean).length > 0 && (
              <BannerCarousel images={hc.banner.images} />
            )}

            {/* ── Hero Section ────────────────────────────────────────────── */}
            {hc.hero.enabled && (
              <section className={`relative overflow-hidden py-16 sm:py-24 border-b border-line bg-black/5 text-body`}>
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                  {/* Text Left */}
                  <div className="md:col-span-5 space-y-6">
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 text-muted">
                      <Sparkles size={12} className="text-body animate-pulse" />
                      {storeInfo?.storeSubtitle || "New Collection"}
                    </span>
                    <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase text-heading break-words">
                      {storeInfo?.storeTitle || storeInfo?.name || "New Collection"}
                    </h1>
                    <p className="text-sm tracking-wide leading-relaxed font-light font-sans max-w-md text-muted">
                      {storeInfo?.storeDescription || "Discover our curated selection of premium products."}
                    </p>
                    <button
                      onClick={() => { setActiveCollection(null); navigateTo("products"); }}
                      className="h-12 px-6 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 rounded-lg cursor-pointer transition-colors bg-primary hover:opacity-90 text-primary-fg"
                    >
                      Go To Shop <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Product showcase Right */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {heroProd1 ? (
                      <div
                        className="aspect-[3/4] overflow-hidden bg-black/5 shadow-xl group cursor-pointer relative rounded-lg"
                        onClick={() => productClickHandler(heroProd1.slug)}
                      >
                        <img
                          src={heroProd1.images?.[0]?.url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"}
                          alt={heroProd1.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end text-white">
                          <div>
                            <span className="block text-[10px] font-mono tracking-widest uppercase text-muted">Featured</span>
                            <span className="block text-xs font-bold">{heroProd1.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold">{formatLKR(heroProd1.price)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] overflow-hidden bg-black/5 shadow-xl rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted font-mono">No product selected</span>
                      </div>
                    )}
                    {heroProd2 ? (
                      <div
                        className="hidden sm:block aspect-[3/4] overflow-hidden bg-black/5 shadow-xl group cursor-pointer relative rounded-lg"
                        onClick={() => productClickHandler(heroProd2.slug)}
                      >
                        <img
                          src={heroProd2.images?.[0]?.url || "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600"}
                          alt={heroProd2.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end text-white">
                          <div>
                            <span className="block text-[10px] font-mono tracking-widest uppercase text-muted">New Release</span>
                            <span className="block text-xs font-bold">{heroProd2.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold">{formatLKR(heroProd2.price)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="hidden sm:block aspect-[3/4] overflow-hidden bg-black/5 shadow-xl rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted font-mono">No product selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Featured Products ────────────────────────────────────────── */}
            {hc.featuredProducts.enabled && featuredProducts.length > 0 && (
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-end justify-between border-b border-line pb-4 mb-8">
                  <div>
                    <h2 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-heading">
                      {hc.featuredProducts.title}
                    </h2>
                    {hc.featuredProducts.description && (
                      <p className="text-[11px] text-muted font-mono tracking-wider mt-0.5">
                        {hc.featuredProducts.description.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setActiveCollection(null); navigateTo("products"); }}
                    className="text-xs font-mono font-semibold uppercase tracking-wider text-body hover:text-muted cursor-pointer flex items-center gap-1"
                  >
                    {hc.featuredProducts.viewMoreLink ? 'View All' : 'See All'} <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10" id="featured-products">
                  {featuredProducts.slice(0, 5).map(p => (
                    <ProductCard key={p.id} product={p} onClick={productClickHandler} />
                  ))}
                </div>
              </section>
            )}

            {/* ── New Releases ─────────────────────────────────────────────── */}
            {hc.newReleases.enabled && newReleasesProducts.length > 0 && (
              <section className="bg-black/5 border-y border-line py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between border-b border-line pb-4 mb-8">
                    <div>
                      <h2 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-heading">
                        {hc.newReleases.title}
                      </h2>
                      {hc.newReleases.description && (
                        <p className="text-[11px] text-muted font-mono tracking-wider mt-0.5">
                          {hc.newReleases.description.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setActiveCollection(null); navigateTo("products"); }}
                      className="text-xs font-mono font-semibold uppercase tracking-wider text-body hover:text-muted cursor-pointer flex items-center gap-1"
                    >
                      See All <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10" id="new-releases">
                    {newReleasesProducts.slice(0, 5).map(p => (
                      <ProductCard key={p.id} product={p} onClick={productClickHandler} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Collections Grid ─────────────────────────────────────────── */}
            {hc.collections.enabled && collections.filter(c => c.slug !== "all").length > 0 && (
              <section className={`${!hc.newReleases.enabled ? 'bg-black/5 border-y border-line' : ''} py-16`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between border-b border-line pb-4 mb-8">
                    <div>
                      <h2 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-heading">
                        {hc.collections.title}
                      </h2>
                      {hc.collections.description && (
                        <p className="text-[11px] text-muted font-mono tracking-wider mt-0.5">
                          {hc.collections.description.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setActiveCollection(null); navigateTo("products"); }}
                      className="text-xs font-mono font-semibold uppercase tracking-wider text-body hover:text-muted cursor-pointer flex items-center gap-1"
                    >
                      See All <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="collections-grid">
                    {collections.filter(c => c.slug !== "all").slice(0, 3).map(col => (
                      <div
                        key={col.id}
                        onClick={() => { setActiveCollection(col.slug); navigateTo("products"); }}
                        className="group relative aspect-[4/5] overflow-hidden bg-black/5 cursor-pointer shadow-sm rounded-lg"
                      >
                        <img
                          src={col.imageUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600"}
                          alt={col.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                            {col.productCount} SKUs
                          </span>
                          <h3 className="font-display text-lg font-extrabold uppercase tracking-tight">{col.name}</h3>
                          <p className="text-[11px] text-muted font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-xs leading-relaxed">
                            {col.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Custom Content Blocks ────────────────────────────────────── */}
            {hc.customBlocks
              .filter(b => b.title || b.images.filter(Boolean).length > 0)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((block, idx) => (
                <div key={block.id} className={idx % 2 === 0 ? '' : 'bg-black/5'}>
                  <CustomBlock block={block} />
                </div>
              ))}

          </div>
        )}

        {view === "products" && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 fade-in" id="catalog-main-screen">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line pb-5 mb-8 gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-heading uppercase tracking-tight">
                  {!activeCollection || activeCollection === "all"
                    ? "All Products"
                    : (collections.find(c => c.slug === activeCollection)?.name ?? activeCollection) + " Collection"}
                </h1>
                <p className="text-[11px] text-muted font-mono tracking-widest uppercase mt-0.5">
                  {isCollectionLoading ? "Loading..." : `Showing ${sortedProducts.length} products`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                {searchQuery && (
                  <div className="bg-black/5 px-3 py-1.5 rounded flex items-center gap-1.5 text-muted">
                    <span>Q: {searchQuery}</span>
                    <button onClick={() => setSearchQuery("")} className="font-bold hover:text-heading cursor-pointer">✕</button>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-muted" />
                  <span className="text-muted uppercase">Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-none bg-transparent outline-none font-semibold text-heading tracking-wide focus:ring-0 text-xs py-0 px-1 cursor-pointer">
                    <option value="newest">Newest Drops</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <aside className="col-span-12 md:col-span-3 space-y-8">
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase">Collection</h4>
                  <div className="flex flex-col gap-1.5 text-xs font-medium tracking-wide">
                    <button onClick={() => setActiveCollection(null)} className={`text-left py-1 hover:text-heading transition-colors cursor-pointer ${!activeCollection ? "text-heading font-bold flex items-center gap-1.5" : "text-muted"}`}>
                      {!activeCollection && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}Show All
                    </button>
                    {collections.map(col => (
                      <button key={col.id} onClick={() => setActiveCollection(col.slug)} className={`text-left py-1 hover:text-heading capitalize transition-colors cursor-pointer ${activeCollection === col.slug ? "text-heading font-bold flex items-center gap-1.5" : "text-muted"}`}>
                        {activeCollection === col.slug && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        {col.name} ({col.productCount || 0})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 border-t border-line pt-6 bg-black/5/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-body">
                    <Shield size={14} />
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Guarantee</span>
                  </div>
                  <p className="text-[10px] text-muted font-light leading-relaxed">
                    Quality products delivered within 3–5 days with real-time courier tracking.
                  </p>
                </div>
              </aside>

              <div className="col-span-12 md:col-span-9">
                {isCollectionLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-xs font-mono uppercase tracking-widest">Filtering products...</span>
                  </div>
                ) : sortedProducts.length === 0 ? (
                  <div className="text-center py-20 bg-black/5 border rounded-lg space-y-4">
                    <p className="text-muted text-xs font-mono lowercase">No products found</p>
                    <button onClick={() => { setActiveCollection(null); setSearchQuery(""); }} className="text-xs font-mono uppercase bg-primary text-primary-fg px-5 py-2.5 rounded hover:opacity-90 cursor-pointer">Clear Filters</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10" id="catalog-products-grid">
                    {sortedProducts.map(product => (
                      <ProductCard key={product.id} product={product} onClick={productClickHandler} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "pdp" && selectedProduct && (
          <ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} onBack={() => navigateTo("products")} />
        )}

        {view === "checkout" && (
          <CheckoutView cart={cart} onSuccess={handleCheckoutSuccess} onBack={() => navigateTo("products")} />
        )}

        {view === "order-success" && (
          <SuccessView
            orderId={successOrderId || new URLSearchParams(window.location.search).get("order_id") || "Pending"}
            method={successMethod || (new URLSearchParams(window.location.search).get("method") as any) || "online"}
            paymentData={successPaymentData}
            onReset={() => { navigateTo("home"); setSuccessOrderId(null); setSuccessMethod(null); setSuccessPaymentData(null); }}
          />
        )}

        {/* ── Policy Pages ─────────────────────────────────────────────────── */}
        {(view === "about-us" || view === "privacy-policy" || view === "terms-conditions") && (() => {
          const storeName = storeInfo?.name || "this store";
          const year = new Date().getFullYear();

          const wolfcartContent: Record<string, { title: string; body: string }> = {
            "about-us": {
              title: "About WolfCart",
              body: `WolfCart is a modern e-commerce platform built to help businesses of all sizes launch and grow their online stores. We provide merchants with the tools they need — from product management and inventory tracking to secure payments and customer analytics — all under one roof.

Our platform is designed with both merchants and shoppers in mind. Merchants get a powerful, easy-to-use dashboard. Shoppers get a fast, secure, and delightful buying experience.

WolfCart is operated and maintained by WolfCart Technologies. For platform-level support, contact us at support@wolfcart.io.`,
            },
            "privacy-policy": {
              title: "WolfCart Platform Privacy Policy",
              body: `Last updated: ${year}

WolfCart Technologies ("WolfCart", "we", "us") operates the e-commerce infrastructure powering this storefront. This section describes how WolfCart handles data at the platform level.

1. Data We Collect
We collect information you provide when creating an account, placing orders, or contacting support. This includes name, email address, shipping address, and payment information (processed securely by our payment partners — we do not store card numbers).

2. How We Use Data
We use collected data to process transactions, provide customer support, improve our platform, prevent fraud, and comply with legal obligations.

3. Data Sharing
We do not sell your personal data. We may share data with trusted service providers (payment processors, shipping carriers, analytics) solely to operate the platform. All partners are contractually bound to protect your data.

4. Cookies
We use essential cookies to keep you logged in and remember your cart. Analytics cookies may be used to understand how shoppers interact with the storefront.

5. Your Rights
You may request access to, correction of, or deletion of your personal data at any time by contacting support@wolfcart.io.

6. Security
We use industry-standard encryption (TLS/SSL) and follow best practices to protect your data.`,
            },
            "terms-conditions": {
              title: "WolfCart Platform Terms & Conditions",
              body: `Last updated: ${year}

By accessing or purchasing from a WolfCart-powered storefront, you agree to the following terms.

1. Platform
This storefront is powered by WolfCart Technologies. WolfCart provides the e-commerce infrastructure but is not a party to the sale between you and the merchant.

2. Orders & Payments
All orders are subject to availability. Prices are set by the merchant and displayed in the local currency. Payments are processed through secure third-party gateways. WolfCart does not store payment card details.

3. Shipping & Delivery
Shipping timelines and policies are determined by the individual merchant. WolfCart is not responsible for delays caused by carriers or customs.

4. Returns & Refunds
Return and refund policies are set by each merchant. Please review the merchant's policy before purchasing. For disputes, contact the merchant directly or reach us at support@wolfcart.io.

5. Intellectual Property
All trademarks, content, and technology on this platform are owned by WolfCart Technologies or the respective merchant and may not be reproduced without written permission.

6. Limitation of Liability
WolfCart provides the platform "as is." We are not liable for losses arising from merchant actions, service interruptions, or third-party provider failures.

7. Governing Law
These terms are governed by the laws of Sri Lanka. Disputes shall be resolved in the courts of Colombo, Sri Lanka.`,
            },
          };

          const pageKey = view;
          const wolfcart = wolfcartContent[pageKey];
          const pageTitle =
            view === "about-us" ? "About Us" :
              view === "privacy-policy" ? "Privacy Policy" :
                "Terms & Conditions";
          const merchantContent =
            view === "about-us" ? storeInfo?.aboutPage :
              view === "privacy-policy" ? storeInfo?.privacyPage :
                storeInfo?.termsPage;

          return (
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 fade-in">
              <button
                onClick={() => navigateTo("home")}
                className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-muted hover:text-body transition-colors mb-8 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back to Home
              </button>

              <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-heading mb-2">
                {pageTitle}
              </h1>
              <div className="h-0.5 w-16 bg-primary mb-10" />

              {/* WolfCart platform section */}
              <div className="mb-10 p-6 bg-black/5 border border-line rounded-2xl space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase">WolfCart Platform</span>
                </div>
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-body">
                  {wolfcart.title}
                </h2>
                <div className="whitespace-pre-wrap font-sans text-muted text-xs sm:text-sm leading-relaxed">
                  {wolfcart.body}
                </div>
              </div>

              {/* Merchant section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase truncate max-w-[200px] sm:max-w-xs md:max-w-sm">{storeName}</span>
                </div>
                {merchantContent ? (
                  <>
                    <h2 className="font-display text-lg font-black uppercase tracking-tight text-body">
                      {pageTitle} — {storeName}
                    </h2>
                    <div className="whitespace-pre-wrap font-sans text-muted text-xs sm:text-sm leading-relaxed">
                      {merchantContent}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center border border-dashed border-line rounded-2xl">
                    <span className="text-3xl">📄</span>
                    <p className="text-sm font-semibold text-muted">No merchant policy added yet</p>
                    <p className="text-xs text-muted max-w-sm">
                      {storeName} hasn't added their own policy content yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCartUpdated={setCart}
        onCheckout={() => { setIsCartOpen(false); navigateTo("checkout"); }}
      />

      <Footer
        storeInfo={storeInfo}
        onNavigate={v => navigateTo(v as typeof view)}
        onPolicyClick={handlePolicyClick}
        onLinkClick={handleFooterLinkClick}
      />
    </div>
  );
}
