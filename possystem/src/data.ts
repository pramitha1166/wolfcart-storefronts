import { Product, Collection, Store } from "./types";

// ── Fallback data ────────────────────────────────────────────────────────────
// Used only when the live WolfCart API is unreachable (local dev without
// credentials, or a stale preview). Real storefront content — store profile,
// collections, and the product catalog — is managed by the merchant in the
// WolfCart dashboard and served from /storefront/v1/* at runtime.

export const FALLBACK_STORE: Store = {
  name: "POS Systems",
  slug: "possystem",
  description: "Sri Lanka's one-stop shop for point-of-sale hardware and software — terminals, scanners, printers and payment devices for retail, restaurants and pharmacies.",
  logoUrl: null,
  logo: null,
  bannerEnabled: true,
  bannerImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600&auto=format&fit=crop&q=80",
  storeTitle: "Point-of-Sale Systems, Built for Business",
  storeSubtitle: "Retail & Restaurant POS Hardware",
  storeDescription: "All-in-one POS terminals, barcode scanners, receipt printers, cash drawers and card readers — in stock, with setup support and island-wide delivery.",
  navMode: 'default',
  storeEmail: "support@possystem.wolfcart.shop",
  storeAddress: "Colombo, Sri Lanka",
  storeAddresses: ["Colombo, Sri Lanka"],
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },
  footerLinks: [],
  aboutPage: "POS Systems supplies retail and restaurant businesses across Sri Lanka with point-of-sale terminals, barcode scanners, receipt printers, cash drawers and payment hardware, backed by local setup support and warranty service.",
  termsPage: "All hardware ships with manufacturer warranty. Software licenses are billed annually per register. Returns are accepted on unopened hardware within 7 days of delivery.",
  privacyPage: "Order and contact details are used only to process purchases, arrange delivery/installation and provide warranty support, and are never sold to third parties.",
  homeConfig: null,
  currency: "LKR",
  currencySymbol: "Rs",
  plan: "pro",
  customDomain: "possystem.wolfcart.shop",
  seo: {
    metaTitle: "POS Systems — Point of Sale Equipment & Software",
    metaDescription: "Shop POS terminals, barcode scanners, receipt printers, cash drawers and card readers. Island-wide delivery with setup and warranty support.",
    ogImageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=80",
    twitterHandle: "@possystem",
  }
};

