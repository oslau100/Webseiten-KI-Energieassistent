import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../../functions/api/[[path]]";

describe("Cloudflare Pages API bridge", () => {
  it("forwards the original request through PUBLIC_PLATFORM_API without introducing tenant input", async () => {
    const request = new Request("https://customer.example/api/auth/password/reset?attempt=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "affiliate_session=session-value",
      },
      body: JSON.stringify({ token: "reset-token", newPassword: "new-password" }),
    });
    const downstreamResponse = new Response(null, {
      status: 204,
      headers: { "Set-Cookie": "affiliate_session=renewed; Secure; HttpOnly; SameSite=Lax" },
    });
    const fetch = vi.fn().mockResolvedValue(downstreamResponse);

    const response = await onRequest({
      request,
      env: { PUBLIC_PLATFORM_API: { fetch } },
    });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(request);
    const forwarded = fetch.mock.calls[0][0] as Request;
    expect(forwarded).toBe(request);
    expect(forwarded.url).toBe("https://customer.example/api/auth/password/reset?attempt=1");
    expect(new URL(forwarded.url).hostname).toBe("customer.example");
    expect(forwarded.method).toBe("POST");
    expect(forwarded.headers.get("Cookie")).toBe("affiliate_session=session-value");
    expect(await forwarded.json()).toEqual({ token: "reset-token", newPassword: "new-password" });
    expect(response).toBe(downstreamResponse);
    expect(response.headers.get("Set-Cookie")).toBe("affiliate_session=renewed; Secure; HttpOnly; SameSite=Lax");
  });

  it.each([
    undefined,
    {},
    { fetch: "not-a-function" },
  ])("fails closed when the binding is missing or malformed", async (binding) => {
    const response = await onRequest({
      request: new Request("https://customer.example/api/affiliate/dashboard"),
      env: { PUBLIC_PLATFORM_API: binding as never },
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Service unavailable");
  });

  it("does not expose binding failures", async () => {
    const response = await onRequest({
      request: new Request("https://customer.example/api/affiliate/dashboard"),
      env: {
        PUBLIC_PLATFORM_API: {
          fetch: () => { throw new Error("secret binding configuration"); },
        },
      },
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Service unavailable");
  });
});
