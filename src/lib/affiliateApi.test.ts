import { afterEach, describe, expect, it, vi } from "vitest";
import { affiliateApi } from "./affiliateApi";

describe("affiliateApi auth contract", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["login", ["person@example.test", "secret"], "/api/auth/login", { email: "person@example.test", password: "secret" }],
    ["register", ["Ada", "person@example.test", "secret"], "/api/auth/register", { name: "Ada", email: "person@example.test", password: "secret" }],
    ["forgotPassword", ["person@example.test"], "/api/auth/password/forgot", { email: "person@example.test" }],
    ["resetPassword", ["reset-token", "new-secret"], "/api/auth/password/reset", { token: "reset-token", newPassword: "new-secret" }],
    ["activate", ["activation-token"], "/api/auth/activate", { token: "activation-token" }],
  ] as const)("uses the canonical endpoint for %s and accepts an empty 204", async (method, args, path, body) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await (affiliateApi[method] as (...values: string[]) => Promise<void>)(...args);

    expect(fetchMock).toHaveBeenCalledWith(path, {
      method: "POST",
      body: JSON.stringify(body),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("supports an optional registration invite without adding tenant input", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await affiliateApi.register("Ada", "person@example.test", "secret", "invite-123");
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ name: "Ada", email: "person@example.test", password: "secret", inviteToken: "invite-123" }));
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ "Content-Type": "application/json" });
  });

  it.each([
    ["logout", [], "/api/auth/logout", "POST"],
    ["session", [], "/api/auth/session", undefined],
    ["changePassword", ["old", "new"], "/api/auth/password/change", "POST"],
    ["bootstrapProfile", [], "/api/affiliate/profile/bootstrap", "POST"],
    ["overview", [], "/api/affiliate/overview", undefined],
    ["referrals", [], "/api/affiliate/referrals", undefined],
    ["rewards", [], "/api/affiliate/rewards", undefined],
    ["profile", [], "/api/affiliate/profile", undefined],
    ["payouts", [], "/api/affiliate/payouts", undefined],
    ["payoutMethod", [], "/api/affiliate/payout-method", undefined],
  ] as const)("wires %s to the canonical same-origin route", async (method, args, path, httpMethod) => {
    const body = method === "session" ? { authenticated: false } : method === "overview" ? {} : method === "profile" || method === "payoutMethod" ? {} : method === "referrals" || method === "rewards" || method === "payouts" ? { items: [] } : null;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(body === null ? new Response(null, { status: 204 }) : new Response(JSON.stringify(body)));
    await (affiliateApi[method] as (...values: string[]) => Promise<unknown>)(...args);
    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({ credentials: "include", ...(httpMethod ? { method: httpMethod } : {}) }));
  });

  it("returns only canonical safe DTO fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ authenticated: true, user: { name: "Ada", email: "ada@example.test", location_id: "unsafe", role: "admin" }, tenant: "unsafe" })));
    await expect(affiliateApi.session()).resolves.toEqual({ authenticated: true, user: { name: "Ada", email: "ada@example.test" } });
  });
});
