import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateReferralCapture } from "./AffiliateReferralCapture";

describe("AffiliateReferralCapture", () => {
  afterEach(() => vi.restoreAllMocks());

  it("resolves ref and removes only ref while preserving language, query and hash", async () => {
    window.history.replaceState({ retained: true }, "", "/empfehlungsprogramm?lang=en&ref=a%20b&campaign=summer#details");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    render(<AffiliateReferralCapture />);
    await waitFor(() => expect(window.location.href).toContain("?lang=en&campaign=summer#details"));
    expect(fetchMock).toHaveBeenCalledWith("/api/affiliate/resolve?code=a%20b", expect.objectContaining({ credentials: "include" }));
    expect(window.location.pathname).toBe("/empfehlungsprogramm");
    expect(window.location.hash).toBe("#details");
    expect(window.history.state).toEqual({ retained: true });
  });

  it("removes ref after a failed attempt without storage authority", async () => {
    window.history.replaceState(null, "", "/?ref=abc&lang=de");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    render(<AffiliateReferralCapture />);
    await waitFor(() => expect(window.location.search).toBe("?lang=de"));
    expect(storageSpy).not.toHaveBeenCalled();
  });
});
