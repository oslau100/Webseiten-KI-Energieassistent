import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { calculateTarifIframeHeight } from "../pages/Tarif";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const tarifPage = readFileSync("src/pages/Tarif.tsx", "utf8");
const rendererSource = loader.slice(
  loader.indexOf("const OFFER_V2_ALLOWED_VARIABLES"),
  loader.indexOf("function pickAiBlock"),
);

function install() {
  const dom = new JSDOM('<div class="aiWrap"><div class="aiHead">Legacy Head</div><div id="ai"></div></div>', {
    runScripts: "outside-only",
  });
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => dom.window.setTimeout(() => callback(0), 0) as unknown as number;
  dom.window.cancelAnimationFrame = (id: number) => dom.window.clearTimeout(id);
  const factory = new Function(
    "window",
    "document",
    "setTimeout",
    `${rendererSource}; return { validateOfferContentV2, renderStructuredBlock, renderStructuredSection, renderMethodologyGroupV2, renderAiSummaryV2, markHeadingsAfterAnswers, scheduleOfferLayoutSync, clearAiV2State };`,
  );
  return { dom, api: factory(dom.window, dom.window.document, dom.window.setTimeout.bind(dom.window)) };
}

function validPayload() {
  return {
    format_version: 2,
    fazit: "",
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

function stubDoc({ rootBottom, marginBottom = "0px", docScroll = 0, bodyScroll = 0, offsetHeight = 0, withRoot = true }: any) {
  const dom = new JSDOM(withRoot ? '<div id="tbx2026"></div>' : '<main></main>');
  Object.defineProperty(dom.window.HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value() { return { bottom: rootBottom ?? 0, top: 0, left: 0, right: 0, width: 0, height: 0 }; },
  });
  vi.spyOn(dom.window, "getComputedStyle").mockReturnValue({ marginBottom } as CSSStyleDeclaration);
  Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: docScroll });
  Object.defineProperty(dom.window.document.body, "scrollHeight", { configurable: true, value: bodyScroll });
  Object.defineProperty(dom.window.document.documentElement, "offsetHeight", { configurable: true, value: offsetHeight });
  return dom.window.document;
}

