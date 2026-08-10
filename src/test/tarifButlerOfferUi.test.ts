import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const i18nSource = readFileSync("public/loaders/tarif-i18n.js", "utf8");
const loader = readFileSync("public/loaders/tarif.html", "utf8");

function loadUi() {
  const context = { window: {} as Record<string, unknown> };
  vm.runInNewContext(i18nSource, context);
  return context.window as { TB_OFFER_UI_KEYS: string[]; TB_OFFER_UI: Record<string, Record<string, string>> };
}

describe("TarifButler approved Offer UI", () => {
  it("contains exactly the approved 12 languages and 43 message keys", () => {
    const ui = loadUi();
    expect(Object.keys(ui.TB_OFFER_UI)).toEqual(["de", "en", "es", "pl", "tr", "ar", "zh", "fr", "it", "ru", "hi", "nl"]);
    expect(ui.TB_OFFER_UI_KEYS).toHaveLength(43);
    Object.values(ui.TB_OFFER_UI).forEach(messages => {
      expect(Object.keys(messages).filter(key => key !== "direction")).toEqual(ui.TB_OFFER_UI_KEYS);
      expect(ui.TB_OFFER_UI_KEYS.every(key => messages[key].length > 0)).toBe(true);
    });
  });

  it("matches the immutable approved values in every language", () => {
    const { TB_OFFER_UI } = loadUi();
    const approvedHashes: Record<string, string> = {
      de: "f6e00c63e72c2dbe3cf9d9d292ef789bb871a40e3df2bd9f6a509f0affc6d28e", en: "94874f69080cb7e3aa3bfaec133b6254e8f6498489afd898478edc61475e95c1",
      es: "da91d4f2a5334f15a9d6b4553c67648bfa8a3e7357e234480c32a31872f71828", pl: "bd1312ad18015916a8a325054ae5b07542887bafbe414261ea1a11094713e9b3",
      tr: "d3edd4e6915177f963a024fa921ff363ab9d817decced5aee916af7a2f01d27d", ar: "4e607ba5cf1caebd2aed9d853935bb96f7b937d0adc50526a9acd0cd1e5ad541",
      zh: "ce7b61b078f0cba27ed72069a1bdcbe27f6bff8a928d7e543b475cca512f9802", fr: "e4f3e0ab241e32cb5e8d452dfd687e885d35f2396d5161177bd4a48d7665acb8",
      it: "1d24d075d317d46b4c5638efcb9f75e47f67204f381c1d6651e5eca220eb9102", ru: "770a3b312a0fc544b81356ed84386f0feb333a81acd5be5b0869a8f89452bce9",
      hi: "773617d380ba975503d2b07fcb2cc8e353d080c5d6c1b7285bf32f1bb3c4c61d", nl: "3cf91c8f9b1486cb67a5ccaf41cb8a1658f809bf0bc8e4781cc0b5e201ee5181",
    };
    Object.entries(TB_OFFER_UI).forEach(([language, value]) => {
      const messages = { ...value }; delete messages.direction;
      expect(createHash("sha256").update(JSON.stringify(messages)).digest("hex")).toBe(approvedHashes[language]);
    });
    expect(TB_OFFER_UI.en.statusLine).toBe("AI analysis complete");
    expect(TB_OFFER_UI.ar.direction).toBe("rtl");
    expect(TB_OFFER_UI.de.direction).toBe("ltr");
  });

  it("selects every supported language directly and safely falls unknown languages back to German", () => {
    const { TB_OFFER_UI } = loadUi();
    const getLang = new Function("I18N", `${loader.slice(loader.indexOf("function getLang"), loader.indexOf("function strip"))}; return getLang;`)(TB_OFFER_UI);
    Object.keys(TB_OFFER_UI).forEach(language => expect(getLang(language)).toBe(language));
    expect(getLang("en-GB")).toBe("en"); expect(getLang("unknown")).toBe("de");
  });

  it("maps a scrolled parent visual viewport into a tall iframe without scrolling the parent", () => {
    const modalSource = loader.slice(loader.indexOf("let modalReturnFocus"), loader.indexOf("function renderModal"));
    const style = { setProperty: vi.fn() }; const back = { style, classList: { contains: () => false } };
    const parent = { innerHeight: 844, visualViewport: { offsetTop: 120, height: 700 } };
    const windowMock = { frameElement: { getBoundingClientRect: () => ({ top: -1400, height: 3000 }) }, parent, innerHeight: 3000, visualViewport: null };
    const api = new Function("window", "document", "$", `${modalSource}; return {visibleParentViewport,positionModal};`)(windowMock, {}, () => back);
    expect(api.visibleParentViewport()).toEqual({ top: 1520, height: 700 });
    api.positionModal();
    expect(style.setProperty).toHaveBeenCalledWith("--tb-modal-top", "1520px");
    expect(style.setProperty).toHaveBeenCalledWith("--tb-modal-height", "700px");
    expect(loader).not.toContain("scrollIntoView");
  });

  it("covers viewport fallback, internal scrolling, updates and accessible close behavior", () => {
    const modalSource = loader.slice(loader.indexOf("let modalReturnFocus"), loader.indexOf("function renderModal"));
    const windowMock = { frameElement: null, parent: null as unknown, innerHeight: 844, visualViewport: null };
    windowMock.parent = windowMock;
    const api = new Function("window", "document", "$", `${modalSource}; return {visibleParentViewport};`)(windowMock, {}, () => null);
    expect(api.visibleParentViewport()).toEqual({ top: 0, height: 844 });
    expect(loader).toContain("overflow:auto!important;-webkit-overflow-scrolling:touch");
    ["orientationchange", "visualViewport?.addEventListener(\"resize\"", "aria-labelledby=\"tbModalTitle\"", "modalReturnFocus", "preventScroll:true", "e.key===\"Escape\"", "e.target === $(\"tbModalBack\")"].forEach(value => expect(loader).toContain(value));
    expect(loader).toContain('setAttribute("aria-label",String(t.closeLabel');
  });
});
