import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AffiliateAuth } from "@/pages/Affiliate";
import { affiliateApi } from "@/lib/affiliate-api";

vi.mock("@/components/affiliate/AffiliateLayout", () => ({
  AffiliateLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/affiliate-api", () => ({
  affiliateApi: {
    login: vi.fn(),
    register: vi.fn(),
    activate: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockedApi = vi.mocked(affiliateApi);
const PortalLocation = () => <div>Affiliate portal {useLocation().search}</div>;

const renderAuth = (kind: Parameters<typeof AffiliateAuth>[0]["kind"], path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<AffiliateAuth kind={kind} />} />
        <Route path="/empfehlungsprogramm/portal" element={<PortalLocation />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AffiliateAuth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects mismatched registration passwords before calling the API", async () => {
    renderAuth("registrieren", "/empfehlungsprogramm/registrieren");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Passwort", { selector: "input" }), { target: { value: "secret-one" } });
    fireEvent.change(screen.getByLabelText("Passwort bestätigen"), { target: { value: "secret-two" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Die Passwörter stimmen nicht überein.");
    expect(mockedApi.register).not.toHaveBeenCalled();
  });

  it("navigates to the portal only after a successful login response", async () => {
    mockedApi.login.mockResolvedValueOnce(undefined);
    renderAuth("anmelden", "/empfehlungsprogramm/anmelden");

    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Passwort"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    expect(await screen.findByText("Affiliate portal")).toBeInTheDocument();
    expect(mockedApi.login).toHaveBeenCalledWith("ada@example.com", "secret");
  });

  it("preserves the language and other query parameters across auth navigation", async () => {
    mockedApi.login.mockResolvedValueOnce(undefined);
    renderAuth("anmelden", "/empfehlungsprogramm/anmelden?lang=ar&campaign=summer");

    expect(screen.getByRole("link", { name: "Passwort vergessen?" })).toHaveAttribute("href", "/empfehlungsprogramm/passwort-vergessen?lang=ar&campaign=summer");
    expect(screen.getByRole("link", { name: "Noch nicht registriert?" })).toHaveAttribute("href", "/empfehlungsprogramm/registrieren?lang=ar&campaign=summer");
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Passwort"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    expect(await screen.findByText("Affiliate portal ?lang=ar&campaign=summer")).toBeInTheDocument();
  });

  it("forwards a non-empty invite token once during registration", async () => {
    mockedApi.register.mockResolvedValueOnce(undefined);
    renderAuth("registrieren", "/empfehlungsprogramm/registrieren?inviteToken=opaque-token&lang=ar");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Passwort", { selector: "input" }), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("Passwort bestätigen"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    await waitFor(() => expect(mockedApi.register).toHaveBeenCalledWith({
      name: "Ada", email: "ada@example.com", password: "secret", inviteToken: "opaque-token",
    }));
  });

  it("activates with the token instead of trusting a browser-controlled status", async () => {
    mockedApi.activate.mockResolvedValueOnce(undefined);
    renderAuth("aktivieren", "/empfehlungsprogramm/aktivieren?token=test&status=success");

    expect(await screen.findByText(/Dein Konto wurde aktiviert/)).toBeInTheDocument();
    expect(mockedApi.activate).toHaveBeenCalledWith("test");
  });

  it("does not claim activation when the activation request fails", async () => {
    mockedApi.activate.mockRejectedValueOnce(new Error("offline"));
    renderAuth("aktivieren", "/empfehlungsprogramm/aktivieren?token=test&status=success");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/Dein Konto wurde aktiviert/)).not.toBeInTheDocument();
  });

  it("shows an unavailable error instead of success when reset fails", async () => {
    mockedApi.resetPassword.mockRejectedValueOnce(new Error("offline"));
    renderAuth("passwort-zuruecksetzen", "/empfehlungsprogramm/passwort-zuruecksetzen?token=test");

    fireEvent.change(screen.getByLabelText("Neues Passwort"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("Neues Passwort bestätigen"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.queryByText(/erfolgreich geändert/)).not.toBeInTheDocument();
  });

  it("rejects mismatched reset passwords before calling the API", async () => {
    renderAuth("passwort-zuruecksetzen", "/empfehlungsprogramm/passwort-zuruecksetzen?token=test");

    fireEvent.change(screen.getByLabelText("Neues Passwort"), { target: { value: "secret-one" } });
    fireEvent.change(screen.getByLabelText("Neues Passwort bestätigen"), { target: { value: "secret-two" } });
    fireEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Die Passwörter stimmen nicht überein.");
    expect(mockedApi.resetPassword).not.toHaveBeenCalled();
  });
});
