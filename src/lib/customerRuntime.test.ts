import { describe, expect, it } from "vitest";
import { customerConfigReadiness, customerRuntimeBindings, customerPublicAssetOrigin, isTrustedCustomerPublicAsset, resolveCustomerIdentity } from "./customerRuntime";
import { resolveWebsiteRuntime } from "./websiteRuntime";

const config = () => ({
  content: { legal: { ready: true, variables: { firma: "Test fixture", email: "fixture@example.test" } } },
  design: { assets: { logo_header: "/fixture.svg", logo_footer: "/fixture.svg", hero_image: "/fixture.png" } },
  layout: { pages: {} },
});
describe("customer runtime binding", () => {
  for (const binding of customerRuntimeBindings) {
    it(`binds ${binding.hostname} only to its explicit runtime tenant`, () => {
      expect(resolveCustomerIdentity(binding.locationId, binding.hostname)).toMatchObject({ customer: true, ready: true });
      for (const locationId of ["", "other", ...customerRuntimeBindings.filter(b => b !== binding).map(b => b.locationId)]) {
        const runtime = resolveWebsiteRuntime({ hostname: binding.hostname, bootstrap: { locationId }, env: {}, development: false, search: `?location_id=${binding.locationId}` });
        expect(runtime.identity).toMatchObject({ customer: true, ready: false });
        expect(runtime.locationId).toBe("");
      }
    });
    it(`requires an exact explicitly configured preview host for ${binding.locationId}`, () => {
      expect(resolveCustomerIdentity(binding.locationId, "branch.project.pages.dev", "branch.project.pages.dev").ready).toBe(true);
      expect(resolveCustomerIdentity(binding.locationId, "other.project.pages.dev", "branch.project.pages.dev").ready).toBe(false);
      expect(resolveCustomerIdentity(binding.locationId, "attacker.test", "attacker.test").ready).toBe(false);
      expect(resolveCustomerIdentity(binding.locationId, "localhost", "", false).ready).toBe(false);
      expect(resolveCustomerIdentity(binding.locationId, "localhost", "", true).ready).toBe(true);
    });
  }
  it("rejects bootstrap/build tenant disagreement", () => {
    const runtime = resolveWebsiteRuntime({ hostname: "app.oecher-strom.de", bootstrap: { locationId: customerRuntimeBindings[0].locationId }, env: { VITE_LOCATION_ID: customerRuntimeBindings[1].locationId }, development: false });
    expect(runtime.identity.ready).toBe(false);
  });
  it("does not fall back to generic content when a configured customer preview is missing its tenant", () => {
    expect(resolveCustomerIdentity("", "branch.project.pages.dev", "branch.project.pages.dev")).toMatchObject({ customer: true, ready: false });
    expect(resolveWebsiteRuntime({ hostname: "localhost", env: { VITE_LOCATION_ID: customerRuntimeBindings[0].locationId }, bootstrap: { locationId: "<invalid>" }, development: true }).identity).toMatchObject({ customer: true, ready: false });
  });
  it("preserves unrelated foundation runtimes", () => expect(resolveCustomerIdentity("other", "other.test")).toEqual({ customer: false, ready: true }));
});
describe("actual customer config readiness", () => {
  it("requires all actual buckets", () => {
    for (const bucket of ["content", "design", "layout"] as const) expect(customerConfigReadiness({ ...config(), [bucket]: {} })).toBe("CONFIG_NOT_READY");
  });
  it.each([false, "true", 1, null, undefined])("requires explicit legal approval (%j)", ready => {
    const value = config();
    Object.assign(value.content.legal, { ready });
    expect(customerConfigReadiness(value)).toBe("LEGAL_NOT_READY");
  });
  it.each(["logo_header", "logo_footer", "hero_image"])("requires a usable %s reference", key => {
    const value = config();
    Object.assign(value.design.assets, { [key]: "" });
    expect(customerConfigReadiness(value)).toBe("ASSETS_NOT_READY");
    Object.assign(value.design.assets, { [key]: "javascript:alert(1)" });
    expect(customerConfigReadiness(value)).toBe("ASSETS_NOT_READY");
  });
  it("accepts only actual supplied configuration", () => expect(customerConfigReadiness(config())).toBe("READY"));
  it.each([
    "https://unrelated.example.test/hero.png",
    "https://unrelated.example.test/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/hero-angled.jpeg",
    "https://app.oecher-strom.de/hero.png",
    "https://app.oecher-strom.de@unrelated.example.test/hero.png",
    "//unrelated.example.test/hero.png",
    "/\\unrelated.example.test/hero.png",
    "/%2funrelated.example.test/hero.png",
    "/locations%252Fother/hero.png",
    "/hero.png?redirect=https://unrelated.example.test",
    "/hero.png#unverified",
    "/hero%ZZ.png",
    "supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/hero-angled.jpeg",
  ])("does not mistake an unapproved reference for verified Storage delivery: %s", reference => {
    const value = config();
    value.design.assets.hero_image = reference;
    expect(customerConfigReadiness(value, customerRuntimeBindings[0].locationId)).toBe("ASSETS_NOT_READY");
  });
});

