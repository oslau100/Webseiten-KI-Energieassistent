import { describe, expect, it, vi } from "vitest";
import { establishAffiliatePortalSession } from "./affiliateSession";

describe("affiliate portal session flow", () => {
  it("bootstraps only after an authenticated, verified session", async () => {
    const order: string[] = [];
    const api = {
      session: vi.fn(async () => { order.push("session"); return { authenticated: true, user: { id: "1", name: "Ada", image: null, emailVerified: true } }; }),
      bootstrapProfile: vi.fn(async () => { order.push("bootstrap"); return {}; }),
    };
    await expect(establishAffiliatePortalSession(api)).resolves.toMatchObject({ state: "ready" });
    expect(order).toEqual(["session", "bootstrap"]);
  });

  it.each([
    [{ authenticated: false }, "unauthenticated"],
    [{ authenticated: true, user: { id: "1", name: "Ada", image: null, emailVerified: false } }, "unverified"],
  ] as const)("does not bootstrap an unusable session", async (session, state) => {
    const bootstrapProfile = vi.fn();
    await expect(establishAffiliatePortalSession({ session: vi.fn(async () => session), bootstrapProfile })).resolves.toMatchObject({ state });
    expect(bootstrapProfile).not.toHaveBeenCalled();
  });
});
