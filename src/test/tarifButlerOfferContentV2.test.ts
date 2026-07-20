import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { calculateFunnelFrameHeight } from "../components/FunnelFrame";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const tarifPage = readFileSync("src/pages/Tarif.tsx", "utf8");
const funnelFrame = readFileSync("src/components/FunnelFrame.tsx", "utf8");
const rendererSource = loader.slice(loader.indexOf("function removeSeparatorLines"), loader.indexOf("  try{", loader.indexOf("function removeSeparatorLines")));
const ctx = { vorname: "Ada", tariff_name: "Blau", stadt: "Berlin", plz: "10115", tariff_provider: "TarifButler" };

function install() {
  const dom = new JSDOM('<div id="tbx2026"><div class="hero"></div><div class="aiWrap"><div class="aiHead">Legacy Head</div><div id="ai"></div></div></div>', { runScripts: "outside-only" });
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => dom.window.setTimeout(() => callback(0), 0) as unknown as number;
  dom.window.cancelAnimationFrame = (id: number) => dom.window.clearTimeout(id);
  const factory = new Function("window", "document", "setTimeout", "Node", String.raw`const requestAnimationFrame=window.requestAnimationFrame.bind(window); const cancelAnimationFrame=window.cancelAnimationFrame.bind(window); const $=(id)=>document.getElementById(id); const interp=(text,ctx)=>String(text||"").replace(/\{\{(\w+)\}\}/g,(_,k)=>ctx[k]??"").replace(/\{(\w+)\}/g,(_,k)=>ctx[k]??""); ${rendererSource}; return {renderFazit,validateOfferContentV2,renderStructuredBlock,renderAiSummaryV2,renderAiSummary,renderOfferSummary};`);
  return { dom, api: factory(dom.window, dom.window.document, dom.window.setTimeout.bind(dom.window), dom.window.Node) };
}

function payload() {
  const section = (id: string, icon: string, title: string, group: string, blocks = [{ type: "paragraph", text: title }]) => ({ id, icon, title, group, blocks });
  return { format_version: 2, fazit: "Erster Absatz.\n\nZweiter Absatz.", ki_zusammenfassung: "✨ Zentral\n\nAbsatz", title: { icon: "✨", text: "Titel {stadt}" }, methodology_toggle: { collapsed_label: "So wurde dein Tarif geprüft", expanded_label: "Prüfdetails ausblenden" }, sections: [
    section("central_insight", "💡", "Zentrale Erkenntnis", "main", [{ type: "paragraph", text: "Absatz" }, { type: "subheading", text: "Zwischen" }, { type: "answer", text: "Antwort" }, { type: "list", items: ["Punkt", { title: "Objekt", text: "Text" }] }, { type: "ordered_list", items: ["Eins"] }]),
    section("selection_reason", "🛡️", "Auswahl", "methodology"), section("risks", "🔒", "Risiken", "methodology"), section("comparison", "🔎", "Vergleich", "methodology"),
    section("effort", "⚙️", "Aufwand", "main"), section("changes", "✅", "Änderungen", "main"), section("inaction", "💸", "Ohne Wechsel", "main"), section("timing", "⏳", "Zeitpunkt", "main"), section("recommendation", "👉", "Empfehlung", "main"),
  ] };
}

function stubDoc({ rootBottom, marginBottom = "0px", docScroll = 0, bodyScroll = 0, offsetHeight = 0, withRoot = true }: any) {
  const dom = new JSDOM(withRoot ? '<div id="tbx2026"></div>' : "<main></main>");
  Object.defineProperty(dom.window.HTMLElement.prototype, "getBoundingClientRect", { configurable: true, value: () => ({ bottom: rootBottom ?? 0 }) });
  vi.spyOn(dom.window, "getComputedStyle").mockReturnValue({ marginBottom } as CSSStyleDeclaration);
  Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: docScroll });
  Object.defineProperty(dom.window.document.body, "scrollHeight", { configurable: true, value: bodyScroll });
  Object.defineProperty(dom.window.document.documentElement, "offsetHeight", { configurable: true, value: offsetHeight });
  return dom.window.document;
}

