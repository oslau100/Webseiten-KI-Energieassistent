import { describe, expect, it } from "vitest";
import { customerConfigReadiness, customerRuntimeBindings, resolveCustomerIdentity } from "./customerRuntime";
import { resolveWebsiteRuntime } from "./websiteRuntime";

const config = () => ({
  content: { legal: { ready: true, variables: { firma: "Test fixture", email: "fixture@example.test" } } },
  design: { assets: { logo_header: "/fixture.svg", logo_footer: "/fixture.svg", hero_image: "https://assets.example.test/fixture.png" } },
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
});
