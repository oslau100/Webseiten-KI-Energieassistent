import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReferralCapture } from "@/components/affiliate/ReferralCapture";
import { affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/lib/affiliate-api", () => ({ affiliateApi: { resolveReferral: vi.fn() } }));

describe("ReferralCapture", () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("resolves the ref server-side and removes only ref after success", async () => {
    vi.mocked(affiliateApi.resolveReferral).mockResolvedValueOnce(undefined);
    window.history.replaceState(null, "", "/start?ref=friend%20code&lang=ar&campaign=spring#details");

    render(<MemoryRouter initialEntries={["/start?ref=friend%20code&lang=ar&campaign=spring#details"]}><ReferralCapture /></MemoryRouter>);

    await waitFor(() => expect(window.location.href).toContain("/start?lang=ar&campaign=spring#details"));
    expect(affiliateApi.resolveReferral).toHaveBeenCalledWith("friend code");
  });

  it("removes ref after a failed resolve attempt without storing attribution", async () => {
    vi.mocked(affiliateApi.resolveReferral).mockRejectedValueOnce(new Error("unavailable"));
    window.history.replaceState(null, "", "/?keep=yes&ref=abc#hash");

    render(<MemoryRouter initialEntries={["/?keep=yes&ref=abc#hash"]}><ReferralCapture /></MemoryRouter>);

    await waitFor(() => expect(window.location.href).toContain("/?keep=yes#hash"));
    expect(window.localStorage).toHaveLength(0);
    expect(window.sessionStorage).toHaveLength(0);
  });
});
