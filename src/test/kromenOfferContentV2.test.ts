import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const rendererSource = loader.slice(loader.indexOf("  function removeSeparatorLines"), loader.indexOf("  try{", loader.indexOf("  function renderAiSummary")));

type TestBlock = { type: string; text?: string; items?: Array<string | { title: string; text?: string }> };
type TestSection = { id: string; icon: string; title: string; group: string; blocks: TestBlock[] };
type TestContent = {
  format_version: number;
  fazit: string;
  ki_zusammenfassung: string;
  title: { icon: string; text: string };
  methodology_toggle: { collapsed_label: string; expanded_label: string };
  sections: TestSection[];
};

type V2Api = {
  validateOfferContentV2: (content: unknown) => { valid: boolean; reason: string };
  renderAiSummaryV2: (container: HTMLElement, content: TestContent, context: Record<string, string>, language: string) => void;
  renderAiSummary: (container: HTMLElement, text: string, language: string, usecase: string) => void;
  renderOfferSummary: (container: HTMLElement, content: TestContent, legacyText: string, context: Record<string, string>, language: string, usecase: string) => "v2" | "legacy";
};

const createApi = (): V2Api =>
  Function(
    "document",
    "Node",
    "requestAnimationFrame",
    `const interp=(text,ctx)=>String(text||"").replace(/\\{\\{(\\w+)\\}\\}/g,(_,key)=>ctx[key]??"").replace(/\\{(\\w+)\\}/g,(_,key)=>ctx[key]??"");
     const $=id=>document.getElementById(id);
     ${rendererSource}
     return {validateOfferContentV2,renderAiSummaryV2,renderAiSummary,renderOfferSummary};`,
  )(document, Node, (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  }) as V2Api;

const validContent = (): TestContent => ({
  format_version: 2,
  fazit: "Hallo {{vorname}}.",
  ki_zusammenfassung: "✨ Deine Tarifprüfung im Detail\n\nLegacy-Fallback",
  title: { icon: "🌐", text: "Strukturierte Prüfung für {vorname}" },
  methodology_toggle: { collapsed_label: "Methode öffnen", expanded_label: "Methode schließen" },
  sections: [
    {
      id: "central_insight",
      icon: "A",
      title: "Erkenntnis",
      group: "main",
      blocks: [
        { type: "paragraph", text: "Normal für {{tariff_name}}" },
        { type: "subheading", text: "Einordnung" },
        { type: "answer", text: "Klare Antwort" },
        { type: "list", items: ["Punkt 1", "Punkt {laufzeit_monate}"] },
        { type: "ordered_list", items: [{ title: "Preis", text: "Geprüfte Kosten" }] },
        { type: "answer", text: "Strukturell letzte Antwort" },
      ],
    },
    { id: "timing", icon: "T", title: "Direkt nach Antwort", group: "main", blocks: [{ type: "paragraph", text: "Normaler Abschluss" }] },
    { id: "changes", icon: "P", title: "Direkt nach Paragraph", group: "main", blocks: [{ type: "list", items: ["Listenabschluss"] }] },
    { id: "effort", icon: "L", title: "Direkt nach Liste", group: "main", blocks: [{ type: "paragraph", text: "Aufwand" }] },
    { id: "selection_reason", icon: "B", title: "Methodik ohne erwartetes Emoji", group: "methodology", blocks: [{ type: "paragraph", text: "Methode" }] },
    { id: "risks", icon: "C", title: "Risiken", group: "methodology", blocks: [{ type: "list", items: [{ title: "Risiko", text: "Beschreibung" }] }] },
    { id: "recommendation", icon: "D", title: "Empfehlung nach Methodik", group: "main", blocks: [{ type: "answer", text: "Abschluss" }] },
  ],
});

const setupContainer = () => {
  document.body.innerHTML = '<main id="tbx2026"><section class="aiWrap"><div id="summary"></div></section></main>';
  return document.getElementById("summary") as HTMLElement;
};

