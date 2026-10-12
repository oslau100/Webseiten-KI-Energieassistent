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
const asset = (value: unknown) => {
  if (!populated(value)) return false;
  if (typeof value !== "string") return false;
  if (/^\/(?!\/)/.test(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};

/** Uses actual config buckets, never repository defaults or inferred legal approval. */
export function customerConfigReadiness(config: WebsiteConfig): "READY" | "CONFIG_NOT_READY" | "LEGAL_NOT_READY" | "ASSETS_NOT_READY" {
  if (![config.content, config.design, config.layout].every(bucket => Object.keys(bucket).length > 0)) return "CONFIG_NOT_READY";
  const legal = record(config.content.legal);
  const variables = record(legal.variables);
  if (legal.ready !== true || !populated(variables.firma) || !populated(variables.email)) return "LEGAL_NOT_READY";
  const assets = record(config.design.assets);
  if (!["logo_header", "logo_footer", "hero_image"].every(key => asset(assets[key]))) return "ASSETS_NOT_READY";
  return "READY";
}
