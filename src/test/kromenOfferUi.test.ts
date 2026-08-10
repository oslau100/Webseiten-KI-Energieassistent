import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const i18nSource = loader.slice(loader.indexOf("  const I18N = "), loader.indexOf("  function strip"));
const { I18N, getLang, getUi } = Function(`${i18nSource}; return {I18N,getLang,getUi};`)() as {
  I18N: Record<string, { direction: string; messages: Record<string, string> }>;
  getLang: (language: string) => string;
  getUi: (language: string) => Record<string, string>;
};

const languages = ["de", "en", "es", "pl", "tr", "ar", "zh", "fr", "it", "ru", "hi", "nl"];
const keys = ["title","statusLine","year","month","cur","rec","change","cta","details","saveK","saveH","yes","no","oeko","fast","aiSummary","energyElectricity","energyGas","perMonthText","modalTitle","hint","m_tariff","m_provider","m_energy","m_case","m_plz","m_city","m_usage","m_priceWork","m_priceBase","m_term","m_guarantee","m_year","m_month","m_paymentsYear","m_green","m_savings","monthsSingular","monthsPlural","until","perMonth","perYear","closeLabel"];

describe("Kromen Offer UI localisation", () => {
  it("contains exactly the approved 12 languages and 43 keys", () => {
    expect(Object.keys(I18N)).toEqual(languages);
    for (const language of languages) expect(Object.keys(I18N[language].messages)).toEqual(keys);
  });

  it("matches the immutable approved source", () => {
    expect(I18N).toMatchSnapshot();
  });

  it("keeps final English wording and direction metadata", () => {
    expect(I18N.en.messages).toMatchObject({ statusLine: "AI analysis complete", year: "Total annual cost", cta: "Switch tariff", m_paymentsYear: "Payments per year", closeLabel: "Close" });
    expect(I18N.ar.direction).toBe("rtl");
    for (const language of languages.filter((value) => value !== "ar")) expect(I18N[language].direction).toBe("ltr");
  });

  it("resolves every supported language without German fallback and safely falls back for unknown codes", () => {
    for (const language of languages) {
      expect(getLang(`${language}-XX`)).toBe(language);
      expect(getUi(language)).toBe(I18N[language].messages);
    }
    expect(getLang("unknown")).toBe("de");
    expect(getUi("unknown")).toBe(I18N.de.messages);
  });
});

const modalSource = loader.slice(loader.indexOf("  let modalTrigger="), loader.indexOf("  function safeJson"));
type ModalApi = { getVisibleIframeViewport: () => { top: number; height: number }; updateModalViewport: () => void; openModal: (trigger: HTMLElement) => void; closeModal: () => void };

function createModalApi(parentWindow: Window = window): ModalApi {
  document.body.innerHTML = `<main id="tbx2026"><button id="trigger">Tarifdetails</button><div id="tbModalBack" aria-hidden="true"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="tbModalTitle"><h2 id="tbModalTitle">Tariff overview</h2><button id="tbModalClose" aria-label="Close">×</button><div class="modalBody"></div></div></div></main>`;
  return Function("window", "document", `const $=id=>document.getElementById(id); ${modalSource}; return {getVisibleIframeViewport,updateModalViewport,openModal,closeModal};`)(parentWindow, document) as ModalApi;
}

describe("Kromen Offer tariff modal", () => {
  it("uses the visible parent viewport inside a tall, already-scrolled iframe", () => {
    const parent = { innerHeight: 844, document: { documentElement: { clientHeight: 844 } }, addEventListener: vi.fn(), removeEventListener: vi.fn(), visualViewport: { offsetTop: 40, height: 700, addEventListener: vi.fn(), removeEventListener: vi.fn() } };
    const child = Object.create(window) as Window & { parent: unknown; frameElement: unknown };
    Object.defineProperty(child, "parent", { value: parent });
    Object.defineProperty(child, "frameElement", { value: { getBoundingClientRect: () => ({ top: -1200, height: 4000 }) } });
    const api = createModalApi(child);
    expect(api.getVisibleIframeViewport()).toMatchObject({ top: 1240, height: 700 });
    api.openModal(document.getElementById("trigger")!);
    const backdrop = document.getElementById("tbModalBack")!;
    expect(backdrop.style.getPropertyValue("--tb-modal-visible-top")).toBe("1240px");
    expect(backdrop.style.getPropertyValue("--tb-modal-visible-height")).toBe("700px");
    expect(document.activeElement).toBe(document.getElementById("tbModalClose"));
    api.closeModal();
    expect(document.activeElement).toBe(document.getElementById("trigger"));
  });

  it("falls back to the local viewport for desktop/top-level use", () => {
    const api = createModalApi(window);
    const geometry = api.getVisibleIframeViewport();
    expect(geometry.top).toBe(0);
    expect(geometry.height).toBeGreaterThan(0);
  });

  it("keeps dialog semantics, internal scrolling, localised naming, Escape and backdrop close wiring", () => {
    expect(loader).toContain('role="dialog" aria-modal="true" aria-labelledby="tbModalTitle"');
    expect(loader).toContain('$("tbModalClose").setAttribute("aria-label",String(t.closeLabel || "Close"))');
    expect(loader).toContain('#tbx2026 .modalBody{padding:18px 20px 20px!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important;}');
    expect(loader).toContain('if(e.key==="Escape") closeModal()');
    expect(loader).toContain('if(e.target === $("tbModalBack")) closeModal()');
    expect(loader).toContain('visible.viewport?.addEventListener("resize",update)');
    expect(loader).toContain('visible.host.addEventListener("orientationchange",update)');
  });
});
