import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AffiliatePortal } from "@/pages/Affiliate";
import { affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/components/affiliate/AffiliateLayout", () => ({ AffiliateLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/lib/affiliate-api", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/affiliate-api")>();
  return { ...original, affiliateApi: {
    session: vi.fn(), bootstrapProfile: vi.fn(), overview: vi.fn(), referrals: vi.fn(), rewards: vi.fn(),
    profile: vi.fn(), payouts: vi.fn(), payoutMethod: vi.fn(), logout: vi.fn(), changePassword: vi.fn(),
  } };
});
const api = vi.mocked(affiliateApi);
const renderPortal = () => render(<MemoryRouter initialEntries={["/empfehlungsprogramm/portal"]}><Routes><Route path="/empfehlungsprogramm/portal" element={<AffiliatePortal />} /><Route path="/empfehlungsprogramm/anmelden" element={<div>Anmeldung erforderlich</div>} /></Routes></MemoryRouter>);

describe("AffiliatePortal session contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("guards portal data behind an authenticated session", async () => {
    api.session.mockResolvedValueOnce({ authenticated: false });
    renderPortal();
    expect(await screen.findByText("Anmeldung erforderlich")).toBeInTheDocument();
    expect(api.bootstrapProfile).not.toHaveBeenCalled();
    expect(api.overview).not.toHaveBeenCalled();
  });

  it("bootstraps an authenticated profile before loading real overview data", async () => {
    api.session.mockResolvedValueOnce({ authenticated: true, user: { emailVerified: true } });
    api.bootstrapProfile.mockResolvedValueOnce(undefined);
    api.overview.mockResolvedValueOnce({ clicks: 7, currency: "EUR" });
    renderPortal();
    expect(await screen.findByText("7")).toBeInTheDocument();
    await waitFor(() => expect(api.overview).toHaveBeenCalled());
    expect(api.session.mock.invocationCallOrder[0]).toBeLessThan(api.bootstrapProfile.mock.invocationCallOrder[0]);
    expect(api.bootstrapProfile.mock.invocationCallOrder[0]).toBeLessThan(api.overview.mock.invocationCallOrder[0]);
  });
});
