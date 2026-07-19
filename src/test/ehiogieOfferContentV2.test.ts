import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { calculateTarifIframeHeight } from "../pages/Tarif";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const tarifPage = readFileSync("src/pages/Tarif.tsx", "utf8");
const rendererSource = loader.slice(loader.indexOf("function removeSeparatorLines"), loader.indexOf("  try{", loader.indexOf("function removeSeparatorLines")));
const ctx = { vorname: "Ada", tariff_name: "Blau", stadt: "Berlin", plz: "10115", tariff_provider: "Ehiogie" };

function install() {
  const dom = new JSDOM('<div id="tbx2026"><div class="hero"></div><div class="aiWrap"><div class="aiHead">Legacy Head</div><div id="ai"></div></div></div>', { runScripts: "outside-only" });
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => dom.window.setTimeout(() => callback(0), 0) as unknown as number;
  dom.window.cancelAnimationFrame = (id: number) => dom.window.clearTimeout(id);
  const factory = new Function("window", "document", "setTimeout", "Node", String.raw`const requestAnimationFrame=window.requestAnimationFrame.bind(window); const cancelAnimationFrame=window.cancelAnimationFrame.bind(window); const $=(id)=>document.getElementById(id); const interp=(text,ctx)=>String(text||"").replace(/\{\{(\w+)\}\}/g,(_,k)=>ctx[k]??"").replace(/\{(\w+)\}/g,(_,k)=>ctx[k]??""); ${rendererSource}; return {renderFazit,validateOfferContentV2,renderAiSummaryV2,renderAiSummary,renderOfferSummary};`);
  return { dom, api: factory(dom.window, dom.window.document, dom.window.setTimeout.bind(dom.window), dom.window.Node) };
}

function payload() {
  return { format_version: 2, fazit: "Erster Absatz.\n\nZweiter Absatz.", ki_zusammenfassung: "✨ Zentral\n\n🔍 Antwort", title: { icon: "✨", text: "Deine Tarifprüfung" }, methodology_toggle: { collapsed_label: "So wurde dein Tarif geprüft", expanded_label: "Prüfdetails ausblenden" }, sections: [
    { id: "central_insight", icon: "💡", title: "Zentrale Erkenntnis", group: "main", blocks: [{ type: "paragraph", text: "Absatz" }, { type: "answer", text: "Antwort" }, { type: "subheading", text: "Untertitel" }, { type: "list", items: [{ title: "Titel", text: "Text" }] }] },
    { id: "timing", icon: "⏳", title: "Prüfung 1", group: "methodology", blocks: [{ type: "paragraph", text: "M1" }] },
    { id: "selection_reason", icon: "🛡️", title: "Prüfung 2", group: "methodology", blocks: [{ type: "paragraph", text: "M2" }] },
    { id: "risks", icon: "🔒", title: "Prüfung 3", group: "methodology", blocks: [{ type: "paragraph", text: "M3" }] },
    { id: "comparison", icon: "🔎", title: "Vergleich", group: "main", blocks: [{ type: "paragraph", text: "V" }] },
    { id: "effort", icon: "⚙️", title: "Aufwand", group: "main", blocks: [{ type: "paragraph", text: "A" }] },
    { id: "changes", icon: "✅", title: "Änderungen", group: "main", blocks: [{ type: "paragraph", text: "Ä" }] },
    { id: "inaction", icon: "💸", title: "Ohne Wechsel", group: "main", blocks: [{ type: "paragraph", text: "O" }] },
    { id: "recommendation", icon: "👉", title: "Empfehlung", group: "main", blocks: [{ type: "ordered_list", items: ["Jetzt wechseln"] }] },
  ] };
}

function stubDoc(rootBottom: number, scrollHeight = rootBottom) {
  const dom = new JSDOM('<div id="tbx2026"></div>');
  Object.defineProperty(dom.window.HTMLElement.prototype, "getBoundingClientRect", { configurable: true, value: () => ({ bottom: rootBottom }) });
  Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(dom.window.document.body, "scrollHeight", { configurable: true, value: scrollHeight });
  return dom.window.document;
}

