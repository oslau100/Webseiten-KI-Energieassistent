import { readFileSync } from "node:fs";
import { createHash, webcrypto } from "node:crypto";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { describe, it, expect, vi } from "vitest";
import { makeEwvOrder, ewvTariffs, orderUuid as uuid, ewvProviderId as providerId } from "./fixtures/oecherEwvOrders";

const engine = readFileSync("public/engines/oecher-v1-closing-survey-engine.js", "utf8");
const helper = readFileSync("public/engines/oecher-ewv-provider.js", "utf8");
const owner = "uuDEvEGcyd3mMiKWKH4Z";
const legalName = "EWV Energie- und Wasser-Versorgung GmbH";
const names = [legalName, legalName + " Stolberg"];
const tariffs = ewvTariffs.map(([id, , name]) => [id, name] as const);
const snapshot = makeEwvOrder;

function harness(row: any = snapshot(), options: { status?: number; pdf?: Uint8Array; template?: string; lang?: string; location?: string; signatureTemplate?: string; cryptoUnavailable?: boolean } = {}) {
  const dom = new JSDOM('<div id="survey-app"></div>', { url: "https://local.test/auftrag" });
  let captured: any;
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "POST") { captured = JSON.parse(String(init.body)); return { ok: true, text: async () => '{"ok":true}' }; }
    const id = Number(url.match(/(\d+)\.pdf$/)?.[1]);
    const bytes = options.pdf || new Uint8Array(readFileSync(`public/legal/ewv/${id}.pdf`));
    return { ok: (options.status ?? 200) === 200, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  });
  const client = { from: () => ({ update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }) }) };
  const w = dom.window as any;
  w.KUNDEN_DATA = { firma: "Öcher Strom", url_config: { mediator_datenschutz_url: "https://local.test/datenschutz" } };
  w.SURVEY_CONFIG = { closingProxyPath: "https://local.test/closing" };
  if (options.template) w.CLOSING_TEXT_TEMPLATES = { legal_checkbox_label_i18n: { de: options.template } };
  if (options.signatureTemplate) w.CLOSING_TEXT_TEMPLATES = { signature_hint_i18n: { de: options.signatureTemplate } };
  // Execute the actual engine, bypassing only automatic init / live I/O.
  const instrumented = engine.replace('  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);\n  else init();',
    '  globalThis.testApi = { state, enforceOecherEwvLegalLinks, renderSummary, renderSignaturePad, submitClosing, render, buildTemplateVars, getOrderProviderName };');
  const context: any = { window: w, document: w.document, console: { error: vi.fn(), warn: vi.fn(), log: vi.fn() }, fetch,
    crypto: options.cryptoUnavailable ? {} : webcrypto, URL, Uint8Array, setTimeout: () => 0, clearTimeout, navigator: w.navigator, supabase: { createClient: () => client } };
  vm.runInNewContext(instrumented, context);
  const api = context.testApi;
  Object.assign(api.state, { orderRow: row, locationId: options.location || owner, uuid, language: options.lang || "de", sessionId: "synthetic", answers: { signature: "data:image/png;base64,synthetic", summary_consents: { legal: true, privacy: true } } });
  api.state.providerLinks = { agb_url: "#", widerruf_url: "#", datenschutz_url: "#" };
  return { api, dom, fetch, captured: () => captured };
}

