import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AffiliateAuth, AffiliateLanding, AffiliatePortal } from "@/pages/Affiliate";
import { affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/lib/affiliate-api", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/affiliate-api")>();
  return { ...original, affiliateApi: {
    session: vi.fn(), bootstrapProfile: vi.fn(), overview: vi.fn(), referrals: vi.fn(), rewards: vi.fn(),
    profile: vi.fn(), payouts: vi.fn(), payoutMethod: vi.fn(), logout: vi.fn(), changePassword: vi.fn(),
  } };
});
const api = vi.mocked(affiliateApi);
const Location = () => <output data-testid="route">{useLocation().pathname}</output>;

describe("Affiliate layout contexts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.session.mockResolvedValue({ authenticated: true, user: { id: "u", name: "Ada", image: null, emailVerified: true } });
    api.bootstrapProfile.mockResolvedValue(undefined);
    api.overview.mockResolvedValue({ profile: { id: "p", firstName: "Ada", lastName: "L", languageCode: "de", status: "active", memberSince: "2026-01-01" }, program: {}, defaultLink: {}, totals: {}, referralUrl: "https://www.tarif-butler.de/?ref=server" });
    api.referrals.mockResolvedValue([]); api.rewards.mockResolvedValue([]);
    api.profile.mockResolvedValue({ id: "p", firstName: "Ada", lastName: "L", languageCode: "de", status: "active", memberSince: "2026-01-01" });
    api.payouts.mockResolvedValue([]); api.payoutMethod.mockResolvedValue(null); api.logout.mockResolvedValue(undefined);
  });

  it("uses a minimal public header and retains the public footer", () => {
    render(<MemoryRouter><AffiliateLanding /></MemoryRouter>);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "TarifButler Startseite" })).toBeInTheDocument();
    expect(within(header).getByRole("link", { name: "Anmelden" })).toBeInTheDocument();
    expect(within(header).queryByText("Vorteile")).not.toBeInTheDocument();
    expect(within(header).queryByText("Ersparnis prüfen")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sprache")).not.toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Empfehlungsprogramm");
  });

  it("keeps auth pages free of marketing navigation, language selection and footer", () => {
    render(<MemoryRouter><AffiliateAuth kind="anmelden" /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Willkommen zurück" })).toBeInTheDocument();
    expect(screen.queryByText("Sicher über TarifButler anmelden und Empfehlungen verwalten.")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sprache")).not.toBeInTheDocument();
  });

  it("navigates through every portal section without stale data or a homepage detour", async () => {
    render(<MemoryRouter initialEntries={["/empfehlungsprogramm/portal"]}><Location /><Routes>
      {(["portal", "empfehlungen", "belohnungen", "profil"] as const).map(section => <Route key={section} path={`/empfehlungsprogramm/${section}`} element={<AffiliatePortal section={section} />} />)}
    </Routes></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Hallo Ada" })).toBeInTheDocument();
    expect(screen.getByText("https://www.tarif-butler.de/?ref=server")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Empfehlungen" }));
    expect(await screen.findByRole("heading", { name: "Deine Empfehlungen" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Belohnungen" }));
    expect(await screen.findByRole("heading", { name: "Deine Belohnungen" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Einstellungen" }));
    expect(await screen.findByRole("heading", { name: "Einstellungen" })).toBeInTheDocument();
    expect(screen.getByText("Noch nicht hinterlegt")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Übersicht" }));
    await waitFor(() => expect(screen.getByTestId("route")).toHaveTextContent("/empfehlungsprogramm/portal"));
    expect(await screen.findByRole("heading", { name: "Hallo Ada" })).toBeInTheDocument();
    expect(screen.getAllByTestId("affiliate-portal-header")).toHaveLength(1);
  });
});
