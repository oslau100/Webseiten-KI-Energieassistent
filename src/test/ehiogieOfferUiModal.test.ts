import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const sourceText = loader.match(/const FINAL_UI_SOURCE = (\{.*?\});\n  const I18N/s)?.[1];
if (!sourceText) throw new Error("FINAL_UI_SOURCE missing");
const source = JSON.parse(sourceText) as Record<string, { direction: string; messages: Record<string, string> }>;
const languages = ["de", "en", "es", "pl", "tr", "ar", "zh", "fr", "it", "ru", "hi", "nl"];

describe("Ehiogie final Offer UI localisation", () => {
  it("locks the approved 12-language × 43-key source byte-for-byte", () => {
    expect(Object.keys(source)).toEqual(languages);
    expect(Object.values(source).every(({ messages }) => Object.keys(messages).length === 43)).toBe(true);
    expect(createHash("sha256").update(sourceText).digest("hex")).toBe("d49575c5cb4a9ddbb42016f7f3b7846c43dd129f20e3e65aa2516030a0fa769f");
  });

  it("keeps English final values, payments/year, direction, and safe fallback", () => {
    expect(source.en.messages.statusLine).toBe("AI analysis complete");
    expect(source.en.messages.closeLabel).toBe("Close");
    expect(source.en.messages.m_paymentsYear).toBe("Payments per year");
    expect(source.ar.direction).toBe("rtl");
    expect(languages.filter(language => language !== "de").every(language => source[language].messages.title !== source.de.messages.title)).toBe(true);
    expect(loader).toContain('return Object.prototype.hasOwnProperty.call(I18N,x)?x:"de"');
  });
});

describe("iframe-aware tariff modal", () => {
  it("uses parent visual viewport geometry with tall/scrolled iframe fallbacks", () => {
    expect(loader).toContain("window.parent.visualViewport");
    expect(loader).toContain("view.offsetTop");
    expect(loader).toContain("frame.getBoundingClientRect()");
    expect(loader).toContain("window.parent.innerHeight");
    expect(loader).toContain("--tb-modal-height");
    expect(loader).toContain("overflow:auto!important");
  });

  it("repositions and maintains accessible close behavior", () => {
    expect(loader).toContain('aria-labelledby="tbModalTitle"');
    expect(loader).toContain('setAttribute("aria-label",String(t.closeLabel');
    expect(loader).toContain('$("tbModalClose").focus()');
    expect(loader).toContain("modalReturnFocus.focus()");
    expect(loader).toContain('e.key==="Escape"');
    expect(loader).toContain('e.target === $("tbModalBack")');
    expect(loader).toContain('addEventListener("orientationchange"');
    expect(loader).toContain('visualViewport?.addEventListener("resize"');
  });
});