export const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: "col_all",
    name: "All Products",
    slug: "all",
    description: "Browse the full POS hardware and software catalog.",
    imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80",
    productCount: 8,
    sortOrder: 1
  },
  {
    id: "col_terminals",
    name: "POS Terminals",
    slug: "pos-terminals",
    description: "All-in-one touchscreen and Android POS terminals for the counter.",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop&q=80",
    productCount: 2,
    sortOrder: 2
  },
  {
    id: "col_scanners",
    name: "Barcode Scanners",
    slug: "barcode-scanners",
    description: "Handheld and hands-free barcode scanners, wired or wireless.",
    imageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&auto=format&fit=crop&q=80",
    productCount: 2,
    sortOrder: 3
  },
  {
    id: "col_printers",
    name: "Receipt Printers",
    slug: "receipt-printers",
    description: "Fast, reliable thermal receipt printers for busy counters.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    productCount: 1,
    sortOrder: 4
  },
  {
    id: "col_cash",
    name: "Cash & Payments",
    slug: "cash-management",
    description: "Cash drawers and card payment readers for checkout.",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    productCount: 2,
    sortOrder: 5
  },
  {
    id: "col_software",
    name: "POS Software",
    slug: "pos-software",
    description: "Cloud POS software licenses for single and multi-register stores.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    productCount: 1,
    sortOrder: 6
  }
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: '15.6" All-in-One POS Terminal',
    slug: "156-all-in-one-pos-terminal",
    description: "A complete touchscreen checkout station in one unit — Windows 10 IoT, capacitive 15.6\" display, built-in customer-facing display support, and an integrated stand. Connects directly to receipt printers, scanners and cash drawers over USB.",
    price: 14500000, // Rs 145,000.00
    compareAtPrice: 16500000,
    images: [
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80", alt: "15.6 inch All-in-One POS Terminal, front view" },
      { url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&auto=format&fit=crop&q=80", alt: "POS terminal on retail counter" }
    ],
    options: [{ name: "Configuration", values: ["4GB / 64GB SSD", "8GB / 128GB SSD"] }],
    variants: [
      { id: "v_1_std", title: "4GB / 64GB SSD", price: 14500000, compareAtPrice: null, inventory: 18, sku: "POS-AIO-4-64", attributes: { Configuration: "4GB / 64GB SSD" }, imageUrl: null },
      { id: "v_1_pro", title: "8GB / 128GB SSD", price: 17500000, compareAtPrice: null, inventory: 9, sku: "POS-AIO-8-128", attributes: { Configuration: "8GB / 128GB SSD" }, imageUrl: null }
    ],
    collections: ["pos-terminals", "all"],
    inStock: true,
    totalInventory: 27,
    isFeatured: true,
    createdAt: "2026-06-01T00:00:00Z",
    metaTitle: "15.6\" All-in-One POS Terminal — POS Systems",
    metaDescription: "Windows 10 IoT touchscreen POS terminal with built-in stand, ready for printers, scanners and cash drawers.",
    metaKeywords: "pos terminal, all in one pos, touchscreen till, retail checkout system",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_2",
    name: '10.1" Android POS Terminal',
    slug: "101-android-pos-terminal",
    description: "A compact mobile checkout terminal with a built-in 58mm thermal printer, front and rear camera for scanning, and long battery life — ideal for pop-up counters, cafes and delivery pickup desks.",
    price: 8900000, // Rs 89,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80", alt: "Android POS terminal on a cafe counter" }
    ],
    options: [{ name: "Connectivity", values: ["WiFi Only", "WiFi + 4G"] }],
    variants: [
      { id: "v_2_wifi", title: "WiFi Only", price: 8900000, compareAtPrice: null, inventory: 20, sku: "POS-AND-WIFI", attributes: { Connectivity: "WiFi Only" }, imageUrl: null },
      { id: "v_2_4g", title: "WiFi + 4G", price: 10200000, compareAtPrice: null, inventory: 11, sku: "POS-AND-4G", attributes: { Connectivity: "WiFi + 4G" }, imageUrl: null }
    ],
    collections: ["pos-terminals", "all"],
    inStock: true,
    totalInventory: 31,
    isNewRelease: true,
    createdAt: "2026-06-15T00:00:00Z",
    metaTitle: "10.1\" Android POS Terminal — POS Systems",
    metaDescription: "Portable Android POS terminal with built-in thermal printer, WiFi and optional 4G.",
    metaKeywords: "android pos, mobile pos terminal, handheld checkout, portable till",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_3",
    name: "2D Handheld Barcode Scanner",
    slug: "2d-handheld-barcode-scanner",
    description: "Reads 1D and 2D barcodes (including QR codes) instantly from screens or print. Auto-sensing trigger, drop-resistant housing, and plug-and-play USB HID — no drivers required.",
    price: 1850000, // Rs 18,500.00
    compareAtPrice: 2200000,
    images: [
      { url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&auto=format&fit=crop&q=80", alt: "2D handheld barcode scanner scanning a product" }
    ],
    options: [{ name: "Connection", values: ["USB Wired", "Bluetooth Wireless"] }],
    variants: [
      { id: "v_3_usb", title: "USB Wired", price: 1850000, compareAtPrice: null, inventory: 40, sku: "SCN-2D-USB", attributes: { Connection: "USB Wired" }, imageUrl: null },
      { id: "v_3_bt", title: "Bluetooth Wireless", price: 2650000, compareAtPrice: null, inventory: 22, sku: "SCN-2D-BT", attributes: { Connection: "Bluetooth Wireless" }, imageUrl: null }
    ],
    collections: ["barcode-scanners", "all"],
    inStock: true,
    totalInventory: 62,
    isFeatured: true,
    createdAt: "2026-06-05T00:00:00Z",
    metaTitle: "2D Handheld Barcode Scanner — POS Systems",
    metaDescription: "USB and Bluetooth 2D barcode scanners for retail checkout, reads 1D, 2D and QR codes.",
    metaKeywords: "barcode scanner, 2d scanner, qr code scanner, retail scanner",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_4",
    name: "Hands-Free Barcode Scanner Stand",
    slug: "hands-free-barcode-scanner-stand",
    description: "An always-on presentation scanner that reads barcodes the moment they pass the window — no trigger needed. Built for high-throughput counters like supermarkets and pharmacies.",
    price: 3200000, // Rs 32,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80", alt: "Hands-free barcode scanner stand at checkout" }
    ],
    options: [{ name: "Color", values: ["Black", "White"] }],
    variants: [
      { id: "v_4_blk", title: "Black", price: 3200000, compareAtPrice: null, inventory: 14, sku: "SCN-STAND-BLK", attributes: { Color: "Black" }, imageUrl: null },
      { id: "v_4_wht", title: "White", price: 3200000, compareAtPrice: null, inventory: 9, sku: "SCN-STAND-WHT", attributes: { Color: "White" }, imageUrl: null }
    ],
    collections: ["barcode-scanners", "all"],
    inStock: true,
    totalInventory: 23,
    createdAt: "2026-06-08T00:00:00Z",
    metaTitle: "Hands-Free Barcode Scanner Stand — POS Systems",
    metaDescription: "Presentation-style barcode scanner for high-volume checkout counters.",
    metaKeywords: "presentation scanner, hands free scanner, supermarket scanner",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_5",
    name: "80mm Thermal Receipt Printer",
    slug: "80mm-thermal-receipt-printer",
    description: "High-speed 80mm thermal receipt printer with auto-cutter, rated for 250mm/sec print speed. Works with all major POS software over USB, LAN or Bluetooth.",
    price: 2750000, // Rs 27,500.00
    compareAtPrice: 3100000,
    images: [
      { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80", alt: "80mm thermal receipt printer printing a receipt" }
    ],
    options: [{ name: "Connectivity", values: ["USB Only", "USB + LAN + Bluetooth"] }],
    variants: [
      { id: "v_5_usb", title: "USB Only", price: 2750000, compareAtPrice: null, inventory: 25, sku: "PRN-80-USB", attributes: { Connectivity: "USB Only" }, imageUrl: null },
      { id: "v_5_full", title: "USB + LAN + Bluetooth", price: 3450000, compareAtPrice: null, inventory: 13, sku: "PRN-80-FULL", attributes: { Connectivity: "USB + LAN + Bluetooth" }, imageUrl: null }
    ],
    collections: ["receipt-printers", "all"],
    inStock: true,
    totalInventory: 38,
    isNewRelease: true,
    createdAt: "2026-06-20T00:00:00Z",
    metaTitle: "80mm Thermal Receipt Printer — POS Systems",
    metaDescription: "Fast 80mm thermal receipt printer with auto-cutter for USB, LAN and Bluetooth setups.",
    metaKeywords: "receipt printer, thermal printer, 80mm printer, pos printer",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_6",
    name: "Heavy-Duty Cash Drawer — 5 Bill / 8 Coin",
    slug: "cash-drawer-5-bill-8-coin",
    description: "A robust steel cash drawer with a 5-bill, 8-coin removable till insert, triggered directly by supported receipt printers over RJ11. Includes two keys and a media slot.",
    price: 2100000, // Rs 21,000.00
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80", alt: "Heavy-duty cash drawer with bill and coin tray" }
    ],
    options: [{ name: "Color", values: ["Black", "Grey"] }],
    variants: [
      { id: "v_6_blk", title: "Black", price: 2100000, compareAtPrice: null, inventory: 17, sku: "CD-58-BLK", attributes: { Color: "Black" }, imageUrl: null },
      { id: "v_6_gry", title: "Grey", price: 2100000, compareAtPrice: null, inventory: 10, sku: "CD-58-GRY", attributes: { Color: "Grey" }, imageUrl: null }
    ],
    collections: ["cash-management", "all"],
    inStock: true,
    totalInventory: 27,
    createdAt: "2026-06-10T00:00:00Z",
    metaTitle: "Heavy-Duty Cash Drawer — POS Systems",
    metaDescription: "Steel cash drawer with 5-bill, 8-coin tray, printer-triggered via RJ11.",
    metaKeywords: "cash drawer, till drawer, pos cash box",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_7",
    name: "EFTPOS Card Reader — Contactless & Chip and PIN",
    slug: "eftpos-card-reader",
    description: "Accept tap, chip-and-PIN and mobile wallet payments at the counter or on the move. Pairs with your POS terminal over Bluetooth or USB and syncs sales automatically.",
    price: 4500000, // Rs 45,000.00
    compareAtPrice: 5000000,
    images: [
      { url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80", alt: "Card reader accepting a contactless payment" }
    ],
    options: [{ name: "Connection", values: ["Bluetooth", "USB Wired"] }],
    variants: [
      { id: "v_7_bt", title: "Bluetooth", price: 4500000, compareAtPrice: null, inventory: 16, sku: "CARD-BT", attributes: { Connection: "Bluetooth" }, imageUrl: null },
      { id: "v_7_usb", title: "USB Wired", price: 3900000, compareAtPrice: null, inventory: 12, sku: "CARD-USB", attributes: { Connection: "USB Wired" }, imageUrl: null }
    ],
    collections: ["cash-management", "all"],
    inStock: true,
    totalInventory: 28,
    isFeatured: true,
    createdAt: "2026-06-25T00:00:00Z",
    metaTitle: "EFTPOS Card Reader — POS Systems",
    metaDescription: "Contactless and chip-and-PIN card reader for POS checkout, Bluetooth or USB.",
    metaKeywords: "card reader, eftpos, contactless payment terminal, pos card machine",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  },
  {
    id: "prod_8",
    name: "Cloud POS Software License (Annual)",
    slug: "cloud-pos-software-license-annual",
    description: "A full-featured cloud POS: inventory tracking, staff accounts, offline mode, and sales reporting from any browser. Billed annually per register with free updates and support included.",
    price: 6000000, // Rs 60,000.00 / year
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80", alt: "POS software dashboard on a terminal screen" }
    ],
    options: [{ name: "Plan", values: ["1 Register", "Multi-Register (up to 3)"] }],
    variants: [
      { id: "v_8_single", title: "1 Register", price: 6000000, compareAtPrice: null, inventory: 999, sku: "SW-LIC-1", attributes: { Plan: "1 Register" }, imageUrl: null },
      { id: "v_8_multi", title: "Multi-Register (up to 3)", price: 14500000, compareAtPrice: null, inventory: 999, sku: "SW-LIC-3", attributes: { Plan: "Multi-Register (up to 3)" }, imageUrl: null }
    ],
    collections: ["pos-software", "all"],
    inStock: true,
    totalInventory: 1998,
    createdAt: "2026-06-12T00:00:00Z",
    metaTitle: "Cloud POS Software License — POS Systems",
    metaDescription: "Annual cloud POS software license with inventory, staff accounts and reporting.",
    metaKeywords: "pos software, cloud pos, retail software license, till software",
    ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, noIndex: false
  }
];
