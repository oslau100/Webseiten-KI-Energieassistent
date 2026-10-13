import { describe, expect, it } from "vitest";
import { maskIban, normalizeIban, validateIban } from "@/lib/iban";
import { payoutStatus, referralStatus, rewardStatus, safeMaskedIban } from "@/lib/affiliate-presentation";

// Public synthetic checksum examples; no customer account data.
describe("local IBAN format check", () => {
  it("treats inherited object keys as unknown statuses", () => {
    for (const status of ["__proto__", "constructor", "toString", "", "on_hold"]) {
      expect(referralStatus(status)).toBe("Status noch offen");
      expect(rewardStatus(status, "gift_card")).toBe("Status noch offen");
      expect(payoutStatus(status)).toBe("Status noch offen");
    }
  });
  it("normalizes whitespace and case exactly", () => {
    expect(normalizeIban(" de89 3704\t0044\n0532 0130 00 ")).toBe("DE89370400440532013000");
  });
  it.each(["DE89370400440532013000", "GB82WEST12345698765432", "FR1420041010050500013M02606", "NL91ABNA0417164300", "CH9300762011623852957"])("accepts a known country length and mod-97 checksum", iban => {
    expect(validateIban(iban).status).toBe("valid");
  });
  it.each([
    ["", "empty"], ["DE89", "incomplete"], ["DE88370400440532013000", "invalid"],
    ["DE893704004405320130000", "invalid"], ["DE89!70400440532013000", "invalid"],
    ["ZZ89370400440532013000", "invalid"], ["D189370400440532013000", "invalid"],
  ])("rejects incomplete, unsupported or invalid input", (iban, expected) => expect(validateIban(iban).status).toBe(expected));
  it("masks all but the country and last four; never accepts a full server IBAN", () => {
    expect(maskIban("de89 3704 0044 0532 0130 00")).toBe("DE •••• •••• 3000");
    expect(maskIban("invalid")).toBeUndefined();
    // Unicode case expansion must not bypass illegal-character rejection.
    expect(maskIban("DE49ß0000000000000000")).toBeUndefined();
    expect(safeMaskedIban("DE89370400440532013000")).toBeUndefined();
    expect(safeMaskedIban("DE** **** **** **** **30 00")).toBe("DE •••• •••• 3000");
    expect(safeMaskedIban("DE89 **** 0044 0532 0130 00")).toBeUndefined();
  });
});
