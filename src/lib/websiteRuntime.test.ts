import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeLoaderBootstrap, isPublicSupabaseKey, resolveWebsiteRuntime } from "./websiteRuntime";

const resolve = (bootstrap = {}, env = {}, search = "", development = false) => resolveWebsiteRuntime({ bootstrap, env, search, development });
afterEach(() => { vi.unstubAllEnvs(); delete window.TB_BOOTSTRAP; delete window.WEBSITE_LOADER_BOOTSTRAP; });

describe("Location resolution", () => {
  it("has no implicit customer Location", () => expect(resolve().locationId).toBe(""));
  it("prefers bootstrap, then build Location, then a development-only query", () => {
    expect(resolve({ locationId: "explicit" }, { VITE_LOCATION_ID: "built" }, "?location_id=query", true).locationId).toBe("explicit");
    expect(resolve({}, { VITE_LOCATION_ID: "built" }, "?location_id=query", true).locationId).toBe("built");
    expect(resolve({}, {}, "?location_id=query", true).locationId).toBe("query");
    expect(resolve({}, {}, "?locationId=query", true).locationId).toBe("query");
    expect(resolve({}, {}, "?location_id=query").locationId).toBe("");
  });
  it.each(["<LOCATION_ID>", "placeholder", "undefined", "null", "bad.id", "bad id", "x".repeat(129)])("fails closed for invalid selected value %s", (locationId) => {
    expect(resolve({ locationId }, { VITE_LOCATION_ID: "different-customer" }).locationId).toBe("");
  });
  it("trims an explicit Location", () => expect(resolve({ locationId: "  valid-location  " }).locationId).toBe("valid-location"));
  it("allows only publishable or legacy anon keys", () => {
    const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ role })).replace(/=/g, "")}.signature`;
    expect(isPublicSupabaseKey("sb_publishable_test")).toBe(true);
    expect(isPublicSupabaseKey(jwt("anon"))).toBe(true);
    expect(isPublicSupabaseKey(jwt("service_role"))).toBe(false);
    expect(isPublicSupabaseKey("sb_secret_test")).toBe(false);
    expect(resolve({ locationId: "valid", supabaseKey: "sb_secret_test" }).supabaseKey).toBe("");
  });
  it("passes sanitized public configuration to loaders without changing explicit bootstrap precedence", () => {
    vi.stubEnv("VITE_LOCATION_ID", "different-customer");
    window.TB_BOOTSTRAP = { locationId: "<invalid>", supabaseKey: "sb_secret_test" };
    initializeLoaderBootstrap();
    expect(window.WEBSITE_LOADER_BOOTSTRAP).toMatchObject({ locationId: "", supabaseKey: "" });
    expect(resolveWebsiteRuntime().locationId).toBe("");
  });
});
