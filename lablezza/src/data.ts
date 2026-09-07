import { Product, Collection, Store } from "./types";

// ── Fallback data ────────────────────────────────────────────────────────────
// Used only when the live WolfCart API is unreachable (local dev without
// credentials, or a stale preview). Real storefront content — store profile,
// collections, and the product catalog — is managed by the merchant in the
// WolfCart dashboard and served from /storefront/v1/* at runtime.

export const FALLBACK_STORE: Store = {
  name: "Lablezza",
  slug: "lablezza",
  description: "An atelier of luxury ready-to-wear, tailored menswear and womenswear, and couture accessories — crafted from the finest fabrics and finished by hand.",
  logoUrl: null,
  logo: null,
  bannerEnabled: true,
  bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
  storeTitle: "Luxury, Tailored to You",
  storeSubtitle: "Ready-to-Wear & Couture",
  storeDescription: "Ready-to-wear and made-to-measure pieces cut from the finest Italian wool, Mulberry silk and full-grain leather — finished by hand in small batches for a discerning few.",
  navMode: 'default',
  storeEmail: "concierge@lablezza.wolfcart.shop",
  storeAddress: "Colombo, Sri Lanka",
  storeAddresses: ["Colombo, Sri Lanka"],
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },
  footerLinks: [],
  aboutPage: "Lablezza is a house of luxury ready-to-wear and tailoring, sourcing fabric from historic mills in Italy and Scotland and finishing every garment by hand in limited runs. Each piece is designed to be worn for decades, not seasons.",
  termsPage: "All garments are made to order or held in limited stock; sizes may be reserved for up to 48 hours. Alterations are complimentary on made-to-measure orders. Returns are accepted on unworn, tagged ready-to-wear within 14 days of delivery.",
  privacyPage: "Client details, measurements and order history are used only to fulfil purchases, arrange fittings and deliveries, and are never sold or shared with third parties.",
  homeConfig: null,
  currency: "LKR",
  currencySymbol: "Rs",
  plan: "pro",
  customDomain: "lablezza.wolfcart.shop",
  seo: {
    metaTitle: "Lablezza — Luxury Clothing & Couture",
    metaDescription: "Shop luxury ready-to-wear, tailored menswear and womenswear, outerwear and couture accessories. Complimentary alterations and white-glove island-wide delivery.",
    ogImageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
    twitterHandle: "@lablezza",
  }
};

