import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, it, expect, vi } from "vitest";
import { makeEwvOrder, ewvTariffs, orderUuid as uuid, ewvProviderId as providerId } from "./fixtures/oecherEwvOrders";
const html = readFileSync("public/loaders/tarif.html", "utf8");
const helper = readFileSync("public/engines/oecher-ewv-provider.js", "utf8");
const owner = "uuDEvEGcyd3mMiKWKH4Z";
const legal = "EWV Energie- und Wasser-Versorgung GmbH";

async function load({id = 52072, provider = legal + " Stolberg", mutate = (_row: any) => {}} = {}) {
  const row = { ...makeEwvOrder(id, provider), provider_current: "Anderer Anbieter",
    ai_content: { de: { fazit: `Empfehlung von ${provider}`, ki_zusammenfassung: `Deine Empfehlung: {{tariff_provider}}\n\nAusgewählter Anbieter: ${provider}` } },
    jahreskosten: 1000, monatsabschlag: 90, ersparnis: 200, energy_type: id < 52073 ? "strom" : "gas", verbrauch: 3500, plz: "52070" };
  mutate(row);
  const before = JSON.stringify(row);
  const dom = new JSDOM(html, { url: `https://local.test/loaders/tarif.html?uuid=${uuid}`, runScripts: "outside-only" });
  const w = dom.window as any;
  const filters: Array<[string, unknown]> = []; const tables: string[] = [];
  w.requestAnimationFrame = (fn: FrameRequestCallback) => w.setTimeout(() => fn(0), 0);
  w.cancelAnimationFrame = w.clearTimeout;
  w.supabase = { createClient: () => ({ from: (table: string) => {
    tables.push(table);
    const chain: any = { select: () => chain, eq: (field: string, value: unknown) => { filters.push([field, value]); return chain; },
      single: async () => ({ data: { design_config: {} }, error: null }), limit: async () => ({ data: [row], error: null }) };
    return chain;
  } }) };
  w.eval(helper);
  w.eval(readFileSync("public/engines/oecher-offer-preview.js", "utf8"));
  for (const script of [...dom.window.document.querySelectorAll<HTMLScriptElement>("script:not([src])")]) await w.eval(script.textContent!);
  return { dom, w, row, before, filters, tables };
}

describe("local Öcher tariff display integration", () => {
  it.each(ewvTariffs)("renders selected-only %s in card, advice, conclusion and details for both legal names", async id => {
    for (const provider of [legal, legal + " Stolberg"]) {
    const h = await load({ id, provider });
    expect(h.w.document.getElementById("tbRecProvider").textContent).toBe("EWV");
    for (const target of ["tbAiText", "tbFazit"]) { expect(h.w.document.getElementById(target).textContent).toContain("EWV"); expect(h.w.document.getElementById(target).textContent).not.toContain("Wasser-Versorgung"); }
    h.w.document.getElementById("tbBtnDetails").click();
    expect(h.w.document.getElementById("tbModalBody").textContent).not.toContain("Wasser-Versorgung");
    expect(h.w.document.getElementById("tbModalBody").textContent).toContain("EWV");
    expect(h.filters).toContainEqual(["location_id", owner]); expect(h.filters).toContainEqual(["uuid", uuid]);
    expect(h.tables).toEqual(["kunden_config", "auftraege"]); expect(JSON.stringify(h.row)).toBe(h.before);
    expect(h.w.document.getElementById("tbCurProvider").textContent).toBe("Anderer Anbieter"); h.dom.window.close();
    }
  });
  it.each(["EWV Baesweiler", "enerSwitch EWV", "Unbekannte Marke"])("preserves %s when the provider identity differs", async provider => {
    const h = await load({ provider, mutate: row => { row.anbieter_id = "foreign-provider"; } });
    expect(h.w.document.getElementById("tbRecProvider").textContent).toBe(provider);
    expect(h.w.document.getElementById("tbAiText").textContent).toContain(provider); h.dom.window.close();
  });
  it.each([
    ["wrong tenant", (r: any) => { r.location_id = "tn90CyE3XuYFTy4c1M3F"; }],
    ["foreign provider ID", (r: any) => { r.anbieter_id = "foreign"; }],
    ["unknown EGON", (r: any) => { r.tarif_snapshot.selected_preisliste.tarif_id = 52075; }],
    ["missing EGON", (r: any) => { delete r.tarif_snapshot.selected_preisliste.tarif_id; }],
    ["missing UUID", (r: any) => { delete r.tarif_snapshot.selected_preisliste.tarif_uuid; }],
    ["identical foreign UUIDs", (r: any) => { r.tarif_uuid = r.tarif_snapshot.tarif_uuid = r.tarif_snapshot.selected_preisliste.tarif_uuid = uuid; }],
    ["52072 with 52071 UUID", (r: any) => { r.tarif_snapshot.selected_preisliste.tarif_uuid = ewvTariffs[0][1]; }],
    ["52071 with 52072 UUID", (r: any) => { Object.assign(r, makeEwvOrder(52071)); r.tarif_snapshot.selected_preisliste.tarif_uuid = ewvTariffs[1][1]; }],
    ["conflicting EGON", (r: any) => { r.tarif_id = 52071; }],
    ["conflicting UUID", (r: any) => { r.tarif_snapshot.tarif_uuid = ewvTariffs[0][1]; }],
    ["provider ID with foreign tariff UUID", (r: any) => { r.anbieter_id = providerId; r.tarif_snapshot.selected_preisliste.tarif_uuid = uuid; }],
    ["display_name cannot bypass canonical identity", (r: any) => { r.tarif_snapshot.anbieter = { id: providerId, name: legal, display_name: "EWV" }; r.tarif_snapshot.selected_preisliste.tarif_uuid = uuid; }],
    ["foreign nested provider name", (r: any) => { r.tarif_snapshot.anbieter = { id: providerId, name: "EWV Baesweiler" }; }],
    ["conflicting nested provider ID", (r: any) => { r.tarif_snapshot.anbieter = { id: "foreign", name: legal }; }],
    ["wrong product", (r: any) => { r.tariff_name = "regiogas Heimatheld"; }],
    ["missing product", (r: any) => { delete r.tariff_name; }],
  ] as const)("does not rebrand a negative identity in any offer area: %s", async (_label, mutate) => {
    const h = await load({ mutate });
    const originalDisplay = (h.row.tarif_snapshot as any).anbieter?.name || h.row.tariff_provider;
    expect(h.w.document.getElementById("tbRecProvider").textContent).toBe(originalDisplay);
    for (const target of ["tbAiText", "tbFazit"]) expect(h.w.document.getElementById(target).textContent).toContain(h.row.tariff_provider);
    h.w.document.getElementById("tbBtnDetails").click();
    expect(h.w.document.getElementById("tbModalBody").textContent).toContain(originalDisplay);
    expect(JSON.stringify(h.row)).toBe(h.before); h.dom.window.close();
  });
  it.each(ewvTariffs)("still verifies every identity with optional provider IDs for %s", async id => {
    const h = await load({ id, mutate: r => { r.anbieter_id = providerId; r.tarif_uuid = r.tarif_snapshot.selected_preisliste.tarif_uuid; } });
    expect(h.w.document.getElementById("tbRecProvider").textContent).toBe("EWV");
    expect(JSON.stringify(h.row)).toBe(h.before); h.dom.window.close();
  });
});
