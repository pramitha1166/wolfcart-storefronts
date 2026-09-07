/**
 * Cloudflare Pages middleware — SSR meta-tag injection for crawlers/bots.
 *
 * For every HTML page request this middleware:
 *  1. Fetches live store (and optionally product) data from the WolfCart API.
 *  2. Uses HTMLRewriter to replace <title> and inject <meta> / <link> tags into
 *     the static index.html before it reaches the client.
 *
 * This means Googlebot, Facebook, Twitter, etc. see fully-populated SEO tags
 * even though the storefront is a client-side SPA at runtime.
 */

interface Env {
  WOLFCART_API_KEY: string;
  WOLFCART_TENANT_SLUG: string;
  WOLFCART_API_URL: string;
}

interface PagesContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

// Paths that are never product slugs
const RESERVED_PATHS = new Set([
  "products",
  "checkout",
  "order-success",
  "about-us",
  "privacy-policy",
  "terms-conditions",
  "api",
]);

// Asset extensions — pass straight through without touching
const ASSET_EXT = /\.(js|mjs|css|png|jpg|jpeg|webp|gif|svg|ico|json|woff|woff2|ttf|otf|map|txt|xml)$/i;

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const body = (await res.json()) as any;
  return body?.data ?? null;
}

export const onRequest = async ({ request, env, next }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Pass through static assets and API proxy routes
  if (pathname.startsWith("/api/") || ASSET_EXT.test(pathname)) {
    return next();
  }

  const API_URL = env.WOLFCART_API_URL || "https://api.wolfcart.shop";
  const API_KEY = env.WOLFCART_API_KEY || "";
  const TENANT_SLUG = env.WOLFCART_TENANT_SLUG || "";

  const apiHeaders = {
    Authorization: `Bearer ${API_KEY}`,
    "x-tenant-slug": TENANT_SLUG,
  };

  // Fetch store data (always needed for base SEO)
  let store: any = null;
  let product: any = null;

  try {
    store = await fetchJson(`${API_URL}/storefront/v1/store`, apiHeaders);
  } catch {
    // Non-fatal — fall back to defaults
  }

  // Check if this looks like a product-slug URL: /<slug> or /products/<slug>
  const slugFromRoot = pathname.match(/^\/([^/]+)$/)?.[1];
  const slugFromProducts = pathname.match(/^\/products\/([^/]+)$/)?.[1];
  const candidateSlug = slugFromRoot && !RESERVED_PATHS.has(slugFromRoot)
    ? slugFromRoot
    : slugFromProducts ?? null;

  if (candidateSlug) {
    try {
      product = await fetchJson(
        `${API_URL}/storefront/v1/products/${candidateSlug}`,
        apiHeaders
      );
    } catch {
      // Not a product page — that's fine
    }
  }

  // ── Build SEO values ────────────────────────────────────────────────────────
  const storeName = store?.storeTitle || store?.name || "Online Store";
  const storeDesc =
    store?.storeDescription ||
    store?.description ||
    `Shop ${storeName}. Secure payments and fast delivery.`;
  const storeOgImage = store?.seo?.ogImageUrl || store?.logoUrl || store?.logo || "";
  const twitterHandle = store?.seo?.twitterHandle || "";

  let title = store?.seo?.metaTitle || storeName;
  let description = store?.seo?.metaDescription || storeDesc;
  let ogTitle = title;
  let ogDescription = description;
  let ogImage = storeOgImage;
  let canonical = url.origin + pathname;
  let noIndex = false;
  let ogType = "website";

  if (product) {
    ogType = "product";
    title = product.metaTitle || `${product.name} — ${storeName}`;
    description = product.metaDescription || product.description?.slice(0, 155) || storeDesc;
    ogTitle = product.ogTitle || product.metaTitle || product.name;
    ogDescription = product.ogDescription || product.metaDescription || "";
    ogImage = product.ogImageUrl || product.images?.[0]?.url || storeOgImage;
    canonical = product.canonicalUrl || `${url.origin}/${product.slug}`;
    noIndex = product.noIndex || false;
  } else if (pathname === "/products") {
    title = `All Products — ${storeName}`;
    description = `Browse all products from ${storeName}. ${storeDesc}`.trim();
    ogTitle = title;
    ogDescription = description;
  } else if (pathname === "/about-us") {
    title = `About Us — ${storeName}`;
    ogTitle = title;
  } else if (pathname === "/privacy-policy" || pathname === "/terms-conditions") {
    title = `${pathname === "/privacy-policy" ? "Privacy Policy" : "Terms & Conditions"} — ${storeName}`;
    ogTitle = title;
    noIndex = true;
  } else if (pathname === "/checkout" || pathname === "/order-success") {
    noIndex = true;
  }

  // ── Build JSON-LD structured data ──────────────────────────────────────────
  let jsonLd: string | null = null;

  if (product) {
    // Prices from API are in cents
    const priceInLKR = product.price != null ? (product.price / 100).toFixed(2) : null;
    const inStock = (product.inventory ?? product.stock ?? 1) > 0;

    const productSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.metaDescription || product.description || "",
      url: canonical,
      sku: product.sku || undefined,
    };

    if (product.images?.[0]?.url || product.ogImageUrl) {
      productSchema.image = product.images?.[0]?.url || product.ogImageUrl;
    }

    if (priceInLKR) {
      productSchema.offers = {
        "@type": "Offer",
        price: priceInLKR,
        priceCurrency: "LKR",
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: canonical,
        seller: { "@type": "Organization", name: storeName },
      };
    }

    if (product.aggregateRating?.ratingValue) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
      };
    }

    jsonLd = JSON.stringify(productSchema);
  } else if (pathname === "/" || pathname === "") {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: storeName,
      description: storeDesc,
      url: url.origin,
      ...(storeOgImage ? { image: storeOgImage } : {}),
    };
    jsonLd = JSON.stringify(orgSchema);
  }

  // ── Inject into the HTML response via HTMLRewriter ─────────────────────────
  const staticResponse = await next();
  const contentType = staticResponse.headers.get("content-type") || "";

  // Only transform HTML responses
  if (!contentType.includes("text/html")) {
    return staticResponse;
  }

  const inject = `
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="robots" content="${noIndex ? "noindex, nofollow" : "index, follow"}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${escapeAttr(storeName)}" />
    <meta property="og:title" content="${escapeAttr(ogTitle)}" />
    <meta property="og:description" content="${escapeAttr(ogDescription)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(ogTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(ogDescription)}" />
    ${ogImage ? `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />` : ""}
    ${twitterHandle ? `<meta name="twitter:site" content="${escapeAttr(twitterHandle)}" />` : ""}
    ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}`;

  return new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(escapeAttr(title));
      },
    })
    .on("head", {
      element(el) {
        el.append(inject, { html: true });
      },
    })
    .transform(staticResponse);
};
