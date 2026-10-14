import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BankDetailsDialog, ProfileCard } from "@/components/affiliate/PartnerSettings";
import { AffiliateAuth } from "@/pages/Affiliate";
import { affiliateDE } from "@/i18n/affiliate";
import { affiliateApi } from "@/lib/affiliate-api";
import { validateIban } from "@/lib/iban";

const internal = /nicht gespeichert|formale Prüfung|Kontoinhaberschaft|Portal-Service|Backend|Production.Wiring|UI.Vorschau|API noch|Demo/i;
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("customer-facing copy without internal explanations", () => {
  it("keeps country validation honest using a customer-oriented instruction", () => {
    expect(validateIban("ZZ89")).toEqual({ status: "invalid", message: "Bitte prüfe das Länderkennzeichen deiner IBAN." });
  });
  it("keeps bank validation and disabled actions without internal descriptions", () => {
    render(<BankDetailsDialog hasBank={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung hinterlegen" }));
    expect(document.body.textContent).not.toMatch(internal);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
    const iban = screen.getByLabelText("IBAN");
    expect(iban).toHaveAttribute("aria-describedby", "iban-check");
    fireEvent.change(iban, { target: { value: "DE89" } });
    expect(screen.getByRole("status")).toHaveTextContent("Die IBAN ist noch nicht vollständig.");
    fireEvent.blur(iban);
    expect(iban).toHaveValue("");
    expect(screen.getByRole("button", { name: "Speichern" })).toBeDisabled();
    expect(document.body.textContent).not.toMatch(internal);
  });
  it("keeps required profile feedback and genuinely disabled save", () => {
    render(<ProfileCard profile={{ id: "qa", firstName: "QA", lastName: "Beispiel", status: "active", languageCode: "de", memberSince: "2026-01-01" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Kontodaten ändern" }));
    expect(document.body.textContent).not.toMatch(internal);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
    fireEvent.change(screen.getByLabelText("Vorname"), { target: { value: "" } });
    expect(screen.getByRole("status")).toHaveTextContent("Bitte fülle Vorname und Nachname aus.");
    expect(screen.getByRole("button", { name: "Speichern" })).toBeDisabled();
  });
  it("uses natural auth failure copy without claiming a successful login", async () => {
    vi.spyOn(affiliateApi, "login").mockRejectedValue(new Error("qa failure"));
    render(<MemoryRouter><AffiliateAuth kind="anmelden" /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "qa@example.test" } });
    fireEvent.change(screen.getByLabelText("Passwort"), { target: { value: "qa-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(affiliateDE.unavailable);
    expect(document.body.textContent).not.toMatch(internal);
    expect(screen.getByRole("heading", { name: "Willkommen zurück" })).toBeInTheDocument();
  });
});
