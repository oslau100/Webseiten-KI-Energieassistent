import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { makeEwvOrder, oecherLocation } from "./fixtures/oecherEwvOrders";

const html = readFileSync("public/loaders/tarif.html", "utf8");
const preview = readFileSync("public/engines/oecher-offer-preview.js", "utf8");
const provider = readFileSync("public/engines/oecher-ewv-provider.js", "utf8");
const recommendation = () => ({ ...makeEwvOrder(), status: "Tarif wurde berechnet", ersparnis: 477,
  jahreskosten: 1000, monatsabschlag: 90, spart: true, phone: "+49000000000", vorname: "Synthetisch",
  ai_content: { de: { fazit: "Bestehende geprüfte Empfehlung", ki_zusammenfassung: "Unveränderte Tarifberatung" } } });

async function load(row: any = recommendation(), { lang = "de", reduced = false, storage = {} as Record<string, string>, storageBlocked = false } = {}) {
  const dom = new JSDOM(html, { url: `https://local.test/loaders/tarif.html?uuid=${row.uuid}&lang=${lang}`, runScripts: "outside-only" });
  const w = dom.window as any;
  const source = JSON.stringify(row);
  const tables: string[] = [];
  const requests = vi.fn();
  w.fetch = requests;
  w.requestAnimationFrame = (fn: FrameRequestCallback) => w.setTimeout(() => fn(0), 0);
  w.cancelAnimationFrame = w.clearTimeout;
  w.matchMedia = () => ({ matches: reduced });
  w.parent.postMessage = vi.fn();
  for (const [key, value] of Object.entries(storage)) w.sessionStorage.setItem(key, value);
  if (storageBlocked) Object.defineProperty(w, "sessionStorage", { get: () => { throw new Error("Storage disabled"); } });
  w.supabase = { createClient: () => ({ from: (table: string) => {
    tables.push(table);
    const chain: any = { select: () => chain, eq: () => chain,
      single: async () => ({ data: { design_config: { brand: { primary_color: "#FFBD59" }, offer: { primary_button: { bg_color: "#FFBD59", text_color: "#0b1020" } } } } }),
      limit: async () => ({ data: [row] }) };
    return chain;
  } }) };
  w.eval(provider); w.eval(preview);
  for (const script of [...w.document.querySelectorAll("script:not([src])")] as HTMLScriptElement[]) await w.eval(script.textContent!);
  const stored = () => Object.fromEntries(Object.keys(w.sessionStorage).map(key => [key, w.sessionStorage.getItem(key)]));
  return { dom, w, tables, requests, source, row, stored, document: w.document as Document };
}

