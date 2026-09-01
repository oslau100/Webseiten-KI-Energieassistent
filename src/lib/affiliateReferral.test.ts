import { afterEach, describe, expect, it, vi } from "vitest";
import { captureAffiliateReferral } from "./affiliateReferral";

describe("affiliate referral capture", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("resolves an encoded ref and then removes only ref from the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const replaceState = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await captureAffiliateReferral(
      { href: "https://customer.example/start?lang=ar&ref=a%2Fb&step=2#offer" } as Location,
      { state: { funnel: true }, replaceState } as unknown as History,
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/affiliate/resolve?code=a%2Fb", expect.objectContaining({ credentials: "same-origin" }));
    expect(replaceState).toHaveBeenCalledWith({ funnel: true }, "", "/start?lang=ar&step=2#offer");
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/location_id|tenant|auth_user_id/);
  });

  it("cleans ref after a failed attempt without writing browser storage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const replaceState = vi.fn();
    await captureAffiliateReferral(
      { href: "https://customer.example/?ref=partner" } as Location,
      { state: null, replaceState } as unknown as History,
    );
    expect(replaceState).toHaveBeenCalledWith(null, "", "/");
  });
});
