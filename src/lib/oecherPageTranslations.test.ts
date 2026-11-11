import { describe, it, expect, vi, afterEach } from "vitest";
import { observeOecherPageTranslations } from "./oecherPageTranslations";
import catalog from "./oecherPublicTranslations";
const languages = ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"];
const source = "Tarife und Rechnungen bereits geprüft";
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };
let stop: (() => void) | undefined;
afterEach(() => { stop?.(); document.body.replaceChildren(); vi.restoreAllMocks(); });

describe("Öcher deterministic public translations", () => {
  it("has an explicit value for every language and public source", () => {
    for (const [de, entries] of Object.entries(catalog)) {
      expect(entries.de).toBe(de);
      for (const lang of languages) expect(entries[lang], `${lang}: ${de}`).toEqual(expect.any(String));
      expect(Object.values(entries).every(text => text.trim().length > 0)).toBe(true);
    }
  });
  it.each(languages)("localizes delayed public text in %s without external requests", async lang => {
    const fetch = vi.spyOn(window, "fetch");
    stop = observeOecherPageTranslations(lang, "/");
    const p = document.createElement("p"); p.textContent = source; document.body.append(p);
    await flush();
    expect(p.textContent).toBe(catalog[source][lang]);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("handles React text replacements, language switches, and German restoration", async () => {
    const p = document.createElement("p"); p.textContent = source; document.body.append(p);
    stop = observeOecherPageTranslations("en", "/");
    p.firstChild!.nodeValue = "an Energiekosten bereits eingespart";
    await flush();
    expect(p.textContent).toBe(catalog["an Energiekosten bereits eingespart"].en);
    stop!(); stop = observeOecherPageTranslations("pl", "/");
    expect(p.textContent).toBe(catalog["an Energiekosten bereits eingespart"].pl);
    stop!(); stop = observeOecherPageTranslations("de", "/");
    expect(p.textContent).toBe("an Energiekosten bereits eingespart");
  });
  it("excludes inputs, customer text, names, tariff data and legal copy", async () => {
    document.body.innerHTML = `<p>Maximilian W.</p><p>Unbekannter dynamischer Kundentext</p><input value="${source}"><textarea>${source}</textarea><div data-no-translate="true">${source}</div><div translate="no">${source}</div><div class="notranslate">${source}</div>`;
    const before = document.body.innerHTML;
    stop = observeOecherPageTranslations("en", "/"); await flush();
    expect(document.body.innerHTML).toBe(before);
  });
  it.each(["/auftrag", "/tarif", "/datenschutz", "/impressum", "/start", "/rechnung"])("does not observe %s", path => {
    document.body.textContent = source;
    stop = observeOecherPageTranslations("en", path);
    expect(stop).toBeUndefined(); expect(document.body.textContent).toBe(source);
  });
  it("cancels queued work when unmounted and settles after own writes", async () => {
    const mutation = vi.fn(); const observer = new MutationObserver(mutation);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    stop = observeOecherPageTranslations("en", "/");
    const p = document.createElement("p"); p.textContent = source; document.body.append(p);
    stop!(); await flush(); expect(p.textContent).toBe(source);
    stop = observeOecherPageTranslations("en", "/"); await flush();
    const count = mutation.mock.calls.length; await flush(); await flush();
    expect(mutation).toHaveBeenCalledTimes(count); observer.disconnect();
  });
});
