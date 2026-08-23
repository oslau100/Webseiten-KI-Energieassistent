import { afterEach, describe, expect, it, vi } from "vitest";
import { affiliateApi } from "./affiliateApi";

describe("affiliateApi final public contract", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["login", ["person@example.test", "secret"], "/api/auth/login", { email: "person@example.test", password: "secret" }],
    ["register", ["Ada", "person@example.test", "secret"], "/api/auth/register", { name: "Ada", email: "person@example.test", password: "secret" }],
    ["forgotPassword", ["person@example.test"], "/api/auth/password/forgot", { email: "person@example.test" }],
    ["resetPassword", ["reset-token", "new-secret"], "/api/auth/password/reset", { token: "reset-token", newPassword: "new-secret" }],
    ["changePassword", ["current", "new-secret"], "/api/auth/password/change", { currentPassword: "current", newPassword: "new-secret" }],
  ] as const)("uses the canonical endpoint and exact body for %s", async (method, args, path, body) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await (affiliateApi[method] as (...values: string[]) => Promise<void>)(...args);
    expect(fetchMock).toHaveBeenCalledWith(path, { method: "POST", body: JSON.stringify(body), credentials: "include", headers: { "Content-Type": "application/json" } });
  });

  it("returns only the public session fields and does not require email", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ authenticated: true, user: { id: "user-1", name: "Ada", image: null, emailVerified: true, email: "private@example.test", location_id: "unsafe" } })));
    await expect(affiliateApi.session()).resolves.toEqual({ authenticated: true, user: { id: "user-1", name: "Ada", image: null, emailVerified: true } });
  });

  it("forwards a non-empty registration invite token without changing self-signup", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await affiliateApi.register("Ada", "person@example.test", "secret", "opaque/+ invite");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ name: "Ada", email: "person@example.test", password: "secret", inviteToken: "opaque/+ invite" });

    await affiliateApi.register("Ada", "person@example.test", "secret");
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ name: "Ada", email: "person@example.test", password: "secret" });
  });

  it("parses the final overview field names without invented metrics", async () => {
    const response = { profile: { id: "p1", firstName: "Ada", lastName: "L", languageCode: "de", status: "active", memberSince: "2026-01-01" }, program: { id: "program-1" }, defaultLink: { id: "link-1" }, totals: { referrals: 7, availableRewards: 25, paidRewards: 50 }, referralUrl: "https://example.test/?ref=abc", metrics: { clicks: 99 } };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(response)));
    await expect(affiliateApi.overview()).resolves.toEqual({ profile: response.profile, program: response.program, defaultLink: response.defaultLink, totals: response.totals, referralUrl: response.referralUrl });
  });

  it("parses collections as direct arrays with only canonical fields", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ id: "r1", status: "new", attributedAt: "a", tariffRecommendedAt: null, closedAt: null, confirmedAt: null, clicks: 12 }])));
    await expect(affiliateApi.referrals()).resolves.toEqual([{ id: "r1", status: "new", attributedAt: "a", tariffRecommendedAt: null, closedAt: null, confirmedAt: null }]);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ id: "w1", referralId: "r1", status: "available", method: "cash", amount: 20, currency: "EUR", voucherLabel: null, availableAt: "a", paidAt: null, pending: 12 }])));
    await expect(affiliateApi.rewards()).resolves.toEqual([{ id: "w1", referralId: "r1", status: "available", method: "cash", amount: 20, currency: "EUR", voucherLabel: null, availableAt: "a", paidAt: null }]);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ id: "o1", status: "paid", amount: 20, currency: "EUR", paidAt: "p", createdAt: "c", contracts: 4 }])));
    await expect(affiliateApi.payouts()).resolves.toEqual([{ id: "o1", status: "paid", amount: 20, currency: "EUR", paidAt: "p", createdAt: "c" }]);
  });

  it("uses the encoded public referral resolver and no tenant input", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await affiliateApi.resolveReferral("code /?ß");
    expect(fetchMock).toHaveBeenCalledWith("/api/affiliate/resolve?code=code%20%2F%3F%C3%9F", expect.objectContaining({ credentials: "include" }));
  });

  it("preserves a null payout method", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("null"));
    await expect(affiliateApi.payoutMethod()).resolves.toBeNull();
  });
});