describe("Ehiogie Offer Content V2 parity", () => {
  it("accepts the direct nine-section snapshot group order and renders methodology once at the end", () => {
    const { dom, api } = install(); const content = payload();
    expect(api.validateOfferContentV2(content)).toEqual({ valid: true, reason: "" });
    expect(api.renderOfferSummary(dom.window.document.getElementById("ai"), content, content.ki_zusammenfassung, ctx, "de", "spart")).toBe("v2");
    const text = dom.window.document.getElementById("ai")!.textContent!;
    expect(text.indexOf("Vergleich")).toBeLessThan(text.indexOf("So wurde dein Tarif geprüft"));
    expect(dom.window.document.querySelectorAll(".aiDetails")).toHaveLength(1);
    expect(dom.window.document.querySelector(".aiDetails")?.textContent).toContain("Prüfung 1");
  });

  it("uses structured V2 rendering, German classes, semantics, and a closed methodology toggle", () => {
    const { dom, api } = install(); const content = payload(); const ai = dom.window.document.getElementById("ai")!;
    api.renderOfferSummary(ai, content, content.ki_zusammenfassung, ctx, "de", "spart");
    expect(ai.classList.contains("aiStructured")).toBe(true);
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiGerman")).toBe(true);
    expect(dom.window.document.getElementById("tbx2026")?.classList.contains("offerGerman")).toBe(true);
    expect(dom.window.document.querySelector(".aiHead")?.className).toBe("aiHead");
    expect(loader).toContain(".aiWrap.aiGerman .aiHead{display:none");
    ["aiMainHeading", "aiFirstHeading", "aiParagraph", "aiAnswerLead", "aiSubheading", "aiList", "aiListItem", "aiListTitle", "aiListText"].forEach(name => expect(ai.querySelector(`.${name}`)).toBeTruthy());
    const toggle = ai.querySelector("button.aiDetailsToggle") as HTMLButtonElement;
    const details = ai.querySelector(".aiDetails") as HTMLElement;
    expect(toggle.textContent).toBe("So wurde dein Tarif geprüft"); expect(toggle.getAttribute("aria-expanded")).toBe("false"); expect(details.hidden).toBe(true);
    toggle.click(); expect(toggle.textContent).toBe("Prüfdetails ausblenden"); expect(details.hidden).toBe(false);
    toggle.click(); expect(toggle.textContent).toBe("So wurde dein Tarif geprüft"); expect(details.hidden).toBe(true);
  });

  it("renders German Fazit paragraphs and preserves the German hero layout", () => {
    const { dom, api } = install(); const fazit = dom.window.document.createElement("div"); dom.window.document.querySelector(".hero")!.append(fazit);
    api.renderFazit(fazit, "Eins.\n\nZwei.", "de");
    expect(fazit.classList.contains("fazitStructured")).toBe(true); expect(fazit.querySelectorAll("p")).toHaveLength(2);
    expect(dom.window.document.querySelector(".hero")?.classList.contains("heroGerman")).toBe(true);
    expect(loader).toContain(".hero.heroGerman .save{align-self:start!important;height:auto!important;}");
  });

  it("uses structured German legacy fallback rather than an unstructured textContent path", () => {
    const { dom, api } = install(); const legacy = "✨ Überschrift\n\nEin Absatz\n\n🔍 Nächste Überschrift\n\nNoch ein Absatz";
    expect(api.renderOfferSummary(dom.window.document.getElementById("ai"), { format_version: 1 }, legacy, ctx, "de", "spart")).toBe("legacy");
    expect(dom.window.document.getElementById("ai")?.classList.contains("aiStructured")).toBe(true);
    expect(loader).toContain('renderOfferSummary($("tbAiText"),U,summaryText,ctx,lang,usecase)');
    expect(loader).not.toContain('$("tbAiText").textContent=summaryText');
  });

  it("keeps iframe grow/shrink behavior and Ehiogie-only configuration", () => {
    expect(calculateTarifIframeHeight(stubDoc(1500))).toBe(1508); expect(calculateTarifIframeHeight(stubDoc(900, 1500))).toBe(908);
    expect(tarifPage).toContain("observer.observe(observedRoot)");
    ["tn90CyE3XuYFTy4c1M3F", "www.ehiogie-energieassistent.de", "tarif_snapshot", "abschlaege_pro_jahr", "appendChild(changeBtn)", "--tb-save-bg"].forEach(value => expect(loader).toContain(value));
    expect(loader).not.toContain("www.kromen-energieassistent.de"); expect(loader).not.toContain("Ddc0DVM8MT67wmLP3wAA");
  });
});