describe("TarifButler Offer Content V2 parity", () => {
  it("matches Kromen desktop/mobile, RTL, reduced-motion, Fazit and Hero CSS", () => {
    ["#tbx2026.offerGerman{padding-bottom:8px!important;}", ".fazit.fazitStructured{margin-top:12px!important;line-height:1.55!important;white-space:normal!important;}", ".hero.heroGerman .save{align-self:start!important;height:auto!important;}", ".aiWrap.aiGerman .aiHead{display:none!important;margin:0!important;}", ".aiTxt.aiStructured{max-width:88ch!important;font-size:15px!important;line-height:1.6!important", ".aiMainHeading.aiFirstHeading{margin:0 0 18px 0!important;font-size:20px!important", ".aiDetailsToggle:focus-visible{outline:2px solid var(--tb-ink)!important", "@media (prefers-reduced-motion: reduce)", "#tbx2026.rtl .aiTxt.aiStructured", "@media (max-width:460px)"].forEach(value => expect(loader).toContain(value));
    expect(loader).not.toContain("line-height:1.72"); expect(loader).not.toContain("aiListTitle::after");
  });

  it("accepts the real nine-section order and renders main sections before one ordered methodology group", () => {
    const { dom, api } = install(); const p = payload(); const ai = dom.window.document.getElementById("ai")!;
    expect(api.validateOfferContentV2(p)).toEqual({ valid: true, reason: "" }); expect(api.renderOfferSummary(ai, p, p.ki_zusammenfassung, ctx, "de", "spart")).toBe("v2");
    const text = ai.textContent!; expect(text.indexOf("Empfehlung")).toBeLessThan(text.indexOf("So wurde dein Tarif geprüft"));
    expect(ai.querySelectorAll(".aiDetails")).toHaveLength(1); const details = ai.querySelector(".aiDetails")!;
    expect(details.textContent!.indexOf("Auswahl")).toBeLessThan(details.textContent!.indexOf("Risiken")); expect(details.textContent!.indexOf("Risiken")).toBeLessThan(details.textContent!.indexOf("Vergleich"));
  });

  it("keeps the non-saver main order while collecting methodology once at the end", () => {
    const { dom, api } = install(); const p = payload();
    p.sections = [p.sections[0], p.sections[7], p.sections[1], p.sections[2], p.sections[3], p.sections[4], p.sections[5], p.sections[6], p.sections[8]];
    const ai = dom.window.document.getElementById("ai")!;
    expect(api.validateOfferContentV2(p)).toEqual({ valid: true, reason: "" });
    api.renderOfferSummary(ai, p, p.ki_zusammenfassung, ctx, "de", "nicht_spart");
    const text = ai.textContent!;
    expect(text.indexOf("Zeitpunkt")).toBeLessThan(text.indexOf("Aufwand"));
    expect(ai.querySelectorAll(".aiDetails")).toHaveLength(1);
  });

  it("rejects interleaved methodology after main with the Kromen validator error", () => {
    const { api } = install(); const p = payload(); p.sections[5].group = "methodology";
    expect(api.validateOfferContentV2(p)).toEqual(expect.objectContaining({ valid: false, reason: "Methodology-Sections müssen zusammenhängend sein." }));
  });

  it("renders every block type in order, strings and title/text list objects", () => {
    const { dom, api } = install(); api.renderAiSummaryV2(dom.window.document.getElementById("ai"), payload(), ctx, "de");
    const items = Array.from(dom.window.document.querySelectorAll(".aiParagraph,.aiSubheading,.aiList")).map(node => node.textContent);
    expect(items.slice(0, 5)).toEqual(["Absatz", "Zwischen", "Antwort", "PunktObjektText", "Eins"]);
    ["aiParagraph", "aiSubheading", "aiAnswerLead", "aiList", "aiListItem", "aiListTitle", "aiListText"].forEach(name => expect(dom.window.document.querySelector(`.${name}`)).toBeTruthy());
  });

  it("rejects invalid shapes, IDs, groups, blocks, items, empty fields and placeholder syntax", () => {
    const { api } = install(); const mutations = [(p:any) => p.fazit = 1, (p:any) => p.ki_zusammenfassung = "", (p:any) => p.title = [], (p:any) => p.sections[0] = [], (p:any) => p.sections[0].id = "unknown", (p:any) => p.sections.push({...p.sections[0]}), (p:any) => p.sections[0].group = "bad", (p:any) => p.sections[0].blocks = [], (p:any) => p.sections[0].blocks[0] = [], (p:any) => p.sections[0].blocks[0].type = "bad", (p:any) => p.sections[0].blocks[3].items = [[], {}, {title:"T"}], (p:any) => p.fazit = "{unknown}", (p:any) => p.fazit = "{{vor-name}}", (p:any) => p.fazit = "{{vorname}"];
    mutations.forEach(mutate => { const p = payload(); mutate(p); expect(api.validateOfferContentV2(p).valid).toBe(false); });
    expect(api.validateOfferContentV2(payload()).valid).toBe(true);
  });

  it("renders HTML and scripts as text with no unsafe V2 renderer APIs", () => {
    const { dom, api } = install(); const p = payload(); p.title.text = "<img src=x onerror=alert(1)>"; p.sections[0].blocks[0].text = "<script>alert(1)</script>";
    api.renderAiSummaryV2(dom.window.document.getElementById("ai"), p, ctx, "de");
    expect(dom.window.document.querySelector("script")).toBeNull(); expect(dom.window.document.querySelector("img")).toBeNull(); expect(dom.window.document.body.textContent).toContain("<script>alert(1)</script>");
    ["innerHTML", "insertAdjacentHTML", "eval(", "new Function"].forEach(unsafe => expect(rendererSource).not.toContain(unsafe));
  });

  it("sets German structure classes, paragraphized Fazit and hides the old heading", () => {
    const { dom, api } = install(); const ai = dom.window.document.getElementById("ai")!; api.renderOfferSummary(ai, payload(), "", ctx, "de", "spart");
    expect(ai.classList.contains("aiStructured")).toBe(true); expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiGerman")).toBe(true); expect(dom.window.document.getElementById("tbx2026")?.classList.contains("offerGerman")).toBe(true);
    const fazit = dom.window.document.createElement("div"); dom.window.document.querySelector(".hero")!.append(fazit); api.renderFazit(fazit, "A\n\nB", "de"); expect(fazit.querySelectorAll("p")).toHaveLength(2); expect(fazit.classList.contains("fazitStructured")).toBe(true); expect(dom.window.document.querySelector(".hero")?.classList.contains("heroGerman")).toBe(true);
  });

  it("uses structured German legacy fallback and plain non-German legacy fallback", () => {
    const { dom, api } = install(); const ai = dom.window.document.getElementById("ai")!;
    expect(api.renderOfferSummary(ai, { format_version: 1 }, "✨ Titel\n\nAbsatz", ctx, "de", "spart")).toBe("legacy"); expect(ai.classList.contains("aiStructured")).toBe(true);
    api.renderAiSummary(ai, "English fallback", "en", "spart"); expect(ai.classList.contains("aiStructured")).toBe(false); expect(ai.textContent).toBe("English fallback");
  });

  it("keeps methodology toggle closed, then opens/closes without fixed heights", () => {
    const { dom, api } = install(); api.renderAiSummaryV2(dom.window.document.getElementById("ai"), payload(), ctx, "de"); const toggle = dom.window.document.querySelector("button.aiDetailsToggle") as HTMLButtonElement; const details = dom.window.document.querySelector(".aiDetails") as HTMLElement;
    expect(toggle.textContent).toBe("So wurde dein Tarif geprüft"); expect(toggle.getAttribute("aria-expanded")).toBe("false"); expect(details.hidden).toBe(true); toggle.click(); expect(toggle.textContent).toBe("Prüfdetails ausblenden"); expect(details.hidden).toBe(false); toggle.click(); expect(details.hidden).toBe(true); ["height", "minHeight", "maxHeight", "overflow"].forEach(key => expect((details.style as any)[key]).toBe(""));
  });

  it("calculates deterministic iframe grow/shrink, body margin, fallback and minimum height", () => {
    expect(calculateFunnelFrameHeight(stubDoc({ rootBottom: 1500, marginBottom: "12px", docScroll: 1500, bodyScroll: 1500 }), "tbx2026")).toBe(1512);
    expect(calculateFunnelFrameHeight(stubDoc({ rootBottom: 900, marginBottom: "12px", docScroll: 1500, bodyScroll: 1500 }), "tbx2026")).toBe(912);
    expect(calculateFunnelFrameHeight(stubDoc({ withRoot: false, docScroll: 500, bodyScroll: 700, offsetHeight: 650 }))).toBe(700); expect(calculateFunnelFrameHeight(stubDoc({ rootBottom: 0 }), "tbx2026")).toBe(1);
  });

  it("preserves stable iframe scheduling and all TarifButler-only runtime constants", () => {
    expect(tarifPage).toContain('contentRootId="tbx2026"');
    ["contentRootId", "requestAnimationFrame", "cancelAnimationFrame", "frameObserver.observe(contentRoot)"].forEach(value => expect(funnelFrame).toContain(value));
    ["zMzYbmm0fF0pPpuzSBL7", "www.tarif-butler.de", "tarif_snapshot", "abschlaege_pro_jahr", 'usecase === "neueinzug"', "appendChild(changeBtn)", "--tb-save-bg", "#00ff9d"].forEach(value => expect(loader).toContain(value));
    expect(funnelFrame).toContain("tarifbutler:height"); expect(funnelFrame).toContain("tarifbutler:navigate"); expect(funnelFrame).toContain("getSafeNavigationUrl");
    expect(loader).not.toContain("www.kromen-energieassistent.de"); expect(loader).not.toContain("Ddc0DVM8MT67wmLP3wAA"); expect(loader).not.toContain("tn90CyE3XuYFTy4c1M3F"); expect(loader).not.toContain("www.ehiogie-energieassistent.de");
  });
});
