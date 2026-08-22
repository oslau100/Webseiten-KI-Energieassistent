import { afterEach, describe, expect, it, vi } from "vitest";

import { affiliateApi } from "./affiliateApi";

describe("affiliateApi.resetPassword", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the canonical same-origin reset contract and accepts a 204 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(affiliateApi.resetPassword("reset-token", "new-secret")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/password/reset", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "reset-token", newPassword: "new-secret" }),
    });
  });
});
