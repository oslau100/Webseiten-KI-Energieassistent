import type { WebsiteConfig } from "../websiteConfig";
import { customerConfigReadiness, customerRuntimeBindings } from "../customerRuntime";
import { websiteThemeTokens } from "../websiteTheme";
import type { BrandKey } from "./contract";

export type SigningBrand = { key: BrandKey; name: string; logo: string; supportEmail: string; tokens: Record<string, string> };
const names: Record<BrandKey, string> = { tarivia: "Tarivia", oecher: "Öcher Strom", demo: "DEMO", ehiogie: "Ehiogie" };

/** Presentation only; call with canonical config and server-resolved identity, never query identity.
 * No fallback logos, contact details, Location IDs or legal approval for DEMO/Ehiogie.
 */
export function resolveSigningBrand(key: BrandKey, config: WebsiteConfig, locationId?: string): SigningBrand | null {
  if (!Object.prototype.hasOwnProperty.call(names, key) || customerConfigReadiness(config, locationId) !== "READY") return null;
  if (key === "tarivia" && locationId !== customerRuntimeBindings[1].locationId) return null;
  if (key === "oecher" && locationId !== customerRuntimeBindings[0].locationId) return null;
  const brand = config.content.brand as Record<string, unknown> | undefined;
  const assets = config.design.assets as Record<string, unknown> | undefined;
  const tokens = websiteThemeTokens(config.design);
  const support = brand?.contact_email;
  if (brand?.name !== names[key] || typeof support !== "string" || !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(support) || !Object.keys(tokens).length) return null;
  return { key, name: brand.name, logo: assets.logo_header as string, supportEmail: support, tokens };
}