describe("in-flow preview of the original recommendation", () => {
  it("keeps the original offer hidden until the CTA, reveals it once and makes no extra requests or writes", async () => {
    const h = await load();
    expect(h.document.getElementById("tbPreOffer")).toBeVisible();
    expect(h.document.getElementById("tbOfferView")).not.toBeVisible();
    expect(h.document.getElementById("tbPreSavings")?.textContent).toBe("477 €");
    expect(h.document.getElementById("tbPreTitle")?.textContent).toBe("Prüfung abgeschlossen");
    expect(h.document.querySelectorAll(".preConfetti i")).toHaveLength(12);
    expect(h.w.parent.postMessage.mock.calls.some(([event]: any[]) => event.type === "oecher:offer-rendered")).toBe(false);
    const beforeTariff = h.document.getElementById("tbRecName")?.textContent;
    const button = h.document.getElementById("tbPreCta")!;
    button.click(); button.click();
    await new Promise(resolve => h.w.setTimeout(resolve, 20));
    expect(h.document.getElementById("tbPreOffer")).not.toBeVisible();
    expect(h.document.getElementById("tbOfferView")).toBeVisible();
    expect(h.document.getElementById("tbRecName")?.textContent).toBe(beforeTariff);
    expect(h.document.activeElement?.id).toBe("tbTitle");
    expect(h.document.querySelector(".preConfetti")).toBeNull();
    expect(h.w.parent.postMessage.mock.calls.filter(([event]: any[]) => event.type === "oecher:offer-rendered")).toHaveLength(1);
    expect(h.tables).toEqual(["kunden_config", "auftraege"]); expect(h.requests).not.toHaveBeenCalled();
    expect(JSON.stringify(h.row)).toBe(h.source);
    expect(JSON.stringify(h.stored())).not.toContain("Synthetisch");
    h.dom.window.close();
  });

  it.each([0, -32, null, undefined, NaN, Infinity, "", " ", "invalid", false])("goes directly to the offer for savings %s", async ersparnis => {
    const h = await load({ ...recommendation(), ersparnis });
    expect(h.document.getElementById("tbPreOffer")).not.toBeVisible();
    expect(h.document.getElementById("tbOfferView")).toBeVisible();
    expect(h.document.querySelector(".preConfetti")).toBeNull();
    expect(h.tables).toEqual(["kunden_config", "auftraege"]); h.dom.window.close();
  });

  it.each([
    { status: "pending" }, { location_id: "tn90CyE3XuYFTy4c1M3F" }, { tariff_name: "" },
    { jahreskosten: null, monatsabschlag: NaN }, { tariff_provider: "" },
  ])("does not celebrate an unverified or incomplete recommendation: %j", async patch => {
    const h = await load({ ...recommendation(), ...patch });
    expect(h.document.getElementById("tbPreOffer")).not.toBeVisible(); h.dom.window.close();
  });

  it("supports reload/back and repeated initialization without a loop, replayed confetti, or new order", async () => {
    const first = await load(); const appeared = first.stored(); first.dom.window.close();
    const reload = await load(recommendation(), { storage: appeared });
    expect(reload.document.getElementById("tbPreOffer")).toBeVisible();
    expect(reload.document.querySelector(".preConfetti")).toBeNull();
    reload.document.getElementById("tbPreCta")!.click(); const viewed = reload.stored(); reload.dom.window.close();
    const back = await load(recommendation(), { storage: viewed });
    expect(back.document.getElementById("tbOfferView")).toBeVisible();
    expect(back.document.getElementById("tbPreOffer")).not.toBeVisible();
    const reveal = vi.fn();
    back.w.OecherOfferPreview.present({ row: back.row, locationId: oecherLocation, onReveal: reveal });
    expect(reveal).not.toHaveBeenCalled(); expect(back.tables).toHaveLength(2); back.dom.window.close();
    const updated = await load({ ...recommendation(), ersparnis: 123.45 }, { storage: viewed });
    expect(updated.document.getElementById("tbPreOffer")).toBeVisible();
    expect(updated.document.getElementById("tbPreSavings")?.textContent).toBe("123,45 €"); updated.dom.window.close();
  });

  it("keeps the CTA usable with blocked session storage and skips the nonpersistent animation", async () => {
    const h = await load(recommendation(), { storageBlocked: true });
    expect(h.document.getElementById("tbPreOffer")).toBeVisible();
    expect(h.document.querySelector(".preConfetti")).toBeNull();
    h.document.getElementById("tbPreCta")!.click(); expect(h.document.getElementById("tbOfferView")).toBeVisible(); h.dom.window.close();
  });

  it.each(["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"])("localizes %s with static reduced motion and preserves tariff/customer/legal data", async lang => {
    const h = await load(recommendation(), { lang, reduced: true });
    const view = h.document.getElementById("tbPreOffer")!;
    expect(view.lang).toBe(lang); expect(view.dir).toBe(lang === "ar" ? "rtl" : "ltr");
    expect(view.querySelectorAll("li")).toHaveLength(3);
    expect(view.textContent).not.toContain("Mehrkosten");
    expect(h.document.querySelector(".preConfetti")).toBeNull();
    if (lang !== "de") expect(view.textContent).not.toContain("Prüfung abgeschlossen");
    expect(JSON.stringify(h.row)).toBe(h.source); h.dom.window.close();
  });
});
