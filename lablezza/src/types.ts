// ── Core types ────────────────────────────────────────────

export type CustomBlockDescription =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] };

export type HomeCustomBlock = {
  id: string;
  title: string;
  description: CustomBlockDescription;
  images: string[];
  layout: 'image-left' | 'image-right' | 'image-top';
  sortOrder: number;
};

export type HomeProductsBlockConfig = {
  enabled: boolean;
  title: string;
  description: string;
  viewMoreLink: string;
  productIds: string[];
  primaryProductId: string | null;
};

export type HomeConfig = {
  banner: {
    enabled: boolean;
    images: string[];
  };
  hero: {
    enabled: boolean;
  };
  collections: {
    enabled: boolean;
    title: string;
    description: string;
    viewMoreLink: string;
  };
  featuredProducts: HomeProductsBlockConfig;
  newReleases: HomeProductsBlockConfig;
  customBlocks: HomeCustomBlock[];
};

export type Store = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  logo: string | null;
  bannerEnabled: boolean;
  bannerImage: string | null;
  storeTitle: string | null;
  storeSubtitle: string | null;
  storeDescription: string;
  navMode: 'default' | 'collections' | 'categories';
  storeEmail: string;
  storeAddress: string;
  storeAddresses: string[];
  socialLinks: Record<string, string>;
  footerLinks: Array<{ label: string; href: string }>;
  aboutPage: string | null;
  termsPage: string | null;
  privacyPage: string | null;
  homeConfig: HomeConfig | null;
  currency: string;           // 'LKR'
  currencySymbol: string;    // 'Rs'
  plan: string;
  customDomain: string | null;
  primaryColor?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
    twitterHandle: string;
  };
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductOption = {
  name: string;      // e.g. "Size", "Color"
  values: string[];  // e.g. ["S", "M", "L", "XL"]
};

export type ProductVariant = {
  id: string;
  title: string;
  price: number;                        // cents
  compareAtPrice: number | null;
  inventory: number;
  sku: string | null;
  attributes: Record<string, string>;  // { Size: "M", Color: "Red" }
  imageUrl: string | null;             // variant-specific image (overrides product gallery)
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;              // cents — lowest variant price
  compareAtPrice: number | null;
  images: ProductImage[];
  options: ProductOption[];   // option definitions for the variant selector
  variants: ProductVariant[];
  collections: string[];       // collection slugs
  inStock: boolean;
  totalInventory: number;
  isFeatured?: boolean;
  isNewRelease?: boolean;
  createdAt: string;

  // SEO fields (Growth + Pro plans — null on Starter)
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

// Helper: resolved SEO values with fallbacks applied
export type SeoMeta = {
  title:          string;
  description:    string;
  ogTitle:        string;
  ogDescription:  string;
  ogImage:        string | null;
  canonical:      string;
  noIndex:        boolean;
  keywords:       string | null;
};

export function resolveProductSeo(
  product: Product,
  storeUrl: string,
  storeName: string
): SeoMeta {
  return {
    title:         product.metaTitle ?? `${product.name} — ${storeName}`,
    description:   product.metaDescription ?? product.description?.slice(0, 155) ?? '',
    ogTitle:       product.ogTitle ?? product.metaTitle ?? product.name,
    ogDescription: product.ogDescription ?? product.metaDescription ?? '',
    ogImage:       product.ogImageUrl ?? product.images?.[0]?.url ?? null,
    canonical:     product.canonicalUrl ?? `${storeUrl}/products/${product.slug}`,
    noIndex:       product.noIndex ?? false,
    keywords:      product.metaKeywords ?? null,
  };
}

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
  sortOrder: number;
  children?: Collection[];
};

export type CartItem = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  price: number;              // cents
  quantity: number;
  lineTotal: number;          // cents
  imageUrl: string;
  slug: string;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;           // cents
  itemCount: number;
  discountCode?: string;
  discountAmount?: number;
  createdAt: string;
};

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  country: string;            // ISO 3166-1 alpha-2, e.g. 'LK'
  phone: string;
};

export type ShippingRate = {
  id: string;
  name: string;
  description: string;
  price: number;              // cents. 0 = free
  estimatedDays: string;
  isFree: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'delivered' | 'cancelled';
  total: number;              // cents
  subtotal: number;
  shippingCost: number;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  createdAt: string;
};

// ── API response wrapper ──────────────────────────────────
export type ApiResponse<T> = {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

// ── Helper: format LKR price from cents ──────────────────
export function formatLKR(cents: number): string {
  return `Rs ${(cents / 100).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
