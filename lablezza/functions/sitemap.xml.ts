/**
 * Cloudflare Pages function — dynamic sitemap.xml for merchant storefronts.
 *
 * Fetches all active products from the WolfCart API and generates a valid
 * sitemap so Google can discover every product page automatically.
 */

interface Env {
  WOLFCART_API_KEY: string;
  WOLFCART_TENANT_SLUG: string;
  WOLFCART_API_URL: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function fetchAllProducts(apiUrl: string, headers: Record<string, string>): Promise<any[]> {
  const all: any[] = []
  let page = 1
  const limit = 100

  while (true) {
    try {
      const res = await fetch(`${apiUrl}/storefront/v1/products?limit=${limit}&page=${page}`, { headers })
      if (!res.ok) break
      const body = await res.json() as any
      const items: any[] = body?.data?.items ?? body?.data ?? body?.items ?? []
      if (!items.length) break
      all.push(...items)
      if (items.length < limit) break
      page++
    } catch {
      break
    }
  }

  return all
}

export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context
  const origin = new URL(request.url).origin

  const API_URL = env.WOLFCART_API_URL || 'https://api.wolfcart.shop'
  const apiHeaders = {
    Authorization: `Bearer ${env.WOLFCART_API_KEY}`,
    'x-tenant-slug': env.WOLFCART_TENANT_SLUG,
  }

  const now = new Date().toISOString().split('T')[0]

  // Static pages every store has
  const staticUrls = [
    { loc: `${origin}/`,         changefreq: 'weekly',  priority: '1.0' },
    { loc: `${origin}/products`, changefreq: 'daily',   priority: '0.8' },
  ]

  // Fetch all product pages
  const products = await fetchAllProducts(API_URL, apiHeaders)

  const productUrls = products
    .filter((p: any) => p.slug && !p.noIndex && p.status !== 'archived')
    .map((p: any) => ({
      loc: p.canonicalUrl || `${origin}/${esc(p.slug)}`,
      changefreq: 'weekly' as const,
      priority: '0.7',
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : now,
    }))

  const allUrls = [...staticUrls, ...productUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${(u as any).lastmod || now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
