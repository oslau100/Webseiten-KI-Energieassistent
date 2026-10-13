import type { WebsiteConfig } from "./websiteConfig";

export const customerRuntimeBindings = [
  { locationId: "NPhuVMAaBPQz6OhIPpkj", hostname: "app.oecher-strom.de" },
  { locationId: "uGJsQ3CWvFTraTfrRgjC", hostname: "www.tarivia.de" },
] as const;

export type CustomerIdentity = {
  customer: boolean;
  ready: boolean;
  reason?: "IDENTITY_NOT_READY";
};

/** Presentation binding only. Server authorization and preview authentication remain separate. */
export function resolveCustomerIdentity(locationId: string, hostname: string, previewHostname = "", development = false): CustomerIdentity {
  const host = hostname.toLowerCase();
  const byHost = customerRuntimeBindings.find(binding => binding.hostname === host);
  const byTenant = customerRuntimeBindings.find(binding => binding.locationId === locationId);
  const preview = previewHostname.toLowerCase();
  const previewMatches = preview === host && /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.pages\.dev$/.test(preview);
  if (!byHost && !byTenant && !previewMatches) return { customer: false, ready: true };
  const local = development && ["localhost", "127.0.0.1", "[::1]"].includes(host);
  const ready = Boolean(byTenant && (byHost === byTenant || (!byHost && (previewMatches || local))));
  return { customer: true, ready, ...(!ready ? { reason: "IDENTITY_NOT_READY" as const } : {}) };
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const populated = (value: unknown) => typeof value === "string" && Boolean(value.trim());
// Explicit code-owned trust; never derive this from customer JSON or bootstrap URLs.
export const customerPublicAssetOrigin = "https://oynhnhkldvpoqhsfirwf.supabase.co";
const customerPublicAssetFiles: Record<string, readonly string[]> = {
  NPhuVMAaBPQz6OhIPpkj: ["logo.png", "hero-angled.jpeg", "section-straight.jpeg", "about.webp"],
  uGJsQ3CWvFTraTfrRgjC: ["logo.jpg", "hero-angled.jpeg", "section-straight.jpeg", "about.png"],
};

/** Exact canonical references only; does not establish object existence or release approval. */
export function isTrustedCustomerPublicAsset(value: unknown, locationId?: string): boolean {
  if (typeof value !== "string" || !locationId || !Object.prototype.hasOwnProperty.call(customerPublicAssetFiles, locationId)) return false;
  const prefix = `${customerPublicAssetOrigin}/storage/v1/object/public/website-assets/locations/${locationId}/t08/v1/`;
  // Full equality rejects credentials, ports, query/hash, encoding and URL-parser normalization.
  return customerPublicAssetFiles[locationId].some(filename => value === prefix + filename);
}

const asset = (value: unknown) => {
  if (!populated(value)) return false;
  if (typeof value !== "string") return false;
  // Preserve existing same-origin references; external URLs use the exact allowlist below.
  if (!/^\/(?!\/)/.test(value) || /[\\\s]/.test(value) || /%(?:2f|5c|25)/i.test(value)) return false;
  try {
    const url = new URL(value, "https://asset-validation.invalid");
    decodeURIComponent(url.pathname); // Reject malformed escaping as well.
    return url.origin === "https://asset-validation.invalid" && !url.search && !url.hash;
  } catch { return false; }
};

// Reference validation only: neither URL ownership nor object delivery is proven here.
const isolatedAsset = (value: unknown, locationId?: string): boolean => {
  if (isTrustedCustomerPublicAsset(value, locationId)) return true;
  if (!asset(value)) return false;
  if (!locationId) return true;
  try {
    const path = decodeURIComponent(new URL(value as string, "https://asset-validation.invalid").pathname);
    const segments = path.split("/");
    if (customerRuntimeBindings.some(binding => binding.locationId !== locationId && segments.includes(binding.locationId))) return false;
    const namespace = segments.indexOf("locations");
    return namespace === -1 || segments[namespace + 1] === locationId;
  } catch { return false; }
};

const optionalAsset = (value: unknown, locationId?: string): boolean => {
  if (value === undefined || value === null || value === "") return true;
  // Content image fields can be localized; every supplied translation must qualify.
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(record(value)).every(item => typeof item === "string" && (item === "" || isolatedAsset(item, locationId)));
  }
  return isolatedAsset(value, locationId);
};

/** Configuration-reference prerequisites only, never proof of delivery or Storage authorization. */
export function customerConfigReadiness(config: WebsiteConfig, locationId?: string): "READY" | "CONFIG_NOT_READY" | "LEGAL_NOT_READY" | "ASSETS_NOT_READY" {
  if (![config.content, config.design, config.layout].every(bucket => Object.keys(bucket).length > 0)) return "CONFIG_NOT_READY";
  const legal = record(config.content.legal);
  const variables = record(legal.variables);
  if (legal.ready !== true || !populated(variables.firma) || !populated(variables.email)) return "LEGAL_NOT_READY";
  const assets = record(config.design.assets);
  if (!["logo_header", "logo_footer", "hero_image"].every(key => isolatedAsset(assets[key], locationId))) return "ASSETS_NOT_READY";
  const sections = record(config.content.sections);
  const optionalImages = [assets.agency_logo, record(config.content.seo).image_url,
    record(sections.solution).image_url, record(sections.about).image_url];
  if (!optionalImages.every(value => optionalAsset(value, locationId))) return "ASSETS_NOT_READY";
  return "READY";
}
