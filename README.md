# WolfCart Storefronts

Source repo for custom, per-merchant WolfCart storefronts — built individually (as opposed to the
generic, dashboard-themed template) and uploaded through the **WolfCart Admin Panel** as a static
`storefront.zip` bundle.

Each merchant that needs a bespoke storefront gets its own top-level folder here, built from the
WolfCart common storefront base (Vite + React + Tailwind, talking to the WolfCart Storefront API)
and customized with its own theme, copy and catalog.

## Storefronts

| Folder | Domain | Description |
|---|---|---|
| [`possystem/`](./possystem) | [possystem.wolfcart.shop](https://possystem.wolfcart.shop) | POS terminals, barcode scanners, receipt printers, cash drawers, card readers and POS software. |
| [`lablezza/`](./lablezza) | [lablezza.wolfcart.shop](https://lablezza.wolfcart.shop) | Luxury ready-to-wear, tailored menswear and womenswear, outerwear and couture accessories. |

## Adding a new storefront

1. Copy an existing storefront folder (or the base template from `wolfcart-common-template`) into a
   new top-level folder named after the merchant.
2. Update `package.json` name, `wrangler.toml` name, `.env.example` tenant slug, `index.html` /
   `metadata.json` title & description, and `src/theme.ts` / `src/index.css` for the merchant's brand.
3. Replace the placeholder catalog in `src/data.ts` with the merchant's actual product lineup (used
   for reference only — the live storefront always fetches real data from the WolfCart API).
4. `npm install && npm run dev` to preview locally against the merchant's real store data
   (`WOLFCART_TENANT_SLUG` + `WOLFCART_API_KEY` in `.env`).
5. `npm run build:zip` to produce `storefront.zip`, then upload it via **Admin Panel → Merchants →
   [merchant] → Upload storefront** (see `apps/admin/STOREFRONT_DEPLOYMENT.md` in the main
   `wolfcart` repo for the full deploy/preview/activate flow).
6. Add a row to the table above.

## Related repos

- [`wolfcart`](https://github.com/pramitha1166/wolfcart) — the main platform monorepo (admin, api,
  editor, platform dashboard, router).
- [`wolfcart-common-template`](https://github.com/pramitha1166/wolfcart-common-template) — the
  reusable base storefront that every custom storefront in this repo starts from.
- [`wolfcart-boilerplate`](https://github.com/pramitha1166/wolfcart-boilerplate) — an earlier
  storefront boilerplate, kept for reference.