describe("Ehiogie Offer Content V2", () => {
  it("matches Kromen V2 CSS hierarchy for typography, lists, toggle and mobile values", () => {
    const css = loader.slice(loader.indexOf("#tbx2026 .aiWrap.aiV2"), loader.indexOf("#tbx2026 .sk"));
    expect(css).toContain("#tbx2026 .aiTxt.aiStructured");
    expect(css).toContain("font-size:15px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiParagraph");
    expect(css).toContain("#tbx2026 .aiStructured .aiMainHeading");
    expect(css).toContain("font-size:16px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiFirstHeading");
    expect(css).toContain("font-size:20px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiAnswerLead{font-weight:600!important");
    expect(css).not.toContain("font-weight:900!important;color:rgba(11,16,32,.88)!important;background");
    expect(css).not.toContain("border-radius:16px");
    expect(css).not.toContain("padding:12px");
    expect(css).toContain("#tbx2026 .aiStructured .aiHeadingAfterAnswer{margin-top:32px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiListTitle{display:block!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiListText{display:block!important");
    expect(css).not.toContain("aiListTitle::after");
    expect(css).not.toContain('content=": "');
    expect(css).not.toContain('content:": "');
    expect(css).toContain("#tbx2026 .aiStructured .aiDetailsToggle");
    expect(css).toContain("color:var(--tb-ink)!important");
    expect(css).toContain("text-decoration:none!important");
    expect(css).not.toContain("color:var(--tb-btn-primary-bg");
    expect(css).not.toContain("text-decoration:underline");
    expect(css).toContain('@media (max-width:560px)');
    expect(css).toContain("#tbx2026 .aiTxt.aiStructured{font-size:14px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiFirstHeading{font-size:18px!important");
    expect(css).toContain("#tbx2026 .aiStructured .aiHeadingAfterAnswer{margin-top:28px!important");
  });

  it("keeps German and non-German legacy rendering without warning for missing format_version and shows aiHead", () => {
    expect(loader).toContain("function pickAiBlock");
    expect(loader).toContain("function buildKiSummaryText");
    expect(loader).toContain('if(U&&U.format_version===2)');
    expect(loader).toContain('else {summaryText=(buildKiSummaryText(U,ctx,lang)');
    expect(loader).not.toContain('console.warn("format_version');
    const { dom, api } = install();
    api.clearAiV2State(dom.window.document.getElementById("ai"));
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiV2")).toBe(false);
    expect(loader).toContain(".aiWrap.aiV2 .aiHead");
  });

  it("accepts a valid V2 contract and renders every block type in array order", () => {
    const { dom, api } = install();
    const payload = validPayload();
    expect(() => api.validateOfferContentV2(payload)).not.toThrow();
    api.renderAiSummaryV2(dom.window.document.getElementById("ai"), payload, ctx);
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
    expect(dom.window.document.querySelector(".aiListTitle")?.nextElementSibling?.classList.contains("aiListText")).toBe(true);
  });

  it("rejects invalid contract shapes, arrays, placeholders, groups, sections and blocks", () => {
    const { api } = install();
    const cases = [
      (p:any)=>{p.fazit=7}, (p:any)=>{p.ki_zusammenfassung=""}, (p:any)=>{p.title=[]},
      (p:any)=>{p.sections[0]=[]}, (p:any)=>{p.sections[0].id="bad"}, (p:any)=>{p.sections.push({...p.sections[0]})},
      (p:any)=>{p.sections[0].group="bad"}, (p:any)=>{p.sections[0].blocks[0]=[]}, (p:any)=>{p.sections[0].blocks[0].type="bad"},
      (p:any)=>{p.sections=[]}, (p:any)=>{p.sections[0].blocks=[]}, (p:any)=>{p.sections[0].blocks[0].text=""},
      (p:any)=>{p.sections[0].blocks[1].text=""}, (p:any)=>{p.sections[0].blocks[2].text=""},
      (p:any)=>{p.sections[0].blocks[3].items=[]}, (p:any)=>{p.sections[0].blocks[3].items=[""]},
      (p:any)=>{p.sections[0].blocks[3].items=[[]]}, (p:any)=>{p.sections[0].blocks[3].items=[{}]},
      (p:any)=>{p.sections[0].blocks[3].items=[{title:"T"}]}, (p:any)=>{p.fazit="{unknown}"},
      (p:any)=>{p.fazit="{vorname"}, (p:any)=>{p.fazit="{{vorname}"}, (p:any)=>{p.fazit="{{vor-name}}"},
      (p:any)=>{p.fazit="{{vor.name}}"}, (p:any)=>{p.fazit="{{vor name}}"},
    ];
    for (const mutate of cases) { const p = validPayload(); mutate(p); expect(() => api.validateOfferContentV2(p)).toThrow(); }
  });

  it("escapes HTML/script as text and uses no V2 production innerHTML or insertAdjacentHTML", () => {
    const { dom, api } = install(); const p = validPayload();
    p.title.text = "<img src=x onerror=alert(1)>"; p.sections[0].blocks[0].text = "<script>alert(1)</script>";
    api.renderAiSummaryV2(dom.window.document.getElementById("ai"), p, ctx);
    expect(dom.window.document.querySelector("script")).toBeNull();
    expect(dom.window.document.querySelector("img")).toBeNull();
    expect(dom.window.document.body.textContent).toContain("<script>alert(1)</script>");
    expect(rendererSource).not.toContain("innerHTML");
    expect(rendererSource).not.toContain("insertAdjacentHTML");
    expect(rendererSource).not.toContain("eval(");
    expect(rendererSource).not.toContain("new Function");
    expect(loader).not.toContain("window.__ehiogieOfferContentV2");
  });

  it("adds aiV2 on valid V2 and removes it for legacy fallback paths", () => {
    const { dom, api } = install(); const container = dom.window.document.getElementById("ai")!;
    api.renderAiSummaryV2(container, validPayload(), ctx);
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiV2")).toBe(true);
    expect(container.classList.contains("aiStructured")).toBe(true);
    api.clearAiV2State(container);
    container.textContent = "Legacy";
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiV2")).toBe(false);
    expect(container.classList.contains("aiStructured")).toBe(false);
    expect(container.textContent).toBe("Legacy");
  });

  it("invalid V2 and unexpected renderer errors remove aiV2 and show legacy text", () => {
    const { dom, api } = install(); const container = dom.window.document.getElementById("ai")!;
    api.renderAiSummaryV2(container, validPayload(), ctx);
    try { api.renderAiSummaryV2(container, { ...validPayload(), sections: [] }, ctx); } catch { api.clearAiV2State(container); container.textContent = "Legacy fallback"; }
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiV2")).toBe(false);
    expect(container.textContent).toBe("Legacy fallback");
    api.renderAiSummaryV2(container, validPayload(), ctx);
    const original = container.replaceChildren; container.replaceChildren = () => { throw new Error("boom"); };
    try { api.renderAiSummaryV2(container, validPayload(), ctx); } catch { api.clearAiV2State(container); container.textContent = "Legacy after boom"; }
    container.replaceChildren = original;
    expect(dom.window.document.querySelector(".aiWrap")?.classList.contains("aiV2")).toBe(false);
    expect(container.textContent).toBe("Legacy after boom");
    expect(loader).toContain("clearAiV2State");
  });

  it("places one accessible toggle after all main sections, preserves methodology order and toggles cleanly", () => {
    const { dom, api } = install();
    api.renderAiSummaryV2(dom.window.document.getElementById("ai"), validPayload(), ctx);
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

  it("creates no toggle without methodology and requests layout sync on open and close", () => {
    const { dom, api } = install(); let resizes = 0; dom.window.addEventListener("resize", () => resizes++);
    const p = validPayload(); p.sections = p.sections.filter((s:any)=>s.group === "main");
    api.renderAiSummaryV2(dom.window.document.getElementById("ai"), p, ctx);
    expect(dom.window.document.querySelector(".aiDetailsToggle")).toBeNull();
    const p2 = validPayload(); api.renderAiSummaryV2(dom.window.document.getElementById("ai"), p2, ctx);
    (dom.window.document.querySelector(".aiDetailsToggle") as HTMLButtonElement).click();
    (dom.window.document.querySelector(".aiDetailsToggle") as HTMLButtonElement).click();
    return new Promise<void>((resolve) => dom.window.setTimeout(() => { expect(resizes).toBeGreaterThanOrEqual(1); resolve(); }, 0));
  });

  it("marks following main headings after answer with DOM-based logic only", () => {
    const { dom, api } = install(); const container = dom.window.document.getElementById("ai")!;
    const p = validPayload(); p.sections = [
      { id: "central_insight", icon: "A", title: "Answer section", group: "main", blocks: [{ type: "answer", text: "yes" }] },
      { id: "recommendation", icon: "B", title: "Next section", group: "main", blocks: [{ type: "paragraph", text: "after" }] },
    ];
    api.renderAiSummaryV2(container, p, ctx);
    expect(Array.from(container.querySelectorAll(".aiMainHeading"))[2].classList.contains("aiHeadingAfterAnswer")).toBe(true);
    p.sections[0].blocks = [{ type: "paragraph", text: "plain" }]; api.renderAiSummaryV2(container, p, ctx);
    expect(Array.from(container.querySelectorAll(".aiMainHeading"))[2].classList.contains("aiHeadingAfterAnswer")).toBe(false);
    p.sections[0].blocks = [{ type: "list", items: ["plain"] }]; api.renderAiSummaryV2(container, p, ctx);
    expect(Array.from(container.querySelectorAll(".aiMainHeading"))[2].classList.contains("aiHeadingAfterAnswer")).toBe(false);
    const mid = validPayload(); api.renderAiSummaryV2(container, mid, ctx);
    expect(container.textContent!.indexOf("✅Empfehlung")).toBeLessThan(container.textContent!.indexOf("Details 10115"));
  });

  it("calculates iframe grow and shrink from #tbx2026 without stale scrollHeight blocking shrink", () => {
    expect(calculateTarifIframeHeight(stubDoc({ rootBottom: 1500, docScroll: 1500, bodyScroll: 1500 }))).toBe(1500);
    expect(calculateTarifIframeHeight(stubDoc({ rootBottom: 900, docScroll: 1500, bodyScroll: 1500 }))).toBe(900);
    expect(calculateTarifIframeHeight(stubDoc({ rootBottom: 900, marginBottom: "24px" }))).toBe(924);
    expect(calculateTarifIframeHeight(stubDoc({ withRoot: false, docScroll: 500, bodyScroll: 700, offsetHeight: 650 }))).toBe(700);
    expect(calculateTarifIframeHeight(stubDoc({ rootBottom: 0, docScroll: 0, bodyScroll: 0 }))).toBe(1);
  });

  it("uses stable iframe scheduling and preserves Ehiogie constants", () => {
    expect(tarifPage).toContain('getElementById("tbx2026")');
    expect(tarifPage).toContain("offerRoot");
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
