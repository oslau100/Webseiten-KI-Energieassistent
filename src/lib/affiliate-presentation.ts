// Conservative labels from the supplied 2026-10-10 decision snapshot.
// Unknown runtime values never become a financial promise or expose an enum.
const label = (labels: Record<string, string>, status: string) => Object.prototype.hasOwnProperty.call(labels, status) ? labels[status] : "Status noch offen";
export const referralStatus = (status: string) => label({ recommended: "Tarif empfohlen", closed: "Abgeschlossen", confirmed: "Anbieterwechsel bestätigt" }, status);
export const rewardStatus = (status: string, method: string) => label({ pending: "In Prüfung", available: "Verfügbar", paid: method === "gift_card" ? "Gutschein ausgegeben" : method === "bank_transfer" ? "Ausgezahlt" : "Erfüllt", cancelled: "Storniert" }, status);
export const payoutStatus = (status: string) => label({ pending: "Ausstehend", processing: "In Bearbeitung", paid: "Ausgezahlt", failed: "Nicht abgeschlossen", cancelled: "Storniert" }, status);
export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};
export const money = (amount?: number, currency = "EUR") => {
  if (typeof amount !== "number" || !Number.isFinite(amount) || !/^[A-Z]{3}$/.test(currency)) return "—";
  try { return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount); } catch { return "—"; }
};
// A read DTO must already be masked. Never accept a full IBAN here.
export const safeMaskedIban = (value?: string | null) => {
  const compact = value?.replace(/\s/g, "");
  return compact && /^[A-Z]{2}[•*Xx-]{4,28}[A-Z0-9]{4}$/.test(compact) ? `${compact.slice(0, 2)} •••• •••• ${compact.slice(-4)}` : undefined;
};