export const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: "col_all",
    name: "All Pieces",
    slug: "all",
    description: "Browse the full Lablezza collection.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
    productCount: 8,
    sortOrder: 1
  },
  {
    id: "col_women",
    name: "Women's Ready-to-Wear",
    slug: "womens-ready-to-wear",
    description: "Silk gowns, tailored separates and eveningwear cut for a refined silhouette.",
    imageUrl: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80",
    productCount: 3,
    sortOrder: 2
  },
  {
    id: "col_men",
    name: "Men's Tailoring",
    slug: "mens-tailoring",
    description: "Made-to-measure suiting and knitwear in Italian wool and Mongolian cashmere.",
    imageUrl: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80",
    productCount: 2,
    sortOrder: 3
  },
  {
    id: "col_outerwear",
    name: "Outerwear & Coats",
    slug: "outerwear-coats",
    description: "Double-faced cashmere coats and topcoats built for cool-weather elegance.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
    productCount: 1,
    sortOrder: 4
  },
  {
    id: "col_leather",
    name: "Accessories & Leather Goods",
    slug: "accessories-leather-goods",
    description: "Full-grain leather handbags, belts and footwear, finished by hand.",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    productCount: 2,
    sortOrder: 5
  }
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Silk Charmeuse Wrap Gown",
    slug: "silk-charmeuse-wrap-gown",
    description: "Cut from 100% Mulberry silk charmeuse in a fluid bias drape, this wrap gown falls to a floor-sweeping hem with a self-tie sash. Fully lined, with hand-finished seams and mother-of-pearl closures.",
    price: 42500000, // Rs 425,000.00
    compareAtPrice: 48500000,
    images: [
      { url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&auto=format&fit=crop&q=80", alt: "Silk charmeuse wrap gown, front view" },
      { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80", alt: "Model wearing silk wrap gown" }
    ],
    options: [{ name: "Size", values: ["XS", "S", "M", "L"] }, { name: "Colour", values: ["Ivory", "Onyx"] }],
    variants: [
      { id: "v_1_s_ivory", title: "S / Ivory", price: 42500000, compareAtPrice: null, inventory: 4, sku: "LBZ-GWN-S-IVR", attributes: { Size: "S", Colour: "Ivory" }, imageUrl: null },
      { id: "v_1_m_onyx", title: "M / Onyx", price: 42500000, compareAtPrice: null, inventory: 3, sku: "LBZ-GWN-M-ONX", attributes: { Size: "M", Colour: "Onyx" }, imageUrl: null }
    ],
    collections: ["womens-ready-to-wear", "all"],
    inStock: true,
    totalInventory: 11,
    isFeatured: true,
    createdAt: "2026-06-01T00:00:00Z",
    metaTitle: "Silk Charmeuse Wrap Gown — Lablezza",
    metaDescription: "Floor-length Mulberry silk wrap gown, hand-finished with mother-of-pearl closures.",
    metaKeywords: "silk gown, evening dress, luxury gown, silk charmeuse",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_2",
    name: "Tailored Wool Blazer",
    slug: "tailored-wool-blazer",
    description: "A single-breasted blazer cut from Super 130s Italian wool with a soft, structured shoulder and horn buttons. Fully canvassed and half-lined for a lightweight, long-lasting drape.",
    price: 36500000, // Rs 365,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80", alt: "Tailored wool blazer on a mannequin" }
    ],
    options: [{ name: "Size", values: ["XS", "S", "M", "L"] }, { name: "Colour", values: ["Camel", "Charcoal"] }],
    variants: [
      { id: "v_2_s_camel", title: "S / Camel", price: 36500000, compareAtPrice: null, inventory: 5, sku: "LBZ-BLZ-S-CML", attributes: { Size: "S", Colour: "Camel" }, imageUrl: null },
      { id: "v_2_m_charcoal", title: "M / Charcoal", price: 36500000, compareAtPrice: null, inventory: 6, sku: "LBZ-BLZ-M-CHR", attributes: { Size: "M", Colour: "Charcoal" }, imageUrl: null }
    ],
    collections: ["womens-ready-to-wear", "all"],
    inStock: true,
    totalInventory: 17,
    isNewRelease: true,
    createdAt: "2026-06-15T00:00:00Z",
    metaTitle: "Tailored Wool Blazer — Lablezza",
    metaDescription: "Super 130s Italian wool blazer, fully canvassed with horn buttons.",
    metaKeywords: "wool blazer, tailored jacket, luxury blazer, womens tailoring",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_3",
    name: "Pleated Silk Midi Skirt",
    slug: "pleated-silk-midi-skirt",
    description: "Knife-pleated midi skirt in liquid silk satin, finished with a concealed waistband and side-seam pockets. Moves with every step and pairs equally well tailored or relaxed.",
    price: 21500000, // Rs 215,000.00
    compareAtPrice: 24500000,
    images: [
      { url: "https://images.unsplash.com/photo-1583496661160-fb5886a13d74?w=800&auto=format&fit=crop&q=80", alt: "Pleated silk midi skirt" }
    ],
    options: [{ name: "Size", values: ["XS", "S", "M", "L"] }, { name: "Colour", values: ["Champagne", "Emerald"] }],
    variants: [
      { id: "v_3_s_champ", title: "S / Champagne", price: 21500000, compareAtPrice: null, inventory: 7, sku: "LBZ-SKT-S-CHM", attributes: { Size: "S", Colour: "Champagne" }, imageUrl: null },
      { id: "v_3_m_emerald", title: "M / Emerald", price: 21500000, compareAtPrice: null, inventory: 5, sku: "LBZ-SKT-M-EMR", attributes: { Size: "M", Colour: "Emerald" }, imageUrl: null }
    ],
    collections: ["womens-ready-to-wear", "all"],
    inStock: true,
    totalInventory: 20,
    createdAt: "2026-06-08T00:00:00Z",
    metaTitle: "Pleated Silk Midi Skirt — Lablezza",
    metaDescription: "Knife-pleated silk satin midi skirt with concealed waistband.",
    metaKeywords: "silk skirt, pleated skirt, midi skirt, luxury skirt",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_4",
    name: "Made-to-Measure Wool Suit",
    slug: "made-to-measure-wool-suit",
    description: "A two-piece suit cut to your measurements from Loro Piana-milled wool, with a choice of peak or notch lapel and hand-stitched buttonholes. Includes one complimentary fitting.",
    price: 68500000, // Rs 685,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80", alt: "Made-to-measure wool suit on a tailor's form" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80", alt: "Detail of suit lapel stitching" }
    ],
    options: [{ name: "Lapel", values: ["Notch", "Peak"] }, { name: "Colour", values: ["Navy", "Charcoal"] }],
    variants: [
      { id: "v_4_notch_navy", title: "Notch / Navy", price: 68500000, compareAtPrice: null, inventory: 3, sku: "LBZ-SUT-NOT-NVY", attributes: { Lapel: "Notch", Colour: "Navy" }, imageUrl: null },
      { id: "v_4_peak_charcoal", title: "Peak / Charcoal", price: 72500000, compareAtPrice: null, inventory: 2, sku: "LBZ-SUT-PEAK-CHR", attributes: { Lapel: "Peak", Colour: "Charcoal" }, imageUrl: null }
    ],
    collections: ["mens-tailoring", "all"],
    inStock: true,
    totalInventory: 5,
    isFeatured: true,
    createdAt: "2026-06-20T00:00:00Z",
    metaTitle: "Made-to-Measure Wool Suit — Lablezza",
    metaDescription: "Bespoke two-piece wool suit with hand-stitched buttonholes and complimentary fitting.",
    metaKeywords: "made to measure suit, bespoke suit, wool suit, mens tailoring",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_5",
    name: "Cashmere Crewneck Sweater",
    slug: "cashmere-crewneck-sweater",
    description: "Knitted from 2-ply Grade A Mongolian cashmere in a 12-gauge gauge for a fine, close hand-feel. Ribbed collar, cuffs and hem hold their shape wash after wash.",
    price: 18500000, // Rs 185,000.00
    compareAtPrice: 21000000,
    images: [
      { url: "https://images.unsplash.com/photo-1614251055880-ee96e4803393?w=800&auto=format&fit=crop&q=80", alt: "Cashmere crewneck sweater folded" }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }, { name: "Colour", values: ["Oatmeal", "Navy"] }],
    variants: [
      { id: "v_5_m_oatmeal", title: "M / Oatmeal", price: 18500000, compareAtPrice: null, inventory: 9, sku: "LBZ-SWT-M-OAT", attributes: { Size: "M", Colour: "Oatmeal" }, imageUrl: null },
      { id: "v_5_l_navy", title: "L / Navy", price: 18500000, compareAtPrice: null, inventory: 8, sku: "LBZ-SWT-L-NVY", attributes: { Size: "L", Colour: "Navy" }, imageUrl: null }
    ],
    collections: ["mens-tailoring", "all"],
    inStock: true,
    totalInventory: 26,
    isNewRelease: true,
    createdAt: "2026-06-25T00:00:00Z",
    metaTitle: "Cashmere Crewneck Sweater — Lablezza",
    metaDescription: "2-ply Grade A Mongolian cashmere crewneck, ribbed collar and cuffs.",
    metaKeywords: "cashmere sweater, luxury knitwear, mens cashmere, crewneck",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_6",
    name: "Double-Faced Cashmere Overcoat",
    slug: "double-faced-cashmere-overcoat",
    description: "A knee-length overcoat in double-faced cashmere with a clean, seamless finish inside and out. Notched collar, horn buttons and welt pockets for cold-weather elegance.",
    price: 89500000, // Rs 895,000.00
    compareAtPrice: 98000000,
    images: [
      { url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80", alt: "Double-faced cashmere overcoat on a rack" }
    ],
    options: [{ name: "Size", values: ["S", "M", "L"] }, { name: "Colour", values: ["Camel", "Black"] }],
    variants: [
      { id: "v_6_m_camel", title: "M / Camel", price: 89500000, compareAtPrice: null, inventory: 3, sku: "LBZ-COT-M-CML", attributes: { Size: "M", Colour: "Camel" }, imageUrl: null },
      { id: "v_6_l_black", title: "L / Black", price: 89500000, compareAtPrice: null, inventory: 2, sku: "LBZ-COT-L-BLK", attributes: { Size: "L", Colour: "Black" }, imageUrl: null }
    ],
    collections: ["outerwear-coats", "all"],
    inStock: true,
    totalInventory: 5,
    isFeatured: true,
    createdAt: "2026-06-10T00:00:00Z",
    metaTitle: "Double-Faced Cashmere Overcoat — Lablezza",
    metaDescription: "Knee-length double-faced cashmere overcoat with horn buttons and welt pockets.",
    metaKeywords: "cashmere coat, overcoat, luxury outerwear, wool coat",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_7",
    name: "Full-Grain Leather Tote",
    slug: "full-grain-leather-tote",
    description: "Structured tote in vegetable-tanned full-grain leather, hand-stitched with a saddle-thread edge and solid brass hardware. Suede-lined interior with an interior zip pocket.",
    price: 32500000, // Rs 325,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80", alt: "Full-grain leather tote bag" }
    ],
    options: [{ name: "Colour", values: ["Cognac", "Black"] }],
    variants: [
      { id: "v_7_cognac", title: "Cognac", price: 32500000, compareAtPrice: null, inventory: 10, sku: "LBZ-BAG-COG", attributes: { Colour: "Cognac" }, imageUrl: null },
      { id: "v_7_black", title: "Black", price: 32500000, compareAtPrice: null, inventory: 8, sku: "LBZ-BAG-BLK", attributes: { Colour: "Black" }, imageUrl: null }
    ],
    collections: ["accessories-leather-goods", "all"],
    inStock: true,
    totalInventory: 18,
    createdAt: "2026-06-12T00:00:00Z",
    metaTitle: "Full-Grain Leather Tote — Lablezza",
    metaDescription: "Hand-stitched full-grain leather tote with solid brass hardware and suede lining.",
    metaKeywords: "leather tote, luxury handbag, full grain leather, leather goods",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_8",
    name: "Italian Leather Loafers",
    slug: "italian-leather-loafers",
    description: "Hand-lasted penny loafers in supple Italian calfskin with a leather sole and stacked heel. Made on a classic last for an elegant, all-day silhouette.",
    price: 27500000, // Rs 275,000.00
    compareAtPrice: 31000000,
    images: [
      { url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80", alt: "Italian leather penny loafers" }
    ],
    options: [{ name: "Size", values: ["40", "41", "42", "43", "44"] }, { name: "Colour", values: ["Chestnut", "Black"] }],
    variants: [
      { id: "v_8_42_chestnut", title: "42 / Chestnut", price: 27500000, compareAtPrice: null, inventory: 6, sku: "LBZ-SHO-42-CHS", attributes: { Size: "42", Colour: "Chestnut" }, imageUrl: null },
      { id: "v_8_43_black", title: "43 / Black", price: 27500000, compareAtPrice: null, inventory: 5, sku: "LBZ-SHO-43-BLK", attributes: { Size: "43", Colour: "Black" }, imageUrl: null }
    ],
    collections: ["accessories-leather-goods", "all"],
    inStock: true,
    totalInventory: 24,
    isNewRelease: true,
    createdAt: "2026-06-28T00:00:00Z",
    metaTitle: "Italian Leather Loafers — Lablezza",
    metaDescription: "Hand-lasted penny loafers in Italian calfskin with a leather sole.",
    metaKeywords: "leather loafers, italian shoes, luxury footwear, penny loafers",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  }
];
