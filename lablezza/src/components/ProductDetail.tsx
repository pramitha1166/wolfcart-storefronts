import { Product, ProductVariant, ProductOption, formatLKR } from "../types";
import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api";
import { Star, ShieldAlert, ArrowLeft, Check, Plus, Minus, Loader } from "lucide-react";
import { PaymentIcons } from "./PaymentIcons";

interface ProductDetailProps {
  product: Product;
  onAddToCart: (variantId: string, quantity: number) => Promise<void>;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findVariant(variants: ProductVariant[], attributes: Record<string, string>): ProductVariant | undefined {
  return variants.find(v =>
    Object.entries(attributes).every(([k, val]) => v.attributes[k] === val)
  );
}

function buildDefaultAttributes(options: ProductOption[], variants: ProductVariant[]): Record<string, string> {
  if (!options.length) return {};
  // Prefer first in-stock variant's attributes
  const firstInStock = variants.find(v => v.inventory > 0) ?? variants[0];
  const attrs: Record<string, string> = {};
  for (const opt of options) {
    attrs[opt.name] = firstInStock?.attributes?.[opt.name] ?? opt.values[0] ?? "";
  }
  return attrs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductDetail({ product, onAddToCart, onBack }: ProductDetailProps) {
  const hasOptions = (product.options?.length ?? 0) > 0;

  // Attribute-based selection (new option system)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    () => buildDefaultAttributes(product.options ?? [], product.variants ?? [])
  );

  // Flat variant selection (legacy / no-options products)
  const [flatVariant, setFlatVariant] = useState<ProductVariant>(
    product.variants?.[0] ?? { id: "default", title: "Default", price: product.price, compareAtPrice: null, inventory: 99, sku: null, attributes: {}, imageUrl: null }
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  // Derive the active variant from selected attributes (or flat selection for simple products)
  const selectedVariant: ProductVariant = useMemo(() => {
    if (hasOptions) {
      return findVariant(product.variants ?? [], selectedAttributes) ?? product.variants?.[0] ?? flatVariant;
    }
    return flatVariant;
  }, [hasOptions, selectedAttributes, product.variants, flatVariant]);

  // Main display image: variant-specific image takes priority; otherwise use gallery
  const displayImageUrl =
    selectedVariant.imageUrl ??
    product.images?.[activeImageIdx]?.url ??
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800";

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState("5.00");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Reset when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setAddedMessage(false);
    if (hasOptions) {
      setSelectedAttributes(buildDefaultAttributes(product.options ?? [], product.variants ?? []));
    } else if (product.variants?.length) {
      setFlatVariant(product.variants[0]);
    }
    loadReviews();
  }, [product.id]);

  // Cap quantity when variant or inventory changes
  useEffect(() => {
    if (selectedVariant.inventory > 0 && quantity > selectedVariant.inventory) {
      setQuantity(selectedVariant.inventory);
    }
  }, [selectedVariant]);

  async function loadReviews() {
    try {
      setReviewsLoading(true);
      const res = await api.getReviews(product.slug);
      const arr = Array.isArray(res) ? res : (res?.data ?? []);
      setReviews(arr);
      if (arr.length > 0) {
        const avg = (arr.reduce((s: number, r: any) => s + (r.rating ?? 5), 0) / arr.length).toFixed(2);
        setAverageRating(avg);
        setReviewCount(arr.length);
      } else {
        setAverageRating("5.00");
        setReviewCount(0);
      }
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product.inStock) return;
    try {
      setIsAdding(true);
      await onAddToCart(selectedVariant.id, quantity);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerName || !reviewerEmail || !reviewBody) return;
    try {
      setSubmittingReview(true);
      await api.submitReview(product.slug, { rating, reviewerName, reviewerEmail, title: reviewTitle, body: reviewBody });
    } catch { /* fall through to optimistic update */ } finally {
      const newReview = { id: Math.random().toString(), rating, reviewerName, body: reviewBody, createdAt: new Date().toISOString() };
      const next = [newReview, ...reviews];
      setReviews(next);
      setReviewCount(next.length);
      setAverageRating((next.reduce((s, r) => s + (r.rating ?? 5), 0) / next.length).toFixed(2));
      setReviewSuccess(true);
      setReviewerName(""); setReviewerEmail(""); setReviewTitle(""); setReviewBody("");
      setSubmittingReview(false);
      setTimeout(() => setReviewSuccess(false), 5000);
    }
  }

