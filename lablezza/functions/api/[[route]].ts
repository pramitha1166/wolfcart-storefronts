interface Env {
  WOLFCART_API_KEY: string;
  WOLFCART_TENANT_SLUG: string;
  WOLFCART_API_URL: string;
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}) => {
  const { request, env, params } = context;
  const url = new URL(request.url);

  const subpath = (params.route as string[]).join("/");
  const API_KEY = env.WOLFCART_API_KEY;
  const API_URL = env.WOLFCART_API_URL || "https://api.wolfcart.shop";
  const TENANT_SLUG = env.WOLFCART_TENANT_SLUG;

  const targetUrl = `${API_URL}/storefront/v1/${subpath}${url.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "x-tenant-slug": TENANT_SLUG,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
  });

  const contentType = upstream.headers.get("Content-Type") || "application/json";
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
};
