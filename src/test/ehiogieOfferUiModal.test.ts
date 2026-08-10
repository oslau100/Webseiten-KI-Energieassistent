import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const sourceText = loader.match(/const FINAL_UI_SOURCE = (\{.*?\});\n  const I18N/s)?.[1];
if (!sourceText) throw new Error("FINAL_UI_SOURCE missing");
const source = JSON.parse(sourceText) as Record<string, { direction: string; messages: Record<string, string> }>;
const languages = ["de", "en", "es", "pl", "tr", "ar", "zh", "fr", "it", "ru", "hi", "nl"];

function extractFunction(name: string) {
  const start = loader.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} missing`);
  const bodyStart = loader.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < loader.length; index += 1) {
    if (loader[index] === "{") depth += 1;
    if (loader[index] === "}" && --depth === 0) return loader.slice(start, index + 1);
  }
  throw new Error(`${name} is incomplete`);
}

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
  it("converts a scrolled parent viewport into tall iframe coordinates", () => {
    const properties = new Map<string, string>();
    const back = { style: { setProperty: (name: string, value: string) => properties.set(name, value) } };
    const parent = { visualViewport: { offsetTop: 1200, height: 500 }, innerHeight: 700 };
    const windowMock: Record<string, unknown> = { parent, frameElement: { getBoundingClientRect: () => ({ top: 400, height: 2400 }) } };
    const run = new Function("window", "$", `${extractFunction("visibleIframeViewport")}\n${extractFunction("positionModal")}\nreturn { area: visibleIframeViewport(), positionModal };`);
    const result = run(windowMock, () => back) as { area: { top: number; height: number }; positionModal: () => void };

    expect(result.area).toEqual({ top: 800, height: 500 });
    result.positionModal();
    expect(Object.fromEntries(properties)).toEqual({ "--tb-modal-top": "800px", "--tb-modal-height": "500px" });
  });

  it("uses preventScroll while transferring and restoring focus", () => {
    const calls: unknown[] = [];
    const trigger = { focus: (options: unknown) => calls.push(["trigger", options]) };
    const close = { focus: (options: unknown) => calls.push(["close", options]) };
    const classes = new Set<string>();
    const back = { classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name), contains: (name: string) => classes.has(name) }, setAttribute: () => undefined };
    const run = new Function("document", "$", "positionModal", `let modalReturnFocus=null; ${extractFunction("openModal")} ${extractFunction("closeModal")} openModal(); closeModal();`);
    run({ activeElement: trigger }, (id: string) => id === "tbModalBack" ? back : close, () => undefined);
    expect(calls).toEqual([["close", { preventScroll: true }], ["trigger", { preventScroll: true }]]);
  });

  it("keeps the labelled header as the only visible modal title", () => {
    const title = source.en.messages.modalTitle;
    expect(loader).toContain('aria-labelledby="tbModalTitle"');
    expect(extractFunction("renderModal")).not.toContain("summary-title");
    expect(loader.match(/id="tbModalTitle"/g)).toHaveLength(1);
    expect(extractFunction("renderModal").match(/t\.modalTitle/g)).toHaveLength(1);
    expect(title).toBe("Tariff overview");
  });
});
