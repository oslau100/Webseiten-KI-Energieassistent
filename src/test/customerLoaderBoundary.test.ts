import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../../functions/_middleware";
import { customerRuntimeBindings } from "../lib/customerRuntime";

describe("direct customer loader boundary", () => {
  for (const binding of customerRuntimeBindings) {
    it.each(["start.html", "tarif.html", "auftrag.html", "rechnung.html"])(`blocks ${binding.hostname}/loaders/%s without invoking a legacy consumer`, async loader => {
      const next = vi.fn(async () => new Response("legacy"));
      const response = await onRequest({ request: new Request(`https://${binding.hostname}/loaders/${loader}?uuid=123`), env: {}, next });
      expect(response.status).toBe(503);
      expect(await response.text()).toBe("NOT_READY");
      expect(next).not.toHaveBeenCalled();
    });
  }
  it("authenticates construction previews before returning NOT_READY", async () => {
    const next = vi.fn(async () => new Response("legacy"));
    const env = { SITE_PREVIEW_LOCK: "true", PREVIEW_USERNAME: "fixture", PREVIEW_PASSWORD: "fixture", VITE_LOCATION_ID: customerRuntimeBindings[0].locationId, VITE_CUSTOMER_PREVIEW_HOSTNAME: "branch.project.pages.dev" };
    const url = "https://branch.project.pages.dev/loaders/tarif.html";
    expect((await onRequest({ request: new Request(url), env, next })).status).toBe(401);
    expect((await onRequest({ request: new Request(url, { headers: { Authorization: `Basic ${btoa("fixture:fixture")}` } }), env, next })).status).toBe(503);
    expect(next).not.toHaveBeenCalled();
  });
  it("preserves unrelated loader behavior", async () => {
    const next = vi.fn(async () => new Response("existing"));
    expect((await onRequest({ request: new Request("https://other.test/loaders/start.html"), env: {}, next })).status).toBe(200);
    expect(next).toHaveBeenCalledOnce();
  });
});
