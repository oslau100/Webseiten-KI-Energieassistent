import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AffiliatePortal } from "@/pages/Affiliate";
import { AffiliateApiError, affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/lib/affiliate-api", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/affiliate-api")>();
  return { ...original, affiliateApi: {
    session: vi.fn(), bootstrapProfile: vi.fn(), overview: vi.fn(), referrals: vi.fn(), rewards: vi.fn(),
    profile: vi.fn(), payouts: vi.fn(), payoutMethod: vi.fn(), logout: vi.fn(), changePassword: vi.fn(),
  } };
});
const api = vi.mocked(affiliateApi);
const user = { id: "qa-a", name: "QA A", image: null, emailVerified: true };
const profile = { id: "qa-profile", firstName: "QA", lastName: "Beispiel", languageCode: "de", status: "active", memberSince: "2026-01-01" };
const mount = (section = "empfehlungen") => render(<MemoryRouter initialEntries={[`/empfehlungsprogramm/${section}`]}><Routes>
  {(["portal", "empfehlungen", "belohnungen", "profil"] as const).map(item => <Route key={item} path={`/empfehlungsprogramm/${item}`} element={<AffiliatePortal section={item} />} />)}
  <Route path="/empfehlungsprogramm/anmelden" element={<p>Anmeldung erforderlich</p>} />
</Routes></MemoryRouter>);
beforeEach(() => {
  vi.resetAllMocks();
  api.session.mockResolvedValue({ authenticated: true, user });
  api.bootstrapProfile.mockResolvedValue(undefined);
  api.referrals.mockResolvedValue([{ id: "private-id", status: "confirmed", attributedAt: "2026-01-02", tariffRecommendedAt: null, closedAt: null, confirmedAt: null }]);
  api.rewards.mockResolvedValue([]);
  api.profile.mockResolvedValue(profile); api.payouts.mockResolvedValue([]); api.payoutMethod.mockResolvedValue(null);
  api.logout.mockResolvedValue(undefined);
});
afterEach(cleanup);
describe("partner lists and guarded navigation", () => {
  it("does not continue an obsolete auth/bootstrap sequence while logout is pending", async () => {
    let resolveSession!: (value: { authenticated: boolean; user: typeof user }) => void;
    let resolveLogout!: () => void;
    api.session.mockReturnValue(new Promise(resolve => { resolveSession = resolve; }));
    api.logout.mockReturnValue(new Promise(resolve => { resolveLogout = resolve; }));
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Abmelden" }));
    await act(async () => resolveSession({ authenticated: true, user }));
    expect(api.bootstrapProfile).not.toHaveBeenCalled();
    expect(api.referrals).not.toHaveBeenCalled();
    await act(async () => resolveLogout());
    expect(await screen.findByText("Anmeldung erforderlich")).toBeInTheDocument();
  });
  it("renders readable referrals without enum/ID leakage", async () => {
    mount();
    expect(await screen.findByRole("table", { name: "Empfehlungen" })).toBeInTheDocument();
    expect(screen.getByText("Anbieterwechsel bestätigt")).toBeInTheDocument();
    expect(screen.getByText("Empfehlung vom 02.01.2026")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("private-id");
    expect(document.body.textContent).not.toContain("confirmed");
  });
  it("distinguishes available rewards from voucher fulfillment and hides unknown values", async () => {
    api.rewards.mockResolvedValue(["pending", "available", "paid", "internal_hold"].map((status, index) => ({ id: `qa-${index}`, referralId: "private", status, method: "gift_card", amount: 30, currency: "EUR", voucherLabel: null, availableAt: null, paidAt: status === "paid" ? "2026-02-01" : null })));
    mount("belohnungen");
    expect(await screen.findByText("Verfügbar")).toBeInTheDocument();
    expect(screen.getByText("Gutschein ausgegeben")).toBeInTheDocument();
    expect(screen.getByText("Status noch offen")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("internal_hold");
  });
  it("keeps historical payouts with truthful paid/creation dates for voucher settings", async () => {
    api.payoutMethod.mockResolvedValue({ id: "qa", method: "gift_card", status: "unknown", maskedIban: null, updatedAt: "" });
    api.payouts.mockResolvedValue([{ id: "qa", status: "paid", amount: 30, currency: "EUR", paidAt: null, createdAt: "2026-01-01" }]);
    mount("profil");
    expect(await screen.findByText("Erstellt am 01.01.2026")).toBeInTheDocument();
    expect(screen.queryByText(/Ausgezahlt am/)).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Auszahlungen" })).toBeInTheDocument();
  });
  it("never renders an empty state before data arrives, and keeps aria-busy honest", async () => {
    let resolve!: (rows: []) => void;
    api.referrals.mockReturnValue(new Promise(done => { resolve = done; }));
    mount();
    expect(screen.getByRole("status", { name: "Inhalte werden geladen" }).parentElement).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Noch keine Empfehlungen")).not.toBeInTheDocument();
    await waitFor(() => expect(api.referrals).toHaveBeenCalled()); resolve([]);
    expect(await screen.findByText("Noch keine Empfehlungen")).toBeInTheDocument();
    expect(screen.queryByText("Portal wird geladen …")).not.toBeInTheDocument();
  });
  it.each([401, 403])("clears private display on %s rather than retaining stale success", async status => {
    mount(); await screen.findByText("Anbieterwechsel bestätigt");
    api.session.mockRejectedValue(new AffiliateApiError(status));
    fireEvent(window, new Event("focus"));
    expect(screen.queryByText("Anbieterwechsel bestätigt")).not.toBeInTheDocument();
    expect(await screen.findByText("Anmeldung erforderlich")).toBeInTheDocument();
  });
  it("hides the old identity immediately during focus revalidation", async () => {
    api.overview.mockResolvedValue({ profile, program: {}, defaultLink: {}, totals: {}, referralUrl: "https://example.test/qa-a" });
    mount("portal"); await screen.findByText("https://example.test/qa-a");
    api.session.mockResolvedValue({ authenticated: true, user: { ...user, id: "qa-b", name: "QA B" } });
    api.overview.mockResolvedValue({ profile, program: {}, defaultLink: {}, totals: {}, referralUrl: "https://example.test/qa-b" });
    fireEvent(window, new Event("focus"));
    expect(screen.queryByText("https://example.test/qa-a")).not.toBeInTheDocument();
    expect(await screen.findByText("https://example.test/qa-b")).toBeInTheDocument();
  });
  it("guards rapid navigation from an obsolete session failure", async () => {
    let reject!: (error: Error) => void;
    mount(); await screen.findByText("Anbieterwechsel bestätigt");
    api.session.mockReturnValueOnce(new Promise((_resolve, fail) => { reject = fail; }));
    fireEvent.click(screen.getByRole("link", { name: "Belohnungen" }));
    await waitFor(() => expect(api.session).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("link", { name: "Empfehlungen" }));
    await screen.findByText("Anbieterwechsel bestätigt");
    reject(new AffiliateApiError(401));
    await waitFor(() => expect(screen.queryByText("Anmeldung erforderlich")).not.toBeInTheDocument());
  });
  it("unmounts sensitive bank input before logout completes", async () => {
    api.payoutMethod.mockResolvedValue({ id: "qa", method: "bank_transfer", status: "unknown", maskedIban: null, updatedAt: "" });
    mount("profil"); await screen.findByText("Konto & Profil");
    const logoutButton = screen.getByRole("button", { name: "Abmelden" });
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung hinterlegen" }));
    fireEvent.change(screen.getByLabelText("IBAN"), { target: { value: "DE89" } });
    fireEvent.click(logoutButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByText("Anmeldung erforderlich")).toBeInTheDocument();
  });
  it("shows an honest read error without inventing a save rejection or success", async () => {
    api.payoutMethod.mockRejectedValue(new AffiliateApiError(500));
    mount("profil"); expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Konto & Profil")).not.toBeInTheDocument();
  });
  it.each([401, 403])("redirects on a section's %s authorization failure", async status => {
    api.referrals.mockRejectedValue(new AffiliateApiError(status));
    mount(); expect(await screen.findByText("Anmeldung erforderlich")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("retains the existing password-change contract and clears the submitted form", async () => {
    api.changePassword.mockResolvedValue(undefined);
    mount("profil"); await screen.findByText("Konto & Profil");
    fireEvent.change(screen.getByLabelText("Aktuelles Passwort"), { target: { value: "qa-old-password" } });
    fireEvent.change(screen.getByLabelText("Neues Passwort", { exact: true }), { target: { value: "qa-new-password" } });
    fireEvent.change(screen.getByLabelText("Neues Passwort bestätigen"), { target: { value: "qa-new-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Passwort ändern" }));
    expect(await screen.findByText("Dein Passwort wurde erfolgreich geändert.")).toBeInTheDocument();
    expect(screen.getByLabelText("Aktuelles Passwort")).toHaveValue("");
    expect(api.changePassword).toHaveBeenCalledWith("qa-old-password", "qa-new-password");
  });
});