  // Check if a specific option value leads to at least one in-stock variant
  // (respecting currently selected values for all other options)
  function isValueAvailable(optionName: string, value: string): boolean {
    return (product.variants ?? []).some(v => {
      if (v.attributes[optionName] !== value) return false;
      if (v.inventory <= 0) return false;
      // Check all other options match current selection
      return (product.options ?? []).every(
        opt => opt.name === optionName || v.attributes[opt.name] === selectedAttributes[opt.name]
      );
    });
  }

  function selectAttribute(optionName: string, value: string) {
    setSelectedAttributes(prev => ({ ...prev, [optionName]: value }));
  }

  const currentPrice = selectedVariant.price || product.price;
  const currentCompareAt = selectedVariant.compareAtPrice || product.compareAtPrice;
  const discount = currentCompareAt && currentCompareAt > currentPrice
    ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
    : null;

  // Human-readable selected variant label for "Added to cart" message
  const variantLabel = hasOptions
    ? Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")
    : (selectedVariant.title || "");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 fade-in" id="pdp-container">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-muted hover:text-heading transition-colors mb-8 cursor-pointer focus:outline-none"
      >
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ── Images ── */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-[3/4] w-full bg-black/5 overflow-hidden relative border border-line">
            <img
              src={displayImageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center transition-all duration-500 hover:scale-105"
            />
            {!product.inStock && (
              <span className="absolute top-4 left-4 bg-primary text-primary-fg font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                Out Of Stock
              </span>
            )}
          </div>

          {/* Thumbnail row — product-level images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-black/5 border cursor-pointer focus:outline-none transition-all ${
                    idx === activeImageIdx && !selectedVariant.imageUrl
                      ? "border-primary ring-1 ring-primary"
                      : "border-line hover:border-primary"
                  }`}
                >
                  <img src={img.url} alt={img.alt} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5">
            {(product as any).collections?.[0] || "New Drop"}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-heading mb-3 uppercase">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xl font-bold text-heading">{formatLKR(currentPrice)}</span>
            {currentCompareAt && (
              <span className="font-mono text-sm text-muted line-through">{formatLKR(currentCompareAt)}</span>
            )}
            {discount && product.inStock && (
              <span className="bg-red-50 text-[10px] font-mono text-red-600 font-bold tracking-wider px-2 py-0.5 border border-red-100 rounded">
                SAVE {discount}%
              </span>
            )}
          </div>

          <hr className="border-t border-line my-2" />

          {/* ── Variant selector ── */}
          {hasOptions ? (
            /* NEW: option-based grouped selector */
            <div className="mt-4 mb-6 space-y-5">
              {(product.options ?? []).map(option => (
                <OptionSelector
                  key={option.name}
                  option={option}
                  selected={selectedAttributes[option.name] ?? ""}
                  onSelect={value => selectAttribute(option.name, value)}
                  isAvailable={value => isValueAvailable(option.name, value)}
                />
              ))}
            </div>
          ) : product.variants && product.variants.length > 1 ? (
            /* LEGACY: flat variant list for simple products */
            <div className="mt-4 mb-6">
              <p className="text-xs font-mono uppercase font-semibold text-muted mb-3">Select Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const label = v.title || Object.values(v.attributes ?? {})[0] || "Option";
                  const isSelected = flatVariant.id === v.id;
                  const outOfStock = v.inventory <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !outOfStock && setFlatVariant(v)}
                      disabled={outOfStock}
                      className={`h-10 px-4 border text-xs font-mono font-medium tracking-wider uppercase transition-all focus:outline-none ${
                        outOfStock ? "border-line text-muted line-through cursor-not-allowed"
                          : isSelected ? "border-primary bg-primary text-primary-fg"
                          : "border-line hover:border-line text-body bg-surface"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Inventory warning */}
          {selectedVariant.inventory > 0 && selectedVariant.inventory <= 5 && (
            <p className="text-[10px] font-mono text-amber-600 font-semibold mb-3 uppercase tracking-wider">
              Only {selectedVariant.inventory} left in stock
            </p>
          )}
          {selectedVariant.inventory <= 0 && product.inStock && (
            <p className="text-[10px] font-mono text-red-500 font-semibold mb-3 uppercase tracking-wider">
              This combination is out of stock
            </p>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mt-2 mb-8">
            <div className="flex items-center border border-line h-12 bg-surface rounded-lg">
              <button type="button" onClick={() => setQuantity(p => Math.max(1, p - 1))}
                className="px-4 text-muted hover:text-heading cursor-pointer">
                <Minus size={14} />
              </button>
              <span className="font-mono text-xs font-medium px-2 text-body w-6 text-center">{quantity}</span>
              <button type="button" onClick={() => setQuantity(p => Math.min(selectedVariant.inventory || 99, p + 1))}
                className="px-4 text-muted hover:text-heading cursor-pointer">
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || selectedVariant.inventory <= 0 || isAdding}
              className={`flex-1 h-12 text-xs font-mono font-semibold tracking-widest uppercase transition-all focus:outline-none flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                !product.inStock || selectedVariant.inventory <= 0
                  ? "bg-black/5 border border-line text-muted cursor-not-allowed"
                  : isAdding ? "bg-primary text-white"
                  : "bg-primary text-primary-fg hover:opacity-90"
              }`}
            >
              {isAdding ? <><Loader className="animate-spin" size={14} /> Adding…</> : !product.inStock || selectedVariant.inventory <= 0 ? "Sold Out" : "Add to Bag"}
            </button>
          </div>

          {addedMessage && (
            <div className="mb-6 p-4 border border-emerald-100 bg-emerald-50 rounded-lg flex items-center gap-3 fade-in">
              <span className="bg-emerald-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px]">✓</span>
              <p className="text-xs font-sans text-emerald-800 font-medium">
                Added {quantity}× {variantLabel ? `(${variantLabel})` : ""} to your cart!
              </p>
            </div>
          )}

          {/* Payment Options */}
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Guaranteed Safe Checkout</span>
            <PaymentIcons />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase">Product Details</h4>
            <p className="text-muted text-xs tracking-wide leading-relaxed font-light">{product.description}</p>
          </div>

          <hr className="border-t border-line my-8" />

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(Number(averageRating)) ? "fill-amber-500" : "text-muted"} />
              ))}
            </div>
            <span className="text-xs font-mono font-medium text-body">{averageRating} / 5.0 ({reviewCount} reviews)</span>
          </div>

          {/* Reviews list */}
          <div className="space-y-4 max-h-56 overflow-y-auto pr-2 mt-2">
            {reviewsLoading ? (
              <p className="text-xs font-mono text-muted">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-muted font-light italic">No reviews yet. Be the first!</p>
            ) : reviews.map(rev => (
              <div key={rev.id} className="p-3 bg-black/5 border border-line rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold text-body">{rev.reviewerName}</span>
                  <span className="text-[10px] font-mono text-muted">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Verified Customer"}
                  </span>
                </div>
                <div className="flex items-center text-amber-500 gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className={i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted"} />
                  ))}
                </div>
                <p className="text-xs text-muted font-light leading-relaxed">{rev.body}</p>
              </div>
            ))}
          </div>

          {/* Review form */}
          <div className="mt-8 border border-line rounded-lg p-5 bg-surface">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-body uppercase mb-4">Submit a Review</h4>
            {reviewSuccess ? (
              <div className="p-3 border border-emerald-100 bg-emerald-50 rounded text-xs text-emerald-800 font-medium">
                Thank you! Your review has been submitted.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="text-amber-500 focus:outline-none cursor-pointer p-0.5">
                      <Star size={16} className={star <= rating ? "fill-amber-500" : "text-muted"} />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Your name" required value={reviewerName} onChange={e => setReviewerName(e.target.value)}
                    className="border border-line text-xs px-3 py-2 w-full outline-none focus:border-primary rounded bg-black/5" />
                  <input type="email" placeholder="Email (private)" required value={reviewerEmail} onChange={e => setReviewerEmail(e.target.value)}
                    className="border border-line text-xs px-3 py-2 w-full outline-none focus:border-primary rounded bg-black/5" />
                </div>
                <textarea placeholder="Share your experience…" required rows={3} value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                  className="border border-line text-xs px-3 py-2 w-full outline-none focus:border-primary rounded bg-black/5" />
                <button type="submit" disabled={submittingReview}
                  className="w-full h-10 border border-primary text-[10px] font-mono font-bold tracking-widest uppercase text-heading hover:bg-primary hover:text-primary-fg transition-colors cursor-pointer rounded">
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OptionSelector ───────────────────────────────────────────────────────────

function OptionSelector({
  option, selected, onSelect, isAvailable,
}: {
  option: ProductOption;
  selected: string;
  onSelect: (value: string) => void;
  isAvailable: (value: string) => boolean;
}) {
  const isColorOption = option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour";

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">{option.name}</span>
        {selected && <span className="text-xs font-mono text-muted">{selected}</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        {option.values.map(value => {
          const isSelected = selected === value;
          const available = isAvailable(value);

          if (isColorOption) {
            return (
              <ColorSwatch
                key={value}
                color={value}
                isSelected={isSelected}
                available={available}
                onClick={() => available && onSelect(value)}
              />
            );
          }

          return (
            <button
              key={value}
              onClick={() => available && onSelect(value)}
              disabled={!available}
              title={!available ? `${value} — out of stock` : value}
              className={`h-10 min-w-[44px] px-4 border text-xs font-mono font-medium tracking-wider uppercase transition-all focus:outline-none relative ${
                !available
                  ? "border-line text-muted cursor-not-allowed"
                  : isSelected
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line hover:border-line text-body bg-surface"
              }`}
            >
              {value}
              {!available && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-full border-t border-line absolute" style={{ transform: "rotate(-20deg)" }} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ColorSwatch ──────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", white: "#f5f5f5", red: "#e53e3e", blue: "#3182ce",
  green: "#38a169", yellow: "#d69e2e", orange: "#dd6b20", purple: "#805ad5",
  pink: "#d53f8c", grey: "#718096", gray: "#718096", brown: "#92400e",
  navy: "#1a365d", beige: "#d4a96a", cream: "#fffdd0", gold: "#b7791f",
  silver: "#a0aec0", maroon: "#7b2d2d", olive: "#6b705c", teal: "#2c7a7b",
};

function ColorSwatch({ color, isSelected, available, onClick }: {
  color: string; isSelected: boolean; available: boolean; onClick: () => void;
}) {
  const hex = COLOR_MAP[color.toLowerCase()] ?? null;

  if (!hex) {
    // Fall back to text button for unknown color names
    return (
      <button
        onClick={onClick}
        disabled={!available}
        className={`h-10 px-4 border text-xs font-mono font-medium tracking-wider uppercase transition-all focus:outline-none ${
          !available ? "border-line text-muted cursor-not-allowed"
            : isSelected ? "border-primary bg-primary text-primary-fg"
            : "border-line hover:border-line text-body bg-surface"
        }`}
      >
        {color}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!available}
      title={color}
      className={`relative w-9 h-9 rounded-full border-2 transition-all focus:outline-none flex items-center justify-center ${
        isSelected ? "border-primary shadow-md scale-110" : "border-line hover:border-primary"
      } ${!available ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ backgroundColor: hex }}
    >
      {isSelected && (
        <Check
          size={13}
          strokeWidth={3}
          className={color.toLowerCase() === "white" || color.toLowerCase() === "cream" ? "text-body" : "text-white"}
        />
      )}
      {!available && (
        <span className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
          <span className="w-full border-t border-white/60 absolute" style={{ transform: "rotate(-45deg)" }} />
        </span>
      )}
    </button>
  );
}
