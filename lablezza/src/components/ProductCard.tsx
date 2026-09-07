import React, { useState } from "react";
import { Product, formatLKR } from "../types";
import { ArrowUpRight } from "lucide-react";
import { PaymentIcons } from "./PaymentIcons";
import { useLayout } from "../ThemeProvider";
import { badgeClasses, cardClasses, cx } from "../themeClasses";

interface ProductCardProps {
  product: Product;
  onClick: (slug: string) => void;
  key?: React.Key | null | undefined;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { productCardStyle, badgeStyle } = useLayout();

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  // Dual image alternate on hover if a second image is available
  const displayImage = isHovered && product.images && product.images.length > 1
    ? product.images[1].url
    : product.images?.[0]?.url;

  const badge = badgeClasses(badgeStyle);

  // The `overlay-hover` theme keeps the title/price over the image instead of
  // in a block beneath it, so the details column is rendered differently.
  const isOverlay = productCardStyle === "overlay-hover";

  return (
    <div
      className={cx(cardClasses(productCardStyle), "flex flex-col cursor-pointer")}
      onClick={() => onClick(product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`product-card-${product.id}`}
    >
      {/* Visual Aspect Ratio Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5">
        <img
          src={displayImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"}
          alt={product.images?.[0]?.alt || product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Dynamic Badge Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!product.inStock && (
            <span className={cx(badge, "bg-primary font-mono text-[9px] font-bold tracking-widest text-primary-fg uppercase")}>
              Sold Out
            </span>
          )}
          {discount && product.inStock && (
            <span className={cx(badge, "bg-red-600 font-mono text-[9px] font-bold tracking-widest text-white uppercase")}>
              -{discount}% Off
            </span>
          )}
        </div>

        {/* Hover overlay quick actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
          <button className="bg-surface/95 backdrop-blur-sm text-heading text-xs font-mono font-medium tracking-wider w-full py-2.5 flex items-center justify-center gap-1.5 shadow-lg transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0 uppercase hover:bg-primary hover:text-primary-fg">
            Quick View
            <ArrowUpRight size={13} />
          </button>
        </div>

        {isOverlay && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
            <h3 className="font-display text-sm font-medium text-white line-clamp-1">
              {product.name}
            </h3>
            <span className="font-mono text-xs font-semibold text-white/90">
              {formatLKR(product.price)}
            </span>
          </div>
        )}
      </div>

      {/* Product Details info block */}
      {!isOverlay && (
        <div className="flex flex-col pt-3 pb-2 px-1">
          <h3 className="font-sans text-xs font-medium text-body tracking-tight group-hover:text-heading line-clamp-1 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-heading">
                {formatLKR(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-mono text-[10px] text-muted line-through">
                  {formatLKR(product.compareAtPrice)}
                </span>
              )}
            </div>

            <span className="font-mono text-[9px] text-muted uppercase tracking-widest">
              {product.collections?.[0]}
            </span>
          </div>

          <PaymentIcons iconClassName="h-3.5" />
        </div>
      )}
    </div>
  );
}
