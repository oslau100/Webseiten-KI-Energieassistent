// Known ISO 13616 country lengths. Unsupported prefixes fail closed;
// this is only a local format check, never bank/account verification.
const lengths: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
  GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
  IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18,
  NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24,
  SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23, TN: 24,
  TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};
export const normalizeIban = (input: string) => input.replace(/\s/g, "").toUpperCase();
export type IbanValidation = { status: "empty" | "incomplete" | "invalid" | "valid"; message: string };
export function validateIban(input: string): IbanValidation {
  if (/[^a-zA-Z0-9\s]/.test(input)) return { status: "invalid", message: "Bitte verwende nur Buchstaben, Zahlen und Leerzeichen." };
  const iban = normalizeIban(input);
  if (!iban) return { status: "empty", message: "Bitte gib eine IBAN ein." };
  if (!/^[A-Z0-9]+$/.test(iban)) return { status: "invalid", message: "Bitte verwende nur Buchstaben, Zahlen und Leerzeichen." };
  if (iban.length < 4) return { status: "incomplete", message: "Die IBAN ist noch nicht vollständig." };
  if (!/^[A-Z]{2}\d{2}/.test(iban)) return { status: "invalid", message: "Bitte prüfe das Länderkennzeichen und die Prüfziffern." };
  const length = lengths[iban.slice(0, 2)];
  if (!length) return { status: "invalid", message: "Dieses Länderkennzeichen kann hier nicht geprüft werden." };
  if (iban.length < length) return { status: "incomplete", message: "Die IBAN ist noch nicht vollständig." };
  if (iban.length !== length) return { status: "invalid", message: "Die Länge der IBAN stimmt nicht." };
  let remainder = 0;
  for (const character of iban.slice(4) + iban.slice(0, 4)) {
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1 ? { status: "valid", message: "Das IBAN-Format ist gültig." } : { status: "invalid", message: "Die Prüfziffer stimmt nicht. Bitte prüfe deine IBAN." };
}
export const maskIban = (input: string) => {
  const iban = normalizeIban(input);
  return validateIban(input).status === "valid" ? `${iban.slice(0, 2)} •••• •••• ${iban.slice(-4)}` : undefined;
};
