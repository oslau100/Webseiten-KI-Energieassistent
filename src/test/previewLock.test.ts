import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../../functions/_middleware";

const configured = { SITE_PREVIEW_LOCK: "true", PREVIEW_USERNAME: "preview-test", PREVIEW_PASSWORD: "test-only-password" };
const invoke = (env = {}, authorization?: string, path = "/") => {
  const next = vi.fn(async () => new Response("website asset", { headers: { "Content-Type": "text/html" } }));
  const request = new Request(`https://preview.test${path}`, { headers: authorization ? { Authorization: authorization } : {} });
  return { result: onRequest({ request, env, next }), next };
};
const protectedHeaders = (response: Response) => {
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
};

describe("Pages preview lock", () => {
  it.each([undefined, "", "false", "0"])("passes through when not explicitly enabled (%s)", async (SITE_PREVIEW_LOCK) => {
    const { result, next } = invoke({ SITE_PREVIEW_LOCK });
    const response = await result;
    expect(next).toHaveBeenCalledOnce();
    expect(await response.text()).toBe("website asset");
  });
  it("passes valid credentials through while preserving the website body and headers", async () => {
    const { result, next } = invoke(configured, `Basic ${btoa("preview-test:test-only-password")}`);
    const response = await result;
    expect(next).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("website asset");
    expect(response.headers.get("Content-Type")).toBe("text/html");
    protectedHeaders(response);
  });
  it.each([undefined, `Basic ${btoa("preview-test:wrong")}`, "Basic !!!", "Bearer wrong"])("blocks missing, wrong, or malformed credentials (%s)", async (authorization) => {
    const { result, next } = invoke(configured, authorization);
    const response = await result;
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBe('Basic realm="Energieassistent Preview"');
    protectedHeaders(response);
    expect(next).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("website asset");
  });
  it.each([{ PREVIEW_USERNAME: undefined }, { PREVIEW_PASSWORD: undefined }, { PREVIEW_USERNAME: "" }, { PREVIEW_PASSWORD: "  " }])("fails closed without configured credentials %j", async (missing) => {
    const { result, next } = invoke({ ...configured, ...missing }, `Basic ${btoa("preview-test:test-only-password")}`);
    const response = await result;
    expect(response.status).toBe(503);
    protectedHeaders(response);
    expect(next).not.toHaveBeenCalled();
  });
  it.each(["/", "/start", "/loaders/tarif.html", "/assets/site.js", "/favicon.svg"])("protects the site and static assets at %s", async (path) => {
    const { result, next } = invoke(configured, undefined, path);
    expect((await result).status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});