describe("explicit Supabase public asset references", () => {
  for (const binding of customerRuntimeBindings) {
    const other = customerRuntimeBindings.find(item => item !== binding)!;
    const prefix = `${customerPublicAssetOrigin}/storage/v1/object/public/website-assets/locations/${binding.locationId}/t08/v1/`;
    const url = prefix + "hero-angled.jpeg";
    it(`accepts only the manifest files for ${binding.hostname}`, () => {
      const files = binding === customerRuntimeBindings[0]
        ? ["logo.png", "hero-angled.jpeg", "section-straight.jpeg", "about.webp"]
        : ["logo.jpg", "hero-angled.jpeg", "section-straight.jpeg", "about.png"];
      for (const file of files) expect(isTrustedCustomerPublicAsset(prefix + file, binding.locationId)).toBe(true);
      for (const location of [undefined, "", "other", "toString", "__proto__", other.locationId]) {
        expect(isTrustedCustomerPublicAsset(url, location)).toBe(false);
      }
      const value = config();
      for (const key of ["logo_header", "logo_footer", "hero_image"]) Object.assign(value.design.assets, { [key]: url });
      expect(customerConfigReadiness(value, binding.locationId)).toBe("READY");
      value.content.legal.ready = false;
      expect(customerConfigReadiness(value, binding.locationId)).toBe("LEGAL_NOT_READY");
    });
    it.each([
      url.replace("https:", "http:"),
      url.replace(".supabase.co", ".supabase.co.evil.test"),
      url.replace("oynhnhkldvpoqhsfirwf", "other-project"),
      url.replace("https://", "https://user:password@"),
      url.replace(".co/", ".co:443/"),
      url.replace(".co/", ".co:8443/"),
      url.replace("website-assets", "crm-assets"),
      url.replace(binding.locationId, other.locationId),
      url.replace(binding.locationId, "unknown-location"),
      url.replace("/t08/v1/", "/t08/v2/"),
      url.replace("/t08/v1/", "/"),
      prefix + "not-in-manifest.png",
      prefix + "../v1/hero-angled.jpeg",
      prefix + "%2e%2e/v1/hero-angled.jpeg",
      prefix + "%252e%252e/v1/hero-angled.jpeg",
      url.replace("/locations/", "/locations%2f"),
      url.replace("hero-angled", "%68ero-angled"),
      url.replace("hero-angled", "hero%ZZangled"),
      url.replace("/t08/", "//t08/"),
      url.replace("/t08/", "\\\\t08/"),
      url + "?download=1", url + "?", url + "#", url + "#fragment",
      " " + url, url + "\\n", url.replace("https:", ""),
      url.replace("https:", "supabase-storage:"),
    ])(`rejects manipulated references for ${binding.hostname}: %s`, reference => {
      expect(isTrustedCustomerPublicAsset(reference, binding.locationId)).toBe(false);
      const value = config();
      value.design.assets.hero_image = reference;
      expect(customerConfigReadiness(value, binding.locationId)).toBe("ASSETS_NOT_READY");
      for (const optional of [
        { sections: { solution: { image_url: reference } } },
        { sections: { about: { image_url: { de: url, en: reference } } } },
        { seo: { image_url: reference } },
      ]) {
        const withOptional = config();
        Object.assign(withOptional.content, optional);
        expect(customerConfigReadiness(withOptional, binding.locationId)).toBe("ASSETS_NOT_READY");
      }
      const agency = config();
      Object.assign(agency.design.assets, { agency_logo: reference });
      expect(customerConfigReadiness(agency, binding.locationId)).toBe("ASSETS_NOT_READY");
    });
  }
});
