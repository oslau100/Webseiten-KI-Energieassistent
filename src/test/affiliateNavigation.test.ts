import { describe, expect, it } from "vitest";

import { affiliateDestination, safeAffiliateSearch } from "@/lib/affiliate-navigation";

describe("affiliate navigation query safety", () => {
  it("preserves language and ordinary parameters while stripping auth secrets", () => {
    expect(safeAffiliateSearch("?lang=ar&campaign=summer&token=reset&inviteToken=invite")).toBe("?lang=ar&campaign=summer");
    expect(affiliateDestination("/empfehlungsprogramm/portal", "?source=email&inviteToken=invite")).toBe("/empfehlungsprogramm/portal?source=email");
  });
});
