import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3010;

// Resolve tenant slug dynamically
let cachedTenantSlug = process.env.WOLFCART_TENANT_SLUG || "mystore"; // default candidate
let isSlugResolved = false;

const API_KEY = process.env.WOLFCART_API_KEY || "wc_live_dfbd3238e26af5938f3017492e5318d1aba68838a387d063";
const API_URL = process.env.WOLFCART_API_URL || "https://api.wolfcart.shop";

async function resolveTenantSlug(): Promise<string> {
  if (isSlugResolved) return cachedTenantSlug;

  const candidates = [
    process.env.WOLFCART_TENANT_SLUG || "mystore",
    "xiv",
    "xiv-collections",
    "xivcollections",
    "xiv-clothing",
    "xiv-store",
    "xiv-collection",
    "kpopshop"
  ];

  console.log("[Server] Attempting to resolve WolfCart tenant slug...");
  for (const slug of candidates) {
    try {
      const url = `${API_URL}/storefront/v1/store`;
      const resp = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "x-tenant-slug": slug,
        },
      });

      if (resp.status === 200) {
        const body = await resp.json();
        const storeName = body?.data?.name || "Unknown Store";
        console.log(`[Server] Success! Found valid tenant slug: "${slug}" -> Store: "${storeName}"`);
        cachedTenantSlug = slug;
        isSlugResolved = true;
        return slug;
      } else {
        console.log(`[Server] Tested slug "${slug}": status ${resp.status}`);
      }
    } catch (e: any) {
      console.error(`[Server] Error testing slug "${slug}":`, e?.message || e);
    }
  }

  console.log(`[Server] Minimal fallback to primary candidate: "${cachedTenantSlug}"`);
  isSlugResolved = true;
  return cachedTenantSlug;
}

// Initial async resolve on startup
resolveTenantSlug().catch((err) => console.error("[Server] Handled startup resolve error:", err));

app.use(express.json());

// Proxy API routes
app.all("/api/*", async (req, res) => {
  try {
    const slug = await resolveTenantSlug();
    const subpath = req.params[0] || req.path.substring(5); // strip "/api/"

    // Construct query parameters
    const queryString = new URLSearchParams(req.query as any).toString();
    const targetUrl = `${API_URL}/storefront/v1/${subpath}${queryString ? "?" + queryString : ""}`;

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${API_KEY}`,
      "x-tenant-slug": slug,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`[Proxy] Routing ${req.method} /api/${subpath} -> ${targetUrl} (Tenant: ${slug})`);

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type");

    res.status(response.status);

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error: any) {
    console.error("[Proxy Error]:", error);
    res.status(500).json({
      error: "server_error",
      message: error?.message || "Internal gateway proxy error",
    });
  }
});

async function start() {
  // Vite dev server middlewear or custom static build serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

start();
