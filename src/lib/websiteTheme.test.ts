import { describe, expect, it } from "vitest";
import { contrast, hexToHsl, websiteThemeTokens } from "./websiteTheme";

describe("customer CTA brand colors and readable states", () => {
  it.each([
    { primary: "#FFBD59", cta: "#E7AC24", onBrand: "#FFFFFF" },
    { primary: "#102A43", cta: "#38E8A0", onBrand: "#38E8A0" },
  ])("preserves the configured $cta button and chooses $onBrand on brand sections", ({ primary, cta, onBrand }) => {
    const tokens = websiteThemeTokens({ colors: { primary, cta, background: "#FFFFFF" } });
    expect(tokens["--customer-cta-bg"]).toBe(hexToHsl(cta));
    expect(tokens["--on-brand-cta-bg"]).toBe(hexToHsl(onBrand));
    expect(tokens["--customer-cta-text"]).toBe(hexToHsl("#000000"));
    expect(tokens["--on-brand-cta-text"]).toBe(hexToHsl("#000000"));
    expect(contrast(cta, "#000000")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onBrand, "#000000")).toBeGreaterThanOrEqual(4.5);
    // Solid edge and focus make pale brand buttons distinguishable from the surface.
    const edge = contrast(primary, "#000000") > contrast(primary, "#FFFFFF") ? "#000000" : "#FFFFFF";
    expect(tokens["--on-brand-cta-edge"]).toBe(hexToHsl(edge));
    expect(contrast(primary, edge)).toBeGreaterThanOrEqual(3);
  });
  it.each(["#002B49", "#008444", "#FFBD59", "#777777", "#FFFFFF", "#000000"])("keeps the configured background and readable foreground for %s", cta => {
    const tokens = websiteThemeTokens({ colors: { primary: cta } });
    const text = contrast(cta, "#000000") > contrast(cta, "#FFFFFF") ? "#000000" : "#FFFFFF";
    expect(tokens["--customer-cta-bg"]).toBe(hexToHsl(cta));
    expect(tokens["--customer-cta-text"]).toBe(hexToHsl(text));
    expect(contrast(cta, text)).toBeGreaterThanOrEqual(4.5);
  });
  it("does not invent theme tokens for absent or invalid primary config", () => {
    expect(websiteThemeTokens({})).toEqual({});
    expect(websiteThemeTokens({ colors: { primary: "invalid" } })).toEqual({});
  });
});

describe("customer hero pill contrast", () => {
  it.each([
    { primary: "#FFBD59", accent: "#FFBD59", dot: "#000000" },
    { primary: "#102A43", accent: "#38E8A0", dot: "#102A43" },
    { primary: "#FFFFFF", accent: "#FFFFFF", dot: "#000000" },
    { primary: "#000000", accent: "#000000", dot: "#FFFFFF" },
  ])("chooses a visible automatic dot for $primary / $accent", ({ primary, accent, dot }) => {
    const tokens = websiteThemeTokens({ colors: { primary, accent } });
    expect(tokens["--customer-hero-pill-bg"]).toBe(hexToHsl(accent));
    expect(tokens["--customer-hero-pill-dot"]).toBe(hexToHsl(dot));
    expect(contrast(dot, accent)).toBeGreaterThanOrEqual(3);
  });
  it("accepts safe configured pill colors and corrects unreadable text", () => {
    const tokens = websiteThemeTokens({ colors: { primary: "#FFBD59", heroPillBackground: "#000000", heroPillText: "#000000" } });
    expect(tokens["--customer-hero-pill-bg"]).toBe(hexToHsl("#000000"));
    expect(tokens["--customer-hero-pill-text"]).toBe(hexToHsl("#FFFFFF"));
    expect(tokens["--customer-hero-pill-dot"]).toBe(hexToHsl("#FFBD59"));
  });
  it("rejects invalid hex configuration and never offers a configurable dot", () => {
    const tokens = websiteThemeTokens({ colors: { primary: "#FFBD59", heroPillBackground: "url(evil)", heroPillText: "#fff", heroPillDot: "#FFBD59" } });
    expect(tokens["--customer-hero-pill-bg"]).toBe(hexToHsl("#FFBD59"));
    expect(tokens["--customer-hero-pill-text"]).toBe(hexToHsl("#000000"));
    expect(tokens["--customer-hero-pill-dot"]).toBe(hexToHsl("#000000"));
  });
});
