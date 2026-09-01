import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../../functions/api/[[path]]";

describe("Cloudflare Pages API bridge", () => {
  it("forwards the original /api request through PUBLIC_PLATFORM_API unchanged", async () => {
    const request = new Request("https://customer.example/api/auth/password/reset?lang=de", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=abc123; preference=compact",
      },
      body: JSON.stringify({ token: "reset-token", newPassword: "new-password" }),
    });
    const downstream = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "session=renewed; HttpOnly; Secure; SameSite=Lax",
      },
    });
    const fetch = vi.fn(async (forwarded: Request) => {
      expect(forwarded).toBe(request);
      expect(forwarded.url).toBe(
        "https://customer.example/api/auth/password/reset?lang=de",
      );
      expect(new URL(forwarded.url).hostname).toBe("customer.example");
      expect(forwarded.method).toBe("POST");
      expect(forwarded.headers.get("cookie")).toBe(
        "session=abc123; preference=compact",
      );
      expect(await forwarded.clone().json()).toEqual({
        token: "reset-token",
        newPassword: "new-password",
      });
      return downstream;
    });

    const response = await onRequest({
      request,
      env: { PUBLIC_PLATFORM_API: { fetch } },
    });

    expect(fetch).toHaveBeenCalledOnce();
    expect(response).toBe(downstream);
    expect(response.headers.get("set-cookie")).toBe(
      "session=renewed; HttpOnly; Secure; SameSite=Lax",
    );
  });

  it.each([
    ["missing", {}],
    ["null", { PUBLIC_PLATFORM_API: null }],
    ["without fetch", { PUBLIC_PLATFORM_API: {} }],
  ])("fails closed when the binding is %s", async (_name, env) => {
    const response = await onRequest({
      request: new Request("https://customer.example/api/auth/session"),
      env,
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("Service unavailable");
  });

  it("does not introduce tenant or location input", async () => {
    const request = new Request("https://customer.example/api/affiliate/overview");
    const fetch = vi.fn(() => new Response(null, { status: 204 }));

    await onRequest({ request, env: { PUBLIC_PLATFORM_API: { fetch } } });

    const forwarded = fetch.mock.calls[0][0];
    expect(forwarded).toBe(request);
    expect(forwarded.headers.has("x-tenant-id")).toBe(false);
    expect(forwarded.headers.has("x-location-id")).toBe(false);
    expect(forwarded.url).not.toContain("location_id");
  });
});