describe("Kromen Offer Content format_version 2", () => {
  it("keeps German and non-German legacy rendering available", () => {
    const api = createApi();
    const german = setupContainer();
    api.renderAiSummary(german, "✨ Deine Tarifprüfung im Detail\n\nDas bedeutet:\nKlare Antwort", "de", "spart");
    expect(german).toHaveClass("aiStructured");
    expect(german.querySelector(".aiMainHeading")).toHaveTextContent("Deine Tarifprüfung");
    expect(german.querySelector(".aiSubheading")).toHaveTextContent("Das bedeutet:");

    const english = setupContainer();
    api.renderAiSummary(english, "Unchanged plain legacy text", "en", "spart");
    expect(english).not.toHaveClass("aiStructured");
    expect(english).toHaveTextContent("Unchanged plain legacy text");
    expect(english.children).toHaveLength(0);
  });

  it("validates and renders every structured block in array order", () => {
    const api = createApi();
    const content = validContent();
    expect(api.validateOfferContentV2(content)).toEqual({ valid: true, reason: "" });
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, { vorname: "Ada", tariff_name: "Klima", laufzeit_monate: "12" }, "de");

    expect(container.querySelector(".aiFirstHeading")).toHaveTextContent("Strukturierte Prüfung für Ada");
    expect([...container.querySelectorAll(":scope > .aiMainHeading")].map((node) => node.textContent)).toEqual(["🌐 Strukturierte Prüfung für Ada", "A Erkenntnis", "T Direkt nach Antwort", "P Direkt nach Paragraph", "L Direkt nach Liste", "D Empfehlung nach Methodik"]);
    expect(container.querySelector(".aiParagraph:not(.aiAnswerLead)")).toHaveTextContent("Normal für Klima");
    expect(container.querySelector(".aiSubheading")).toHaveTextContent("Einordnung");
    expect(container.querySelector(".aiAnswerLead")).toHaveTextContent("Klare Antwort");
    expect(container.querySelector("ul.aiList")).toHaveTextContent("Punkt 12");
    expect(container.querySelector("ol.aiList .aiListTitle")).toHaveTextContent("Preis");
    expect(container.querySelector("ol.aiList .aiListText")).toHaveTextContent("Geprüfte Kosten");
    expect(container.querySelector(".aiHeadingAfterAnswer")).toHaveTextContent("Direkt nach Antwort");
    expect([...container.querySelectorAll(".aiMainHeading")].find((node) => node.textContent?.includes("Direkt nach Paragraph"))).not.toHaveClass("aiHeadingAfterAnswer");
    expect([...container.querySelectorAll(".aiMainHeading")].find((node) => node.textContent?.includes("Direkt nach Liste"))).not.toHaveClass("aiHeadingAfterAnswer");
    expect([...container.querySelectorAll(".aiMainHeading")].find((node) => node.textContent?.includes("Empfehlung nach Methodik"))).not.toHaveClass("aiHeadingAfterAnswer");
  });

  it("groups methodology by metadata and exposes an accessible, reversible toggle", () => {
    const api = createApi();
    const container = setupContainer();
    api.renderAiSummaryV2(container, validContent(), { vorname: "Ada", tariff_name: "Klima", laufzeit_monate: "12" }, "de");
    const toggle = container.querySelector("button.aiDetailsToggle") as HTMLButtonElement;
    const details = container.querySelector(".aiDetails") as HTMLElement;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", details.id);
    expect(toggle).toHaveTextContent("Methode öffnen");
    expect(details.hidden).toBe(true);
    expect(details).toHaveTextContent("Methodik ohne erwartetes Emoji");
    expect(toggle.previousElementSibling).toHaveTextContent("Abschluss");
    expect(container.lastElementChild).toBe(details);
    toggle.click();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(details.hidden).toBe(false);
    expect(toggle).toHaveTextContent("Methode schließen");
    toggle.click();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(details.hidden).toBe(true);
  });


  it("renders main sections around a middle methodology group and keeps the toggle after the last main section", () => {
    const api = createApi();
    const container = setupContainer();
    api.renderAiSummaryV2(container, validContent(), {}, "de");

    const directNodes = [...container.children];
    const headingTexts = [...container.querySelectorAll(":scope > .aiMainHeading")].map((node) => node.textContent);
    expect(headingTexts).toEqual([
      "🌐 Strukturierte Prüfung für",
      "A Erkenntnis",
      "T Direkt nach Antwort",
      "P Direkt nach Paragraph",
      "L Direkt nach Liste",
      "D Empfehlung nach Methodik",
    ]);

    const toggleIndex = directNodes.findIndex((node) => node.classList.contains("aiDetailsToggle"));
    const recommendationIndex = directNodes.findIndex((node) => node.textContent?.includes("Empfehlung nach Methodik"));
    expect(toggleIndex).toBeGreaterThan(recommendationIndex);
    expect(directNodes.slice(toggleIndex + 1).some((node) => node.classList.contains("aiMainHeading"))).toBe(false);
  });

  it("places the toggle at the end for the Nicht-Sparer structure", () => {
    const api = createApi();
    const content = validContent();
    content.sections = [
      { id: "central_insight", icon: "1", title: "Erkenntnis", group: "main", blocks: [{ type: "paragraph", text: "Eins" }] },
      { id: "effort", icon: "2", title: "Aufwand", group: "main", blocks: [{ type: "paragraph", text: "Zwei" }] },
      { id: "selection_reason", icon: "3", title: "Auswahl", group: "methodology", blocks: [{ type: "paragraph", text: "Drei" }] },
      { id: "risks", icon: "4", title: "Risiken", group: "methodology", blocks: [{ type: "paragraph", text: "Vier" }] },
      { id: "comparison", icon: "5", title: "Vergleich", group: "methodology", blocks: [{ type: "paragraph", text: "Fünf" }] },
      { id: "changes", icon: "6", title: "Änderungen", group: "main", blocks: [{ type: "paragraph", text: "Sechs" }] },
      { id: "inaction", icon: "7", title: "Untätigkeit", group: "main", blocks: [{ type: "paragraph", text: "Sieben" }] },
      { id: "timing", icon: "8", title: "Zeitpunkt", group: "main", blocks: [{ type: "paragraph", text: "Acht" }] },
      { id: "recommendation", icon: "9", title: "Empfehlung", group: "main", blocks: [{ type: "paragraph", text: "Neun" }] },
    ];
    expect(api.validateOfferContentV2(content).valid).toBe(true);
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, {}, "de");

    expect([...container.querySelectorAll(":scope > .aiMainHeading")].map((node) => node.textContent)).toEqual([
      "🌐 Strukturierte Prüfung für",
      "1 Erkenntnis",
      "2 Aufwand",
      "6 Änderungen",
      "7 Untätigkeit",
      "8 Zeitpunkt",
      "9 Empfehlung",
    ]);
    const toggle = container.querySelector(".aiDetailsToggle") as HTMLElement;
    expect([...container.children].findLast((node) => node.classList.contains("aiMainHeading"))).toHaveTextContent("Empfehlung");
    expect(toggle.nextElementSibling).toHaveClass("aiDetails");
  });

  it("renders exactly one methodology toggle and details container", () => {
    const api = createApi();
    const container = setupContainer();
    api.renderAiSummaryV2(container, validContent(), {}, "de");
    expect(container.querySelectorAll(".aiDetailsToggle")).toHaveLength(1);
    expect(container.querySelectorAll(".aiDetails")).toHaveLength(1);
  });

  it("keeps methodology sections in their details array order", () => {
    const api = createApi();
    const content = validContent();
    content.sections.splice(6, 0, { id: "comparison", icon: "V", title: "Vergleich", group: "methodology", blocks: [{ type: "paragraph", text: "Vergleichstext" }] });
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, {}, "de");
    expect([...container.querySelectorAll(".aiDetails .aiMainHeading")].map((node) => node.textContent)).toEqual([
      "B Methodik ohne erwartetes Emoji",
      "C Risiken",
      "V Vergleich",
    ]);
  });

  it("does not render an empty methodology toggle or details container without methodology sections", () => {
    const api = createApi();
    const content = validContent();
    content.sections = content.sections.filter((section) => section.group !== "methodology");
    expect(api.validateOfferContentV2(content).valid).toBe(true);
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, {}, "de");
    expect(container.querySelector(".aiDetailsToggle")).toBeNull();
    expect(container.querySelector(".aiDetails")).toBeNull();
  });

  it("keeps details toggling accessible and requests layout sync without fixed heights", () => {
    const api = createApi();
    const container = setupContainer();
    api.renderAiSummaryV2(container, validContent(), {}, "de");
    const toggle = container.querySelector("button.aiDetailsToggle") as HTMLButtonElement;
    const details = container.querySelector(".aiDetails") as HTMLElement;
    let syntheticHeight = 400;
    Object.defineProperty(document.getElementById("tbx2026"), "offsetHeight", { configurable: true, get: () => syntheticHeight });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle.getAttribute("aria-controls")).toBe(details.id);
    const closedHeight = (document.getElementById("tbx2026") as HTMLElement).offsetHeight;
    toggle.click();
    syntheticHeight = 640;
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Methode schließen");
    expect(details.hidden).toBe(false);
    expect((document.getElementById("tbx2026") as HTMLElement).offsetHeight).toBeGreaterThan(closedHeight);
    toggle.click();
    syntheticHeight = 400;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("Methode öffnen");
    expect(details.hidden).toBe(true);
    expect((document.getElementById("tbx2026") as HTMLElement).offsetHeight).toBe(closedHeight);
    expect(details.getAttribute("style") || "").not.toMatch(/(?:^|;)\s*(?:height|max-height|min-height)\s*:/);
  });

  it("keeps structured rendering RTL-safe without changing German or English defaults", () => {
    const api = createApi();
    const rtlContainer = setupContainer();
    const rtlRoot = document.getElementById("tbx2026") as HTMLElement;
    rtlRoot.classList.add("rtl");
    api.renderAiSummaryV2(rtlContainer, validContent(), { vorname: "Ada", tariff_name: "Klima", laufzeit_monate: "12" }, "ar");

    expect(rtlRoot).toHaveClass("rtl");
    expect(rtlContainer).toHaveClass("aiStructured");
    expect(rtlContainer.querySelector("ul.aiList")).not.toBeNull();
    expect(rtlContainer.querySelector("ol.aiList")).not.toBeNull();
    expect(rtlContainer.querySelector(".aiDetailsToggle")).not.toBeNull();
    expect(loader).toContain("#tbx2026.rtl .aiTxt.aiStructured{direction:rtl!important;text-align:right!important;}");
    expect(loader).toContain("#tbx2026.rtl .aiTxt.aiStructured .aiList{margin-left:0!important;margin-right:20px!important;}");
    expect(loader).toContain("#tbx2026.rtl .aiTxt.aiStructured .aiListItem{padding-left:0!important;padding-right:3px!important;}");
    expect(loader).toContain("#tbx2026.rtl .aiTxt.aiStructured .aiDetailsToggle{direction:rtl!important;text-align:right!important;}");

    const germanContainer = setupContainer();
    api.renderAiSummaryV2(germanContainer, validContent(), {}, "de");
    expect(document.getElementById("tbx2026")).not.toHaveClass("rtl");
    expect(germanContainer).toHaveClass("aiStructured");
    const englishContainer = setupContainer();
    api.renderAiSummaryV2(englishContainer, validContent(), {}, "en");
    expect(document.getElementById("tbx2026")).not.toHaveClass("rtl");
    expect(englishContainer).toHaveClass("aiStructured");
    expect(loader).toContain("#tbx2026 .aiTxt.aiStructured{max-width:88ch!important");
    expect(loader).toContain("text-align:left!important;");
  });

  it.each([
    ["unknown section", (value: ReturnType<typeof validContent>) => (value.sections[0].id = "unknown")],
    ["unknown group", (value: ReturnType<typeof validContent>) => (value.sections[0].group = "other")],
    ["unknown block", (value: ReturnType<typeof validContent>) => (value.sections[0].blocks[0].type = "html")],
    ["empty blocks", (value: ReturnType<typeof validContent>) => (value.sections[0].blocks = [])],
    ["invalid list", (value: ReturnType<typeof validContent>) => (value.sections[0].blocks[3].items = [{ title: "Missing text" }])],
    ["split methodology", (value: ReturnType<typeof validContent>) => value.sections.push({ id: "timing", icon: "E", title: "Late methodology", group: "methodology", blocks: [{ type: "paragraph", text: "Late" }] })],
    ["unknown variable", (value: ReturnType<typeof validContent>) => (value.sections[0].blocks[0].text = "{{not_allowed}}")],
  ])("rejects %s so callers can use the complete legacy fallback", (_name, mutate) => {
    const content = validContent();
    mutate(content);
    expect(createApi().validateOfferContentV2(content).valid).toBe(false);
  });

  it("warns and replaces invalid V2 wholesale with the legacy renderer", () => {
    const api = createApi();
    const content = validContent();
    content.sections[0].id = "unknown";
    const container = setupContainer();
    container.textContent = "partial V2 must disappear";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(api.renderOfferSummary(container, content, "Plain legacy fallback", {}, "en", "spart")).toBe("legacy");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Legacy-Fallback"));
    expect(container).toHaveTextContent("Plain legacy fallback");
    expect(container).not.toHaveTextContent("partial V2 must disappear");
    expect(container.querySelector(".aiFirstHeading")).toBeNull();
    warn.mockRestore();
  });

  it("renders markup and scripts only as inert text", () => {
    const api = createApi();
    const content = validContent();
    content.sections[0].blocks[0].text = '<script>window.__injected=true</script><img src=x onerror="window.__injected=true">';
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, {}, "de");
    expect(container.querySelector("script,img")).toBeNull();
    expect(container).toHaveTextContent("<script>window.__injected=true</script>");
    expect((window as Window & { __injected?: boolean }).__injected).toBeUndefined();
  });

  it("accepts both supported placeholder forms and ignores invalid optional German toggle labels", () => {
    const api = createApi();
    const content = validContent();
    content.methodology_toggle = { collapsed_label: "", expanded_label: "" };
    expect(api.validateOfferContentV2(content).valid).toBe(true);
    const container = setupContainer();
    api.renderAiSummaryV2(container, content, { vorname: "Ada", tariff_name: "Klima", laufzeit_monate: "12" }, "de");
    expect(container).toHaveTextContent("Ada");
    expect(container).toHaveTextContent("Klima");
    expect(container.querySelector("button")).toHaveTextContent("So wurde dein Tarif geprüft");
  });

  it.each(["{vorname}", "{{vorname}}", "{tariff_name}", "{{tariff_name}}"])("accepts the exact placeholder syntax %s", (placeholder) => {
    const content = validContent();
    content.sections[0].blocks[0].text = `Hallo ${placeholder}`;
    expect(createApi().validateOfferContentV2(content).valid).toBe(true);
  });

  it.each(["{{vorname}", "{vorname}}", "{{tariff-name}}", "{{tariff.name}}", "{{vor name}}", "{{not_allowed}}", "{not_allowed}"])(
    "rejects malformed or unknown placeholder %s and renders only the complete legacy fallback",
    (placeholder) => {
      const api = createApi();
      const content = validContent();
      content.sections[0].blocks[0].text = `V2 marker ${placeholder}`;
      expect(api.validateOfferContentV2(content).valid).toBe(false);

      const container = setupContainer();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      expect(api.renderOfferSummary(container, content, "Complete legacy fallback", {}, "en", "spart")).toBe("legacy");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Legacy-Fallback"));
      expect(container.textContent).toBe("Complete legacy fallback");
      expect(container).not.toHaveTextContent("V2 marker");
      expect(container).not.toHaveTextContent(placeholder);
      expect(container.querySelector(".aiFirstHeading")).toBeNull();
      warn.mockRestore();
    },
  );
});
