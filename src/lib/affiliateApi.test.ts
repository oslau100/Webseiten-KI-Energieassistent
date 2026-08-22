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
});
