import { afterEach, describe, expect, it, vi } from "vitest";

import { affiliateApi } from "@/lib/affiliate-api";

describe("affiliateApi auth contract", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["login", () => affiliateApi.login("ada@example.com", "secret"), "/api/auth/login", { email: "ada@example.com", password: "secret" }],
    ["register", () => affiliateApi.register({ name: "Ada", email: "ada@example.com", password: "secret" }), "/api/auth/register", { name: "Ada", email: "ada@example.com", password: "secret" }],
    ["activate", () => affiliateApi.activate("activation-token"), "/api/auth/activate", { token: "activation-token" }],
    ["forgot password", () => affiliateApi.forgotPassword("ada@example.com"), "/api/auth/password/forgot", { email: "ada@example.com" }],
    ["reset password", () => affiliateApi.resetPassword("reset-token", "new-secret"), "/api/auth/password/reset", { token: "reset-token", newPassword: "new-secret" }],
  ])("uses the canonical %s endpoint and accepts a 204 response", async (_name, invoke, path, body) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(invoke()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify(body),
    }));
  });

  it("passes an optional invite token only as registration data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await affiliateApi.register({ name: "Ada", email: "ada@example.com", password: "secret", inviteToken: "invite-123" });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({
      credentials: "include",
      body: JSON.stringify({ name: "Ada", email: "ada@example.com", password: "secret", inviteToken: "invite-123" }),
    }));
  });

  it.each([
    ["logout", () => affiliateApi.logout(), "/api/auth/logout", "POST"],
    ["session", () => affiliateApi.session(), "/api/auth/session", undefined],
    ["password change", () => affiliateApi.changePassword("old", "new"), "/api/auth/password/change", "POST"],
    ["profile bootstrap", () => affiliateApi.bootstrapProfile(), "/api/affiliate/profile/bootstrap", "POST"],
    ["overview", () => affiliateApi.overview(), "/api/affiliate/overview", undefined],
    ["referrals", () => affiliateApi.referrals(), "/api/affiliate/referrals", undefined],
    ["rewards", () => affiliateApi.rewards(), "/api/affiliate/rewards", undefined],
    ["profile", () => affiliateApi.profile(), "/api/affiliate/profile", undefined],
    ["payouts", () => affiliateApi.payouts(), "/api/affiliate/payouts", undefined],
    ["payout method", () => affiliateApi.payoutMethod(), "/api/affiliate/payout-method", undefined],
  ])("wires the canonical %s route with credential cookies", async (_name, invoke, path, method) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await invoke();

    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({ credentials: "include", ...(method ? { method } : {}) }));
  });
});
