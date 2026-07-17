import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const loader = readFileSync(new URL("../../public/loaders/tarif.html", import.meta.url), "utf8");
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
      ],
    },
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
    expect([...container.querySelectorAll(":scope > .aiMainHeading")].map((node) => node.textContent)).toEqual(["🌐 Strukturierte Prüfung für Ada", "A Erkenntnis", "D Empfehlung nach Methodik"]);
    expect(container.querySelector(".aiParagraph:not(.aiAnswerLead)")).toHaveTextContent("Normal für Klima");
    expect(container.querySelector(".aiSubheading")).toHaveTextContent("Einordnung");
    expect(container.querySelector(".aiAnswerLead")).toHaveTextContent("Klare Antwort");
    expect(container.querySelector("ul.aiList")).toHaveTextContent("Punkt 12");
    expect(container.querySelector("ol.aiList .aiListTitle")).toHaveTextContent("Preis");
    expect(container.querySelector("ol.aiList .aiListText")).toHaveTextContent("Geprüfte Kosten");
    expect(container.querySelector(".aiHeadingAfterAnswer")).toHaveTextContent("Empfehlung nach Methodik");
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
    expect(container.lastElementChild).toHaveTextContent("Abschluss");
    toggle.click();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(details.hidden).toBe(false);
    expect(toggle).toHaveTextContent("Methode schließen");
    toggle.click();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(details.hidden).toBe(true);
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
});
