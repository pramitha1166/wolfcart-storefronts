import { ApiResponse, Store, Product, Collection, Cart, CartItem, Order, ShippingAddress, ShippingRate } from "./types";

declare global {
  interface Window {
    __WC_CONFIG__?: {
      apiKey: string;
      tenantSlug: string;
      apiUrl?: string;
      /** Injected per-merchant at sync time; shape validated in ./theme.ts */
      theme?: unknown;
    };
  }
}

// Runtime config (injected via /config.js at deploy time) takes priority over build-time env vars.
const _rt = typeof window !== "undefined" ? window.__WC_CONFIG__ : undefined;
const STATIC_MODE = !!(_rt?.apiKey || import.meta.env.VITE_WOLFCART_API_KEY);
const BASE_URL = STATIC_MODE
  ? `${_rt?.apiUrl || import.meta.env.VITE_WOLFCART_API_URL || "https://api.wolfcart.shop"}/storefront/v1`
  : "/api";
const _apiKey = _rt?.apiKey || import.meta.env.VITE_WOLFCART_API_KEY || "";
const _tenantSlug = _rt?.tenantSlug || import.meta.env.VITE_WOLFCART_TENANT_SLUG || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (STATIC_MODE) {
    headers["Authorization"] = `Bearer ${_apiKey}`;
    headers["x-tenant-slug"] = _tenantSlug;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `API error (${response.status})`);
  }

  const json = await response.json();
  return (json.data ?? json) as T;
}

function normalizeCart(raw: any): Cart {
  const items: CartItem[] = (raw.items || []).map((item: any) => ({
    id: item.id || item.variantId,
    variantId: item.variantId,
    productId: item.productId,
    productName: item.productName || item.name || "",
    variantTitle: item.variantTitle || item.variantName || "",
    price: item.price,
    quantity: item.quantity,
    lineTotal: item.lineTotal ?? item.totalPrice ?? item.price * item.quantity,
    imageUrl: item.imageUrl || "",
    slug: item.slug || "",
  }));

  return {
    id: raw.id || raw.cartId,
    items,
    subtotal: raw.subtotal ?? raw.total ?? 0,
    itemCount: raw.itemCount ?? items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

async function requestCart(path: string, options: RequestInit = {}): Promise<Cart> {
  const raw = await request<any>(path, options);
  return normalizeCart(raw);
}

export const api = {
  getStore: () => request<Store>("/store"),

  getSpotlightProducts: () =>
    request<{ featured: Product | null; newRelease: Product | null }>("/products/spotlight"),

  getProducts: (params: {
    limit?: number;
    page?: number;
    sort?: string;
    collection?: string;
    q?: string;
    inStock?: boolean;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.page) query.set("page", String(params.page));
    if (params.sort) query.set("sort", params.sort);
    if (params.collection) query.set("collection", params.collection);
    if (params.q) query.set("q", params.q);
    if (params.inStock !== undefined) query.set("inStock", String(params.inStock));

    const queryStr = query.toString();
    return request<Product[]>(`/products${queryStr ? "?" + queryStr : ""}`);
  },

  getProduct: (slug: string) => request<Product>(`/products/${slug}`),

  getCollections: () => request<Collection[]>("/collections"),

  getCollection: (slug: string) => request<Collection>(`/collections/${slug}`),

  createCart: () => requestCart("/cart", { method: "POST" }),

  getCart: (cartId: string) => requestCart(`/cart/${cartId}`),

  addToCart: (cartId: string, variantId: string, quantity: number = 1) =>
    requestCart(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    }),

  updateCartItem: (cartId: string, variantId: string, quantity: number) =>
    requestCart(`/cart/${cartId}/items/${variantId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (cartId: string, variantId: string) =>
    requestCart(`/cart/${cartId}/items/${variantId}`, {
      method: "DELETE",
    }),

  getCheckoutConfig: () => request<any>("/checkout/config"),

  initiatePayment: (orderId: string, paymentMethod: string) =>
    request<any>("/checkout/initiate", {
      method: "POST",
      body: JSON.stringify({ orderId, paymentMethod }),
    }),

  applyCoupon: (cartId: string, code: string) =>
    requestCart(`/cart/${cartId}/apply-coupon`, {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  removeCoupon: (cartId: string) =>
    requestCart(`/cart/${cartId}/remove-coupon`, {
      method: "POST",
    }),

  createOrder: (orderData: {
    cartId: string;
    email: string;
    shippingAddress: ShippingAddress;
    shippingMethodId: string;
    paymentReference?: string;
    note?: string;
  }) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  getOrder: (orderId: string) => request<Order>(`/orders/${orderId}`),

  getReviews: (slug: string) => request<any>(`/products/${slug}/reviews`),

  submitReview: (
    slug: string,
    review: {
      rating: number;
      reviewerName: string;
      reviewerEmail: string;
      title?: string;
      body?: string;
      orderId?: string;
    }
  ) =>
    request<any>(`/products/${slug}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    }),

  getShippingRates: async (
    cartId: string,
    address: { country: string; city: string; postalCode: string },
    cartSubtotalCents: number,
    itemCount: number
  ) => {
    const rawRates = await request<any[]>("/shipping/rates", {
      method: "POST",
      body: JSON.stringify({
        cartId,
        address,
        cartSubtotalCents,
        itemCount,
      }),
    });
    return rawRates.map((rate) => ({
      id: rate.id,
      name: rate.name,
      description: rate.description || "",
      price: rate.price !== undefined ? rate.price : (rate.amountCents ?? 0),
      estimatedDays: rate.estimatedDays || "",
      isFree: rate.isFree ?? (rate.price === 0 || rate.amountCents === 0),
    })) as ShippingRate[];
  },
};
