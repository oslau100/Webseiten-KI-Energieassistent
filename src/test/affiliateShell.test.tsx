import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AffiliateAuth, AffiliateLanding, AffiliatePortal } from "@/pages/Affiliate";
import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
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
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
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
    const logo = within(header).getByRole("img", { name: "TarifButler Logo" });
    expect(logo).toHaveClass("h-40", "md:h-56");
    expect(within(header).getByRole("link", { name: "Anmelden" })).toBeInTheDocument();
    expect(within(header).queryByText("Vorteile")).not.toBeInTheDocument();
    expect(within(header).queryByText("Ersparnis prüfen")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sprache")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Registrieren" })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Gemeinsam weniger für Energie zahlen." })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Empfehlungsprogramm");
  });

  it("scrolls to the top on entry while registration CTAs keep navigating", async () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 640 });
    const scrollTo = vi.mocked(window.scrollTo);

    render(<MemoryRouter initialEntries={["/empfehlungsprogramm"]}><Location /><Routes>
      <Route path="/empfehlungsprogramm" element={<AffiliateLanding />} />
      <Route path="/empfehlungsprogramm/registrieren" element={<p>Registrierungsformular</p>} />
    </Routes></MemoryRouter>);

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 }));
    const registrationLinks = screen.getAllByRole("link", { name: "Registrieren" });
    expect(registrationLinks).toHaveLength(3);
    fireEvent.click(registrationLinks[0]);
    expect(screen.getByTestId("route")).toHaveTextContent("/empfehlungsprogramm/registrieren");
    expect(screen.getByText("Registrierungsformular")).toBeInTheDocument();
  });

  it("uses the approved registration heading", () => {
    render(<MemoryRouter><AffiliateAuth kind="registrieren" /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Registrieren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrieren" })).toBeInTheDocument();
  });

  it("keeps auth pages free of marketing navigation, language selection and footer", () => {
    render(<MemoryRouter><AffiliateAuth kind="anmelden" /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Willkommen zurück" })).toBeInTheDocument();
    expect(screen.queryByText("Sicher über TarifButler anmelden und Empfehlungen verwalten.")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sprache")).not.toBeInTheDocument();
  });

  it("provides an accessible mobile portal menu without replacing the desktop navigation", async () => {
    const logout = vi.fn();
    render(<MemoryRouter initialEntries={["/empfehlungsprogramm/portal"]}>
      <AffiliateLayout kind="portal" onLogout={logout}><Location /></AffiliateLayout>
    </MemoryRouter>);

    const header = screen.getByTestId("affiliate-portal-header");
    expect(within(header).getByRole("link", { name: "TarifButler Startseite" })).toHaveAttribute("href", "/");

    const desktopNav = within(header).getByRole("navigation", { name: "Empfehlungsportal" });
    expect(desktopNav).toHaveClass("hidden", "lg:flex");
    expect(within(desktopNav).getByRole("link", { name: "Übersicht" })).toHaveAttribute("href", "/empfehlungsprogramm/portal");
    expect(within(desktopNav).getByRole("link", { name: "Empfehlungen" })).toHaveAttribute("href", "/empfehlungsprogramm/empfehlungen");
    expect(within(desktopNav).getByRole("link", { name: "Belohnungen" })).toHaveAttribute("href", "/empfehlungsprogramm/belohnungen");
    expect(within(desktopNav).getByRole("link", { name: "Einstellungen" })).toHaveAttribute("href", "/empfehlungsprogramm/profil");
    expect(within(header).getByRole("button", { name: "Abmelden" })).toHaveClass("hidden", "lg:inline-flex");

    const menuButton = within(header).getByRole("button", { name: "Portal-Menü öffnen" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(menuButton, { key: "Enter" });
    await waitFor(() => expect(menuButton).toHaveAttribute("aria-expanded", "true"));

    const mobileMenu = await screen.findByRole("menu");
    expect(mobileMenu).toHaveClass("rounded-2xl");
    expect(within(mobileMenu).getAllByRole("menuitem")).toHaveLength(5);
    within(mobileMenu).getAllByRole("menuitem").forEach(item => expect(item).toHaveClass("rounded-xl"));
    expect(within(mobileMenu).getByRole("menuitem", { name: "Übersicht" })).toHaveAttribute("href", "/empfehlungsprogramm/portal");
    expect(within(mobileMenu).getByRole("menuitem", { name: "Empfehlungen" })).toHaveAttribute("href", "/empfehlungsprogramm/empfehlungen");
    expect(within(mobileMenu).getByRole("menuitem", { name: "Belohnungen" })).toHaveAttribute("href", "/empfehlungsprogramm/belohnungen");
    expect(within(mobileMenu).getByRole("menuitem", { name: "Einstellungen" })).toHaveAttribute("href", "/empfehlungsprogramm/profil");

    fireEvent.click(within(mobileMenu).getByRole("menuitem", { name: "Empfehlungen" }));
    await waitFor(() => expect(menuButton).toHaveAttribute("aria-expanded", "false"));
    expect(screen.getByTestId("route")).toHaveTextContent("/empfehlungsprogramm/empfehlungen");

    fireEvent.keyDown(menuButton, { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Abmelden" }));
    expect(logout).toHaveBeenCalledTimes(1);
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
