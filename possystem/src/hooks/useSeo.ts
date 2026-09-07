import { useEffect } from "react";
import { Store, Product, resolveProductSeo } from "../types";

type View =
  | "home"
  | "products"
  | "pdp"
  | "checkout"
  | "order-success"
  | "about-us"
  | "privacy-policy"
  | "terms-conditions";

interface UseSeoOptions {
  view: View;
  storeInfo: Store | null;
  product?: Product | null;
}

function setMeta(nameOrProp: string, value: string, attribute: "name" | "property" = "name") {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeo({ view, storeInfo, product }: UseSeoOptions) {
  useEffect(() => {
    if (!storeInfo) return;

    const storeName = storeInfo.storeTitle || storeInfo.name || "Online Store";
    const storeDesc =
      storeInfo.storeDescription ||
      storeInfo.description ||
      `Shop ${storeName}. Secure payments and fast delivery.`;
    const storeUrl = window.location.origin;
    const storeOgImage = storeInfo.seo?.ogImageUrl || storeInfo.logoUrl || storeInfo.logo || "";
    const twitterHandle = storeInfo.seo?.twitterHandle || "";

    let title = storeName;
    let description = storeDesc;
    let ogTitle = storeName;
    let ogDescription = storeDesc;
    let ogImage = storeOgImage;
    let canonical = storeUrl + window.location.pathname;
    let noIndex = false;

    if (view === "pdp" && product) {
      const seo = resolveProductSeo(product, storeUrl, storeName);
      title = seo.title;
      description = seo.description;
      ogTitle = seo.ogTitle;
      ogDescription = seo.ogDescription;
      ogImage = seo.ogImage || storeOgImage;
      canonical = seo.canonical;
      noIndex = seo.noIndex;
    } else if (view === "products") {
      title = `All Products — ${storeName}`;
      description = `Browse all products from ${storeName}. ${storeDesc}`;
      ogTitle = title;
      ogDescription = description;
    } else if (view === "checkout") {
      title = `Checkout — ${storeName}`;
      noIndex = true;
    } else if (view === "order-success") {
      title = `Order Confirmed — ${storeName}`;
      noIndex = true;
    } else if (view === "about-us") {
      title = `About Us — ${storeName}`;
      description = storeInfo.aboutPage?.slice(0, 155) || `Learn more about ${storeName}.`;
      ogTitle = title;
      ogDescription = description;
    } else if (view === "privacy-policy") {
      title = `Privacy Policy — ${storeName}`;
      ogTitle = title;
      noIndex = true;
    } else if (view === "terms-conditions") {
      title = `Terms & Conditions — ${storeName}`;
      ogTitle = title;
      noIndex = true;
    } else {
      // home — use store-level SEO overrides if set
      if (storeInfo.seo?.metaTitle) title = storeInfo.seo.metaTitle;
      if (storeInfo.seo?.metaDescription) description = storeInfo.seo.metaDescription;
      ogTitle = title;
      ogDescription = description;
    }

    document.title = title;

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("og:title", ogTitle, "property");
    setMeta("og:description", ogDescription, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:type", view === "pdp" ? "product" : "website", "property");
    setMeta("og:site_name", storeName, "property");
    if (ogImage) setMeta("og:image", ogImage, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle);
    setMeta("twitter:description", ogDescription);
    if (ogImage) setMeta("twitter:image", ogImage);
    if (twitterHandle) setMeta("twitter:site", twitterHandle);

    setCanonical(canonical);
  }, [view, storeInfo, product]);
}
