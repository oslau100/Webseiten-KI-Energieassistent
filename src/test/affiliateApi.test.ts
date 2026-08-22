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
});
