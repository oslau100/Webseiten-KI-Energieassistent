import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const tarifPage = readFileSync("src/pages/Tarif.tsx", "utf8");
const v2Code = loader.slice(loader.indexOf("const OFFER_V2_ALLOWED_VARIABLES"), loader.indexOf("function pickAiBlock"));

function install() {
  const dom = new JSDOM('<div id="ai"></div>', { runScripts: "outside-only" });
  dom.window.eval(v2Code);
  return dom;
}

function validPayload() {
  return {
    format_version: 2,
    fazit: "Fazit {vorname}",
    ki_zusammenfassung: "Legacy {{tariff_name}}",
    title: { icon: "✨", text: "Titel {stadt}" },
    methodology_toggle: { collapsed_label: "Details {plz}", expanded_label: "Ausblenden {{plz}}" },
    sections: [
      { id: "central_insight", icon: "💡", title: "Antwort {tariff_provider}", group: "main", blocks: [
        { type: "paragraph", text: "Absatz" },
        { type: "subheading", text: "Zwischen" },
        { type: "answer", text: "Antwort" },
        { type: "list", items: ["Punkt", { title: "Objekt", text: "Text" }] },
        { type: "ordered_list", items: ["Eins"] },
      ] },
      { id: "timing", icon: "🧪", title: "Methode 1", group: "methodology", blocks: [{ type: "paragraph", text: "M1" }] },
      { id: "selection_reason", icon: "📌", title: "Methode 2", group: "methodology", blocks: [{ type: "paragraph", text: "M2" }] },
      { id: "recommendation", icon: "✅", title: "Empfehlung", group: "main", blocks: [{ type: "paragraph", text: "Ende" }] },
    ],
  };
}
const ctx = { vorname: "Ada", tariff_name: "Blau", stadt: "Berlin", plz: "10115", tariff_provider: "Ehiogie" };

