import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";

const sanitizer = readFileSync("public/loaders/bootstrap.js", "utf8");
const files = ["start", "tarif", "auftrag", "rechnung"];

describe("neutral loader bootstraps", () => {
  it.each(files)("never creates a Supabase client without a Location in %s", async (name) => {
    const html = readFileSync(`public/loaders/${name}.html`, "utf8");
    const dom = new JSDOM(html, { url: "https://preview.test/loaders/", runScripts: "outside-only" });
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    dom.window.eval(scripts[0]);
    // Even valid credentials must not fetch an implicit tenant.
    dom.window.TB_BOOTSTRAP.supabaseKey = "sb_publishable_test";
    dom.window.eval(sanitizer);
    const createClient = vi.fn();
    dom.window.supabase = { createClient };
    await dom.window.eval(scripts[1]);
    expect(createClient).not.toHaveBeenCalled();
    expect(html).not.toMatch(/ehiogie|marvin|tn90CyE3XuYFTy4c1M3F/i);
    dom.window.close();
  });
  it.each(files)("receives the resolved SPA configuration before %s runs", (name) => {
    const html = readFileSync(`public/loaders/${name}.html`, "utf8");
    const script = /<script>([\s\S]*?)<\/script>/.exec(html)![1];
    const window = {
      location: { origin: "https://preview.test" },
      parent: { location: { origin: "https://preview.test" }, WEBSITE_LOADER_BOOTSTRAP: { locationId: "configured-location", supabaseUrl: "https://configured.test", supabaseKey: "sb_publishable_test" } },
      TB_BOOTSTRAP: undefined,
    };
    new Function("window", script)(window);
    new Function("window", "atob", sanitizer)(window, atob);
    expect(window.TB_BOOTSTRAP).toMatchObject({ locationId: "configured-location", supabaseUrl: "https://configured.test", supabaseKey: "sb_publishable_test" });
  });
  it("rejects a standalone invalid tenant and privileged key", () => {
    const window = { TB_BOOTSTRAP: { locationId: "<LOCATION_ID>", supabaseKey: "sb_secret_test" } };
    new Function("window", "atob", sanitizer)(window, atob);
    expect(window.TB_BOOTSTRAP).toEqual({ locationId: "", supabaseKey: "" });
  });
  it("routes all static requests through Pages Functions", () => {
    expect(JSON.parse(readFileSync("public/_routes.json", "utf8"))).toEqual({ version: 1, include: ["/*"], exclude: [] });
  });
});
