# Lablezza Storefront

Custom WolfCart storefront for **[lablezza.wolfcart.shop](https://lablezza.wolfcart.shop)** — a
luxury e-commerce store selling premium ready-to-wear, tailored menswear and womenswear, outerwear
and couture accessories.

Built on the WolfCart common storefront base (Vite + React + Tailwind), with a custom theme, copy
and demo catalog tailored to a luxury clothing retailer.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4, themed via CSS custom properties (`src/theme.ts`, `src/index.css`)
- Talks to the WolfCart Storefront API (`src/api.ts`) for store profile, collections, products, cart,
  checkout and orders
- `express` dev server (`server.ts`) proxies `/api/*` to `https://api.wolfcart.shop/storefront/v1/*`
  so the browser never needs the API key directly
- Cloudflare Pages Functions (`functions/`) provide the same proxy plus SSR meta-tag injection and
  `/sitemap.xml` in production

## Local development

```bash
cp .env.example .env
# fill in WOLFCART_API_KEY with this store's real storefront API key
npm install
npm run dev
```

The dev server resolves the tenant via `WOLFCART_TENANT_SLUG=lablezza` and proxies API calls, so the
storefront renders this merchant's real product catalog once a valid API key is set.

## Building & deploying to lablezza.wolfcart.shop

This storefront is deployed as a static bundle uploaded through the WolfCart Admin Panel (see
`apps/admin/STOREFRONT_DEPLOYMENT.md` in the main `wolfcart` repo for the full walkthrough):

```bash
npm run build:zip
```

This runs `vite build`, then zips the contents of `dist/` (with `index.html` at the zip root) into
`storefront.zip`. Upload that file via **Merchants → lablezza → Upload storefront** in the
Super-Admin panel, preview it in the sandbox iframe, then click **Make it live**.

Alternatively, `npm run deploy` pushes `dist/` straight to Cloudflare R2 using the credentials in
`.env.deploy` (copy from `.env.deploy.example`).

## Structure

- `src/data.ts` — reference/demo catalog for this store (silk gowns, tailored suiting, cashmere
  knitwear, outerwear, leather goods and footwear). Not imported at runtime — real content comes
  from the API — kept here as the source of truth for what this store sells until it's populated in
  the dashboard.
- `src/theme.ts` / `src/index.css` — default theme tokens (ink/champagne-gold palette, Cormorant
  Garamond + Jost, sharp square edges, mega-menu nav) used before `/config.js` injects the merchant's
  chosen theme at deploy time.
- `src/components/` — shared storefront UI (Navbar, ProductCard, CartDrawer, CheckoutView, etc.)
