import { afterEach, describe, expect, it, vi } from "vitest";
import { affiliateApi } from "./affiliateApi";

describe("affiliateApi canonical contract", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses every canonical portal read route and never the removed dashboard route", async () => {
    const fetchMock = vi.fn().mockImplementation(async (path: string) => new Response(
      ["/referrals", "/rewards", "/payouts"].some(suffix => path.endsWith(suffix)) ? "[]" : "{}",
      { status: 200 },
    ));
    vi.stubGlobal("fetch", fetchMock);
    await affiliateApi.session();
    await affiliateApi.overview();
    await affiliateApi.referrals();
    await affiliateApi.rewards();
    await affiliateApi.profile();
    await affiliateApi.payouts();
    await affiliateApi.payoutMethod();
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      "/api/auth/session", "/api/affiliate/overview", "/api/affiliate/referrals", "/api/affiliate/rewards",
      "/api/affiliate/profile", "/api/affiliate/payouts", "/api/affiliate/payout-method",
    ]);
    expect(fetchMock.mock.calls.every((call) => call[1].credentials === "same-origin")).toBe(true);
  });

  it("parses the final public session shape without requiring an email", async () => {
    const session = { authenticated: true, user: { id: "user-1", name: "Ada", image: null, emailVerified: true } };
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify(session))));
    await expect(affiliateApi.session()).resolves.toEqual(session);
    expect(JSON.stringify(await affiliateApi.session())).not.toContain("email\"");
  });

  it("returns collection responses as direct arrays", async () => {
    const rows = [{ id: "referral-1", status: "new" }];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify(rows))));
    await expect(affiliateApi.referrals()).resolves.toEqual(rows);
    await expect(affiliateApi.rewards()).resolves.toEqual(rows);
    await expect(affiliateApi.payouts()).resolves.toEqual(rows);
  });

  it("uses canonical POST bodies, permits only an opaque invite token, and accepts 204", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await affiliateApi.register({ name: "Ada", email: "ada@example.test", password: "secret", inviteToken: "opaque" });
    await affiliateApi.resetPassword("reset-token", "new-secret");
    await affiliateApi.changePassword("old-secret", "new-secret");
    await affiliateApi.bootstrapProfile();
    await affiliateApi.logout();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: "Ada", email: "ada@example.test", password: "secret", inviteToken: "opaque" });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ token: "reset-token", newPassword: "new-secret" });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/location_id|affiliate_profile_id|auth_user_id/);
    expect(fetchMock.mock.calls.map(call => call[0])).toContain("/api/affiliate/profile/bootstrap");
  });
});