describe("Ehiogie Offer Content V2", () => {
  it("keeps German and non-German legacy rendering without warning for missing format_version", () => {
    expect(loader).toContain("function pickAiBlock");
    expect(loader).toContain("function buildKiSummaryText");
    expect(loader).toContain('if(U&&U.format_version===2)');
    expect(loader).toContain('else {summaryText=(buildKiSummaryText(U,ctx,lang)');
    expect(loader).not.toContain('console.warn("format_version');
  });

  it("accepts a valid V2 contract and renders every block type in array order", () => {
    const dom = install();
    const api = (dom.window as any).__ehiogieOfferContentV2;
    const payload = validPayload();
    expect(() => api.validateOfferContentV2(payload)).not.toThrow();
    api.renderOfferContentV2(dom.window.document.getElementById("ai"), payload, ctx);
    const text = dom.window.document.getElementById("ai")!.textContent!;
    expect(text).toContain("✨Titel Berlin");
    expect(text).toContain("💡Antwort Ehiogie");
    const blockTexts = Array.from(dom.window.document.querySelectorAll(".aiParagraph,.aiSubheading,.aiList")).map((el) => el.textContent);
    expect(blockTexts.slice(0, 5)).toEqual(["Absatz", "Zwischen", "Antwort", "PunktObjektText", "Eins"]);
    expect(dom.window.document.querySelector(".aiParagraph")).toBeTruthy();
    expect(dom.window.document.querySelector(".aiSubheading")).toBeTruthy();
    expect(dom.window.document.querySelector(".aiAnswerLead")).toBeTruthy();
    expect(dom.window.document.querySelector("ul.aiList")).toBeTruthy();
    expect(dom.window.document.querySelector("ol.aiList")).toBeTruthy();
    expect(dom.window.document.querySelector(".aiListItem")).toBeTruthy();
    expect(dom.window.document.querySelector(".aiListTitle")?.textContent).toBe("Objekt");
    expect(dom.window.document.querySelector(".aiListText")?.textContent).toBe("Text");
  });

  it("rejects invalid contract shapes", () => {
    const api = (install().window as any).__ehiogieOfferContentV2;
    const cases = [
      (p:any)=>{p.sections[0].id="bad"}, (p:any)=>{p.sections.push({...p.sections[0]})}, (p:any)=>{p.sections[0].group="bad"},
      (p:any)=>{p.sections[0].blocks[0].type="bad"}, (p:any)=>{p.sections=[]}, (p:any)=>{p.sections[0].blocks=[]},
      (p:any)=>{p.sections[0].blocks[0].text=""}, (p:any)=>{p.sections[0].blocks[1].text=""}, (p:any)=>{p.sections[0].blocks[2].text=""},
      (p:any)=>{p.sections[0].blocks[3].items=[]}, (p:any)=>{p.sections[0].blocks[3].items=[""]},
      (p:any)=>{p.sections[0].blocks[3].items=[{}]}, (p:any)=>{p.sections[0].blocks[3].items=[{title:"T"}]},
      (p:any)=>{p.fazit="{unknown}"}, (p:any)=>{p.fazit="{vorname"}, (p:any)=>{p.fazit="{{vorname}"},
      (p:any)=>{p.fazit="{{vor-name}}"}, (p:any)=>{p.fazit="{{vor.name}}"}, (p:any)=>{p.fazit="{{vor name}}"},
    ];
    for (const mutate of cases) { const p = validPayload(); mutate(p); expect(() => api.validateOfferContentV2(p)).toThrow(); }
  });

  it("escapes HTML/script as text and uses no V2 innerHTML or insertAdjacentHTML", () => {
    const dom = install(); const api = (dom.window as any).__ehiogieOfferContentV2; const p = validPayload();
    p.title.text = "<img src=x onerror=alert(1)>"; p.sections[0].blocks[0].text = "<script>alert(1)</script>";
    api.renderOfferContentV2(dom.window.document.getElementById("ai"), p, ctx);
    expect(dom.window.document.querySelector("script")).toBeNull();
    expect(dom.window.document.querySelector("img")).toBeNull();
    expect(dom.window.document.body.textContent).toContain("<script>alert(1)</script>");
    const renderBody = v2Code.slice(v2Code.indexOf("function renderOfferContentV2"));
    expect(renderBody).not.toContain("innerHTML");
    expect(renderBody).not.toContain("insertAdjacentHTML");
    expect(renderBody).not.toContain("eval(");
    expect(renderBody).not.toContain("new Function");
  });

  it("falls back to full legacy summary for invalid V2 and unexpected renderer errors", () => {
    expect(loader).toContain("Offer Content V2 konnte nicht gerendert werden; Legacy-Fallback wird verwendet.");
    expect(loader).toContain('buildKiSummaryText(U,ctx,lang)');
    expect(loader).toContain('$("tbAiText").textContent=summaryText || "—"');
  });

  it("places exactly one accessible toggle after all main sections and preserves methodology order", () => {
    const dom = install(); const api = (dom.window as any).__ehiogieOfferContentV2;
    api.renderOfferContentV2(dom.window.document.getElementById("ai"), validPayload(), ctx);
    const toggles = dom.window.document.querySelectorAll("button.aiDetailsToggle");
    const details = dom.window.document.querySelectorAll(".aiDetails");
    expect(toggles).toHaveLength(1); expect(details).toHaveLength(1);
    const toggle = toggles[0] as HTMLButtonElement; const detail = details[0] as HTMLElement;
    expect(toggle.type).toBe("button"); expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe(detail.id); expect(detail.hidden).toBe(true);
    const text = dom.window.document.getElementById("ai")!.textContent!;
    expect(text.indexOf("💡Antwort")).toBeLessThan(text.indexOf("✅Empfehlung"));
    expect(text.indexOf("Details 10115")).toBeGreaterThan(text.indexOf("✅Empfehlung"));
    expect(detail.textContent!.indexOf("Methode 1")).toBeLessThan(detail.textContent!.indexOf("Methode 2"));
    toggle.click(); expect(toggle.getAttribute("aria-expanded")).toBe("true"); expect(detail.hidden).toBe(false); expect(toggle.textContent).toBe("Ausblenden 10115");
    toggle.click(); expect(toggle.getAttribute("aria-expanded")).toBe("false"); expect(detail.hidden).toBe(true); expect(toggle.textContent).toBe("Details 10115");
    expect(detail.style.height).toBe(""); expect(detail.style.minHeight).toBe(""); expect(detail.style.maxHeight).toBe("");
  });

  it("creates no toggle without methodology and requests layout sync on toggles", () => {
    const dom = install(); let resizes = 0; dom.window.addEventListener("resize", () => resizes++);
    const api = (dom.window as any).__ehiogieOfferContentV2; const p = validPayload(); p.sections = p.sections.filter((s:any)=>s.group === "main");
    api.renderOfferContentV2(dom.window.document.getElementById("ai"), p, ctx);
    expect(dom.window.document.querySelector(".aiDetailsToggle")).toBeNull();
    const p2 = validPayload(); api.renderOfferContentV2(dom.window.document.getElementById("ai"), p2, ctx);
    (dom.window.document.querySelector(".aiDetailsToggle") as HTMLButtonElement).click();
    (dom.window.document.querySelector(".aiDetailsToggle") as HTMLButtonElement).click();
    expect(resizes).toBeGreaterThanOrEqual(2);
  });

  it("uses stable iframe logic and preserves Ehiogie constants", () => {
    expect(tarifPage).toContain('getElementById("tbx2026")');
    expect(tarifPage).toContain("getBoundingClientRect()");
    expect(tarifPage).toContain("marginBottom");
    expect(tarifPage).toContain("requestAnimationFrame");
    expect(tarifPage).toContain("cancelAnimationFrame");
    expect(tarifPage).toContain("observer.observe(observedRoot)");
    expect(loader).toContain('locationId: "tn90CyE3XuYFTy4c1M3F"');
    expect(loader).toContain("www.ehiogie-energieassistent.de");
    expect(loader).toContain("abschlaege_pro_jahr");
    expect(loader).toContain('usecase === "neueinzug"');
    expect(loader).toContain("appendChild(changeBtn)");
    expect(loader).not.toContain("www.kromen");
    expect(loader).not.toContain("Ddc0DVM8MT67wmLP3wAA");
  });
});
