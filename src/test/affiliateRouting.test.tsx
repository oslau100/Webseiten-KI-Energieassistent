import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/components/affiliate/AffiliateLayout", () => ({
  AffiliateLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/affiliate/ReferralCapture", () => ({ ReferralCapture: () => null }));
vi.mock("@/components/CookieConsent", () => ({ CookieConsent: () => null }));
vi.mock("@/lib/affiliate-api", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/affiliate-api")>();
  return { ...original, affiliateApi: {
    session: vi.fn(), bootstrapProfile: vi.fn(), overview: vi.fn(), referrals: vi.fn(), rewards: vi.fn(),
    profile: vi.fn(), payouts: vi.fn(), payoutMethod: vi.fn(), logout: vi.fn(), changePassword: vi.fn(),
  } };
});

const api = vi.mocked(affiliateApi);

describe("Affiliate Portal routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.session.mockResolvedValue({ authenticated: true, user: { id: "user-1", name: "Ada", image: null, emailVerified: true } });
    api.bootstrapProfile.mockResolvedValue(undefined);
    api.overview.mockResolvedValue({ profile: { id: "p", firstName: "Ada", lastName: "L", languageCode: "de", status: "active", memberSince: "2026-01-01" }, program: {}, defaultLink: {}, totals: {} });
    api.referrals.mockResolvedValue([]);
    api.rewards.mockResolvedValue([]);
    api.profile.mockResolvedValue({ id: "p", firstName: "Ada", lastName: "L", languageCode: "de", status: "active", memberSince: "2026-01-01" });
    api.payouts.mockResolvedValue([]);
    api.payoutMethod.mockResolvedValue(null);
  });
  afterEach(cleanup);

  it.each([
    ["portal", "Hier findest du deinen persönlichen Empfehlungslink und behältst deine Empfehlungen und Belohnungen im Blick."],
    ["empfehlungen", "Noch keine Empfehlungen"],
    ["belohnungen", "Keine Belohnungen vorhanden"],
    ["profil", "Konto & Profil"],
  ])("renders the intended %s section", async (section, expectedText) => {
    window.history.replaceState({}, "", `/empfehlungsprogramm/${section}?lang=ar`);
    render(<App />);
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
  });
});
