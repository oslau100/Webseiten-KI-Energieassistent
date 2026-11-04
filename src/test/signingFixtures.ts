import type { SigningManifest, BrandKey } from "@/lib/signing/contract";
import type { WebsiteConfig } from "@/lib/websiteConfig";

// Synthetic UI examples only. No canonical Location, legal approval or real contract claim.
export const fixtureHash = "a".repeat(64);
export function signingFixture(brand: BrandKey = "demo"): SigningManifest {
  return {
    sessionId: "synthetic-session", snapshotHash: fixtureHash, requirementVersion: "synthetic-v1",
    expiresAt: "2099-01-01T00:00:00Z", mode: "TEST_ONLY", brand,
    document: { id: "synthetic-document", sha256: fixtureHash, language: "de" },
    participants: [
      { id: "synthetic-customer", displayName: "TEST PERSON A", role: "customer" },
      { id: "synthetic-account-holder", displayName: "TEST PERSON B", role: "account_holder" },
    ],
    requirements: [
      { id: "synthetic-contract", participantId: "synthetic-customer", slot: "contract_signature", text: "TEST_ONLY · Beispiel Vertrag / not a legal declaration", textLanguage: "de", textHash: fixtureHash, required: true, capture: "person" },
      { id: "synthetic-price", participantId: "synthetic-customer", slot: "tariff_price_confirmation_signature", text: "TEST_ONLY · Beispiel Preisbestätigung / not a legal declaration", textLanguage: "de", textHash: fixtureHash, required: true, capture: "person" },
      { id: "synthetic-sepa", participantId: "synthetic-account-holder", slot: "sepa_mandate_signature", text: "TEST_ONLY · Beispiel SEPA / not a legal declaration", textLanguage: "de", textHash: fixtureHash, required: true, capture: "person" },
    ],
  };
}
export function signingBrandFixture(key: BrandKey): WebsiteConfig {
  // These neutral tokens and mock legal fields are NOT a claim about Ehiogie/DEMO branding.
  return {
    content: { brand: { name: { tarivia: "Tarivia", oecher: "Öcher Strom", demo: "DEMO", ehiogie: "Ehiogie" }[key], contact_email: "support@example.test" },
      legal: { ready: true, variables: { firma: "SYNTHETIC TEST ONLY", email: "support@example.test" } } },
    design: { colors: { primary: "#2563eb", background: "#ffffff", text: "#0f172a" }, assets: { logo_header: "/synthetic-logo.svg", logo_footer: "/synthetic-logo.svg", hero_image: "/synthetic-image.svg" } },
    layout: { pages: {} },
  };
}
