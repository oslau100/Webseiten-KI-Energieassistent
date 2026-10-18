import { describe, expect, it } from "vitest";
import { contrast, hexToHsl, websiteThemeTokens } from "./websiteTheme";

describe("customer CTA contrast on actual surfaces", () => {
  it.each(["#002B49", "#008444", "#FFBD59", "#E7AC24", "#777777", "#FFFFFF", "#000000"])("keeps text >=4.5 and button surface >=3 on %s", primary => {
    const design = { colors: { primary, accent: primary, cta: primary, background: "#FFFFFF" } };
    const tokens = websiteThemeTokens(design);
    const blackOrWhite = (surface: string) => contrast(surface, "#000000") > contrast(surface, "#FFFFFF") ? "#000000" : "#FFFFFF";
    const bg = blackOrWhite(primary);
    expect(tokens["--on-brand-cta-bg"]).toBe(hexToHsl(bg));
    expect(tokens["--on-brand-cta-text"]).toBe(hexToHsl(primary));
    expect(contrast(primary, bg)).toBeGreaterThanOrEqual(4.5);
    const defaultBg = contrast(primary, "#FFFFFF") >= 3 ? primary : "#000000";
    expect(tokens["--customer-cta-bg"]).toBe(hexToHsl(defaultBg));
    expect(contrast(defaultBg, "#FFFFFF")).toBeGreaterThanOrEqual(3);
    expect(contrast(defaultBg, blackOrWhite(defaultBg))).toBeGreaterThanOrEqual(4.5);
  });
  it("does not invent theme tokens for absent or invalid primary config", () => {
    expect(websiteThemeTokens({})).toEqual({});
    expect(websiteThemeTokens({ colors: { primary: "invalid" } })).toEqual({});
  });
});