describe("Öcher EWV documents and consent", () => {
  it.each(tariffs)("verifies snapshot %s with historical and new legal names, rendering and payload", async (id) => {
    for (const provider of names) {
      const row = snapshot(id, provider); const original = JSON.stringify(row);
      const h = harness(row); await h.api.enforceOecherEwvLegalLinks();
      const pdf = `https://local.test/legal/ewv/${id}.pdf`;
      expect(h.api.state.providerLinks).toEqual({ agb_url: pdf, widerruf_url: pdf, datenschutz_url: "https://www.ewv.de/datenschutzhinweise" });
      for (const lang of ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"]) {
        h.api.state.language = lang;
        h.dom.window.document.body.innerHTML = h.api.renderSummary();
        const links = [...h.dom.window.document.querySelectorAll<HTMLAnchorElement>(".consent-text a")];
        expect(links.map(a => a.href)).toEqual([pdf, pdf, "https://www.ewv.de/datenschutzhinweise", "https://local.test/datenschutz"]);
        expect(links.every(a => a.target === "_blank" && a.rel.includes("noopener"))).toBe(true);
        expect(h.dom.window.document.body.textContent).toContain(legalName);
        expect(h.dom.window.document.body.textContent).not.toContain(legalName + " Stolberg");
        expect(h.api.renderSignaturePad()).toContain(legalName);
      }
      await h.api.submitClosing();
      const payload = h.captured(); expect(payload).toBeDefined();
      expect(payload.provider_links).toEqual(h.api.state.providerLinks);
      expect(payload.order_snapshot.provider_links).toEqual(payload.provider_links);
      expect(payload.order_snapshot.tarif_snapshot.provider_links).toEqual(payload.provider_links);
      expect(payload.order_snapshot.provider_legal_name).toBe(legalName);
      expect(payload.order_snapshot.tarif_snapshot.legal_document.pdf_sha256).toBe(createHash("sha256").update(readFileSync(`public/legal/ewv/${id}.pdf`)).digest("hex"));
      expect(JSON.stringify(row)).toBe(original); // Historical source order is preserved.
      h.dom.window.close();
    }
  });
  it.each([
    ["missing provider", (r: any) => { r.tariff_provider = ""; r.tarif_snapshot.selected_preisliste.anbieter = ""; }],
    ["foreign provider", (r: any) => { r.tariff_provider = "EWV Baesweiler"; }],
    ["enerSwitch", (r: any) => { r.tariff_provider = "enerSwitch EWV"; }],
    ["conflicting provider ID", (r: any) => { r.anbieter_id = "foreign"; }],
    ["wrong EGON", (r: any) => { r.tarif_snapshot.selected_preisliste.tarif_id = 52075; }],
    ["conflicting EGON", (r: any) => { r.tarif_id = 52074; }],
    ["conflicting UUID", (r: any) => { r.tarif_snapshot.tarif_uuid = "foreign"; }],
    ["wrong tenant", (r: any) => { r.location_id = "other"; }],
    ["wrong product", (r: any) => { r.tariff_name = "regiogas Heimatheld"; }],
    ["misleading product suffix", (r: any) => { r.tariff_name += " Fremdprodukt"; }],
    ["missing product", (r: any) => { delete r.tariff_name; }],
    ["identical foreign UUIDs", (r: any) => { r.tarif_uuid = r.tarif_snapshot.tarif_uuid = r.tarif_snapshot.selected_preisliste.tarif_uuid = uuid; }],
    ["52071 paired with 52072 UUID", (r: any) => { r.tarif_snapshot.selected_preisliste.tarif_uuid = ewvTariffs[1][1]; }],
    ["52072 paired with 52071 UUID", (r: any) => { Object.assign(r, snapshot(52072)); r.tarif_snapshot.selected_preisliste.tarif_uuid = ewvTariffs[0][1]; }],
    ["provider ID cannot authorize foreign UUID", (r: any) => { r.anbieter_id = providerId; r.tarif_snapshot.selected_preisliste.tarif_uuid = uuid; }],
    ["no tariff UUID", (r: any) => { delete r.tarif_snapshot.selected_preisliste.tarif_uuid; }],
    ["provider ID without any tariff UUID", (r: any) => { r.anbieter_id = providerId; delete r.tarif_snapshot.selected_preisliste.tarif_uuid; }],
    ["short display name is not a stored legal identity", (r: any) => { r.anbieter_id = providerId; r.tariff_provider = "EWV"; }],
    ["no EGON", (r: any) => { delete r.tarif_snapshot.selected_preisliste.tarif_id; }],
    ["foreign nested provider ID", (r: any) => { r.tarif_snapshot.anbieter = { id: "foreign", name: names[1] }; }],
    ["foreign nested provider name", (r: any) => { r.tarif_snapshot.anbieter = { id: providerId, name: "enerSwitch EWV" }; }],
  ] as const)("fails closed before consent/signature/submission: %s", async (_label, mutate) => {
    const row = snapshot(); mutate(row); const h = harness(row);
    await expect(h.api.enforceOecherEwvLegalLinks()).rejects.toMatchObject({ code: "ewv_contract_docs_unavailable" });
    h.api.state.currentStep = "summary"; await h.api.render();
    expect(h.dom.window.document.querySelector('input[type="checkbox"]')).toBeNull();
    h.api.state.currentStep = "signature"; await h.api.render();
    expect(h.dom.window.document.querySelector("canvas")).toBeNull();
    await h.api.submitClosing(); expect(h.captured()).toBeUndefined(); h.dom.window.close();
  });
  it.each([{ status: 404 }, { pdf: new Uint8Array([60, 104, 116, 109, 108]) }, { pdf: new Uint8Array(readFileSync("public/legal/ewv/52072.pdf")) }])("rejects missing, non-PDF or wrong tariff bytes", async options => {
    const h = harness(snapshot(), options);
    await expect(h.api.enforceOecherEwvLegalLinks()).rejects.toMatchObject({ code: "ewv_contract_docs_unavailable" });
    await h.api.submitClosing(); expect(h.captured()).toBeUndefined(); h.dom.window.close();
  });
  it("rejects configured # links even when PDF verification passed", async () => {
    const h = harness(snapshot(), { template: 'Ich akzeptiere <a href="#">AGB</a> und <a href="#">Widerruf</a> von {{anbieter}}.' });
    await h.api.enforceOecherEwvLegalLinks(); expect(() => h.api.renderSummary()).toThrow(/Einwilligung/);
    await h.api.submitClosing(); expect(h.captured()).toBeUndefined(); h.dom.window.close();
  });
  it("rejects historical legal names hardcoded into configured consent or signature text", async () => {
    const h = harness(snapshot(), { template: `Ich akzeptiere <a href="{{agb_url}}">AGB</a> und <a href="{{widerruf_url}}">Widerruf</a> von ${names[1]}.` });
    await h.api.enforceOecherEwvLegalLinks(); expect(() => h.api.renderSummary()).toThrow(/Einwilligung/);
    await h.api.submitClosing(); expect(h.captured()).toBeUndefined(); h.dom.window.close();
    const signature = harness(snapshot(), { signatureTemplate: `Die Unterschrift geht an ${names[1]}.` });
    await signature.api.enforceOecherEwvLegalLinks(); expect(() => signature.api.renderSignaturePad()).toThrow(/Rechtsnamen/);
    signature.api.state.currentStep = "signature"; await signature.api.render();
    expect(signature.dom.window.document.querySelector("canvas")).toBeNull();
    await signature.api.submitClosing(); expect(signature.captured()).toBeUndefined(); signature.dom.window.close();
  });
  it("blocks when secure hash verification is unavailable", async () => {
    const h = harness(snapshot(), { cryptoUnavailable: true });
    await expect(h.api.enforceOecherEwvLegalLinks()).rejects.toMatchObject({ code: "ewv_contract_docs_unavailable" }); h.dom.window.close();
  });
  it.each(tariffs)("also verifies optional provider IDs and additional canonical UUIDs for %s", async id => {
    const row: any = snapshot(id); const canonical = row.tarif_snapshot.selected_preisliste.tarif_uuid;
    row.anbieter_id = providerId; row.tarif_uuid = canonical; row.tarif_snapshot.tarif_uuid = canonical;
    const h = harness(row); await h.api.enforceOecherEwvLegalLinks();
    expect(h.api.getOrderProviderName()).toBe(legalName); h.dom.window.close();
  });
  it("accepts exact historical snapshots without provider IDs", async () => {
    const row: any = snapshot(); delete row.anbieter_id; delete row.tarif_snapshot.selected_preisliste.anbieter_id;
    const h = harness(row); await h.api.enforceOecherEwvLegalLinks(); expect(h.api.getOrderProviderName()).toBe(legalName); h.dom.window.close();
  });
  it("leaves other providers and Ehiogie consent untouched", async () => {
    const row: any = snapshot(18001, "E.ON Energie Deutschland GmbH"); delete row.anbieter_id; delete row.tarif_snapshot.selected_preisliste.anbieter_id;
    const h = harness(row, { location: "ehiogie" }); await h.api.enforceOecherEwvLegalLinks();
    expect(h.api.state.providerLinks.agb_url).toBe("#"); expect(h.fetch).not.toHaveBeenCalled(); h.dom.window.close();
  });
});

