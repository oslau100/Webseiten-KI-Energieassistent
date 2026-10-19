import { isTrustedCustomerPublicAsset } from "@/lib/customerRuntime";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { useI18n } from "@/lib/i18n";

export const WebsiteMetadata = () => {
  const { getText, customerRuntime, readiness, loading, tenant, design } = useWebsiteConfig();
  const { lang } = useI18n();
  const { pathname } = useLocation();
  const title = getText("seo.title", getText("brand.name", "Energieassistent"), lang);
  const description = getText("seo.description", "Strom- und Gastarife sowie Jahresrechnungen verständlich prüfen.", lang);
  const siteUrl = getText("seo.site_url", "").trim();
  const image = getText("seo.image_url", "").trim();

  const assets = design?.assets as Record<string, unknown> | undefined;
  const favicon = customerRuntime && readiness === "READY" && !loading
    ? [assets?.favicon, assets?.logo_header].find(value =>
      typeof value === "string" && value.endsWith(".png") && isTrustedCustomerPublicAsset(value, tenant?.locationId))
    : undefined;

  useEffect(() => {
    if (!customerRuntime) return;
    // Never retain a generic or previous tenant icon for a customer context.
    document.head.querySelectorAll('link[rel="icon"]').forEach(node => node.remove());
    if (typeof favicon !== "string") return;
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = favicon;
    document.head.append(link);
    return () => link.remove();
  }, [customerRuntime, favicon]);

  useEffect(() => {
    document.title = title;
    const setMeta = (attribute: "name" | "property", key: string, value: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!value) { existing?.remove(); return; }
      const meta = existing || document.createElement("meta");
      meta.setAttribute(attribute, key);
      meta.content = value;
      if (!existing) document.head.append(meta);
    };
    let canonical = "";
    try {
      const url = new URL(siteUrl);
      if (url.protocol === "https:") canonical = new URL(pathname, url.origin).href;
    } catch { /* Omit a canonical URL until the customer's domain is configured. */ }
    const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const link = existing || document.createElement("link");
      link.rel = "canonical";
      link.href = canonical;
      if (!existing) document.head.append(link);
    } else existing?.remove();
    setMeta("name", "description", description);
    setMeta("name", "author", getText("brand.name", "Energieassistent"));
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  }, [title, description, siteUrl, image, pathname, getText]);

  return null;
};
