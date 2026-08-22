import { describe, expect, it, vi } from "vitest";

import { onRequest } from "../../functions/api/[[path]]";

const contextFor = (request: Request, binding?: { fetch(request: Request): Promise<Response> }) => ({
  request,
  env: binding ? { PUBLIC_PLATFORM_API: binding } : {},
});

describe("the Pages API service bridge", () => {
  it("forwards the original request through PUBLIC_PLATFORM_API without tenant input", async () => {
    const request = new Request("https://customer.example/api/auth/password/reset?lang=de", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "affiliate_session=session-value",
      },
      body: JSON.stringify({ token: "reset-token", newPassword: "new-secret" }),
    });
    const downstreamResponse = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Set-Cookie": "affiliate_session=renewed; Secure; HttpOnly; SameSite=Lax" },
    });
    const fetch = vi.fn().mockResolvedValue(downstreamResponse);

    const response = await onRequest(contextFor(request, { fetch }));

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(request);
    const forwarded = fetch.mock.calls[0][0];
    expect(forwarded).toBe(request);
    expect(forwarded.url).toBe("https://customer.example/api/auth/password/reset?lang=de");
    expect(forwarded.method).toBe("POST");
    expect(forwarded.headers.get("Cookie")).toBe("affiliate_session=session-value");
    expect(await forwarded.json()).toEqual({ token: "reset-token", newPassword: "new-secret" });
    expect(forwarded.headers.has("X-Tenant-Id")).toBe(false);
    expect(forwarded.headers.has("X-Location-Id")).toBe(false);
    expect(response).toBe(downstreamResponse);
    expect(response.headers.get("Set-Cookie")).toBe("affiliate_session=renewed; Secure; HttpOnly; SameSite=Lax");
  });

  it.each([
    ["missing", undefined],
    ["malformed", {}],
  ])("fails closed with a generic non-cacheable 503 when the binding is %s", async (_case, binding) => {
    const request = new Request("https://customer.example/api/auth/login");

    const response = await onRequest(contextFor(request, binding as never));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Service unavailable");
  });

  it("fails closed when the service binding rejects", async () => {
    const request = new Request("https://customer.example/api/auth/login");
    const fetch = vi.fn().mockRejectedValue(new Error("binding configuration details"));

    const response = await onRequest(contextFor(request, { fetch }));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Service unavailable");
  });
});