describe("provider display identity", () => {
  function display() { const window: any = {}; vm.runInNewContext(helper, { window }); return window.OecherEwvProvider; }
  it("uses exactly EWV for canonical identities, without mutating snapshot display_name", () => {
    const p = display(); const row: any = snapshot(); expect(p.displayName(row, owner)).toBe("EWV");
    row.tarif_snapshot.anbieter = { id: providerId, name: names[1], display_name: "EWV" };
    expect(p.displayName(row, owner)).toBe("EWV");
    row.tarif_snapshot.anbieter.display_name = "Regionalmarke"; expect(p.displayName(row, owner)).toBe("EWV");
    expect(row.tarif_snapshot.anbieter.display_name).toBe("Regionalmarke");
    const legacy: any = snapshot(); delete legacy.anbieter_id; delete legacy.tarif_snapshot.selected_preisliste.anbieter_id;
    expect(p.isEwv(legacy, owner)).toBe(true); expect(p.displayName(legacy, owner)).toBe("EWV");
    legacy.tarif_snapshot.tarif_uuid = "foreign"; expect(p.isEwv(legacy, owner)).toBe(false);
    delete legacy.tarif_snapshot.tarif_uuid;
    expect(p.isEwv(legacy, owner)).toBe(true); expect(p.displayName(legacy, owner)).toBe("EWV");
  });
  it("preserves unknown brands, other tenants, current provider and source row", () => {
    const p = display(); const row: any = snapshot(); row.anbieter_id = "another-provider"; row.tariff_provider = "enerSwitch EWV";
    const before = JSON.stringify(row); expect(p.isEwv(row, owner)).toBe(false); expect(p.displayName(row, owner)).toBe("enerSwitch EWV");
    expect(p.isEwv(snapshot(), "ehiogie")).toBe(false); expect(JSON.stringify(row)).toBe(before);
  });
});
