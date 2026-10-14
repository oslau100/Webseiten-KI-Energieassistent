import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BankDetailsDialog, NoRemunerationCard, PayoutMethodCard, ProfileCard } from "@/components/affiliate/PartnerSettings";

afterEach(cleanup);
describe("safe partner edit dialogs", () => {
  it("prepares an isolated no-remuneration view without a fictional payment method/action", () => {
    render(<NoRemunerationCard />);
    expect(screen.getByText("Ohne Belohnung")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("IBAN")).not.toBeInTheDocument();
  });
  it("clears raw IBAN on blur, dismissal and reopening; never enables saving", () => {
    render(<BankDetailsDialog hasBank={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung hinterlegen" }));
    const dialog = screen.getByRole("dialog");
    const iban = within(dialog).getByLabelText("IBAN");
    fireEvent.change(within(dialog).getByLabelText("Kontoinhaber"), { target: { value: "QA Beispiel" } });
    fireEvent.change(iban, { target: { value: "de89 3704 0044 0532 0130 00" } });
    expect(within(dialog).getByRole("status")).toHaveTextContent("Format ist gültig");
    expect(iban.getAttribute("value")).not.toContain("3704");
    expect(within(dialog).getByRole("button", { name: "Speichern" })).toBeDisabled();
    fireEvent.blur(iban);
    expect(within(dialog).getByText("DE •••• •••• 3000")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Format prüfen" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "IBAN erneut eingeben" }));
    expect(within(dialog).getByLabelText("IBAN")).toHaveValue("");
    fireEvent.change(within(dialog).getByLabelText("IBAN"), { target: { value: "DE89" } });
    expect(within(dialog).getByRole("button", { name: "Format prüfen" })).toBeEnabled();
    fireEvent.blur(within(dialog).getByLabelText("IBAN"));
    expect(document.body.innerHTML).not.toContain("3704");
    fireEvent.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung hinterlegen" }));
    expect(screen.getByLabelText("IBAN")).toHaveValue("");
    expect(screen.getByLabelText("Kontoinhaber")).toHaveValue("");
  });
  it("announces invalid format and erases invalid raw input on leaving the field", () => {
    render(<BankDetailsDialog hasBank={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung hinterlegen" }));
    const iban = screen.getByLabelText("IBAN");
    fireEvent.change(iban, { target: { value: "DE88370400440532013000" } });
    expect(iban).toHaveAttribute("aria-invalid", "true");
    fireEvent.blur(iban);
    expect(iban).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Prüfziffer stimmt nicht");
    expect(screen.getByRole("button", { name: "Speichern" })).toBeDisabled();
  });
  it("never prepopulates a masked server value, nor exposes an unmasked server value", () => {
    const { rerender } = render(<PayoutMethodCard method={{ id: "qa", method: "bank_transfer", status: "unknown", maskedIban: "DE** **** **** **** **30 00", updatedAt: "" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Bankverbindung ändern" }));
    expect(screen.getByLabelText("IBAN")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    rerender(<PayoutMethodCard method={{ id: "qa", method: "bank_transfer", status: "unknown", maskedIban: "DE89370400440532013000", updatedAt: "" }} />);
    expect(document.body.innerHTML).not.toContain("3704");
    expect(screen.getByText("Noch nicht hinterlegt")).toBeInTheDocument();
  });
  it("does not infer voucher or no-remuneration from an absent/unknown method", () => {
    const { rerender } = render(<PayoutMethodCard method={null} />);
    expect(screen.queryByText("Gutschein")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<PayoutMethodCard method={{ id: "qa", method: "manual_no_reward", status: "active", maskedIban: null, updatedAt: "" }} />);
    expect(screen.getByText("Die Auszahlungsmethode ist noch nicht bekannt.")).toBeInTheDocument();
    expect(screen.queryByText("Ohne Belohnung")).not.toBeInTheDocument();
    rerender(<PayoutMethodCard method={{ id: "qa", method: "gift_card", status: "unknown", maskedIban: null, updatedAt: "" }} />);
    expect(screen.getByText(/E-Mail-Adresse deines Partnerkontos/)).toBeInTheDocument();
    expect(screen.queryByLabelText("IBAN")).not.toBeInTheDocument();
  });
  it("keeps profile edits local, disables saving and resets on dismissal", () => {
    render(<ProfileCard profile={{ id: "qa", firstName: "QA", lastName: "Beispiel", status: "active", languageCode: "de", memberSince: "2026-01-01" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Kontodaten ändern" }));
    fireEvent.change(screen.getByLabelText("Vorname"), { target: { value: "" } });
    expect(screen.getByLabelText("Vorname")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Speichern" })).toBeDisabled();
    expect(screen.queryByLabelText("E-Mail-Adresse")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    fireEvent.click(screen.getByRole("button", { name: "Kontodaten ändern" }));
    expect(screen.getByLabelText("Vorname")).toHaveValue("QA");
  });
});
