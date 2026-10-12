import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Start from "@/pages/Start";
import Rechnung from "@/pages/Rechnung";
import Tarif from "@/pages/Tarif";
import Auftrag from "@/pages/Auftrag";
import { KROMEN_LOCATION_ID } from "@/lib/kromenOrderCompatibility";

vi.mock("@/components/SimpleFooter", () => ({ SimpleFooter: () => null }));
vi.mock("@/components/TarifCallbackSection", () => ({ TarifCallbackSection: () => null }));

const uuid = "11111111-2222-4333-8444-555555555555";
const loader = (name: string) => readFileSync(`public/loaders/${name}.html`, "utf8");
const inlineScripts = (html: string) => Array.from(new DOMParser().parseFromString(html, "text/html").querySelectorAll("script:not([src])"), script => script.textContent || "");

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe("existing Kromen funnel handoff", () => {
  it.each([
    ["start", Start, "Setting Survey Loader"],
    ["rechnung", Rechnung, "Rechnung Survey Loader"],
    ["tarif", Tarif, "Angebotsseite Loader"],
    ["auftrag", Auftrag, "Closing Survey Loader"],
  ] as const)("keeps UUID, language, referral and preview context intact in /%s", (name, Page, title) => {
    const query = `?uuid=${uuid}&lang=tr&ref=partner%2B42&referral=original&submission_id=legacy&preview_token=preview-context`;
    render(<MemoryRouter initialEntries={[`/${name}${query}`]}><Page /></MemoryRouter>);
    // Opaque query forwarding protects existing affiliate/preview contracts without interpreting them.
    expect(screen.getByTitle(title)).toHaveAttribute("src", `/loaders/${name}.html${query}`);
  });

  it.each(["start", "rechnung", "tarif", "auftrag"])("keeps the Kromen bootstrap identity in %s", name => {
    const runtime: { TB_BOOTSTRAP?: Record<string, string> } = {};
    Function("window", inlineScripts(loader(name))[0])(runtime);
    expect(runtime.TB_BOOTSTRAP?.locationId).toBe(KROMEN_LOCATION_ID);
    expect(runtime.TB_BOOTSTRAP?.supabaseUrl).toBe("https://oynhnhkldvpoqhsfirwf.supabase.co");
  });

  it("preserves base referral parameters and UUID/language in the existing offer links", () => {
    const source = loader("tarif");
    const functionSource = source.slice(source.indexOf("  function buildFinalUrl"), source.indexOf("  function applyDesignVars"));
    const buildUrl = Function("window", `${functionSource}; return buildFinalUrl;`)(window) as (base: string, uuid: string, lang: string) => string;
    for (const route of ["auftrag", "start"]) {
      const url = new URL(buildUrl(`/${route}?ref=partner%2B42&referral=original`, uuid, "ar"));
      expect(url.pathname).toBe(`/${route}`);
      expect(Object.fromEntries(url.searchParams)).toEqual({ ref: "partner+42", referral: "original", uuid, lang: "ar" });
      expect(url.searchParams.has("token")).toBe(false);
    }
    expect(buildUrl("", uuid, "tr")).toBe("");
  });

  const runClosing = async (response: { data?: unknown; error?: unknown }, search = `?uuid=${uuid}&lang=TR&ref=partner`) => {
    const scripts = inlineScripts(loader("auftrag"));
    const runtime: Record<string, unknown> = { location: { href: `https://www.kromen-energieassistent.de/auftrag${search}` } };
    Function("window", scripts[0])(runtime);
    document.body.innerHTML = '<div id="survey-app"></div>';
    const single = vi.fn().mockResolvedValue(response);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const createClient = vi.fn().mockReturnValue({ from });
    await Function("window", "document", "supabase", `return ${scripts[scripts.length - 1].trimStart()}`)(runtime, document, { createClient });
    return { runtime, from, eq };
  };

  it("keeps closing UUID/language overrides and uses bootstrap Location despite query tampering", async () => {
    const { runtime, from, eq } = await runClosing({ data: {} }, `?uuid=${uuid}&lang=TR&location_id=other-location&ref=partner`);
    expect(from).toHaveBeenCalledWith("kunden_config");
    expect(eq).toHaveBeenCalledWith("location_id", KROMEN_LOCATION_ID);
    expect(runtime.SURVEY_CONFIG).toMatchObject({ locationId: KROMEN_LOCATION_ID, uuidOverride: uuid, langOverride: "tr" });
  });

  it("keeps closing bootstrap failures closed and does not disclose error tokens", async () => {
    const { runtime } = await runClosing({ error: new Error("TOKEN_SENTINEL") });
    expect(runtime.SURVEY_CONFIG).toBeUndefined();
    expect(document.querySelector('script[src]')).toBeNull();
    expect(document.getElementById("survey-app")?.textContent).toContain("Fehler beim Laden");
    expect(document.body.textContent).not.toContain("TOKEN_SENTINEL");
  });

  it("does not query an order when the legacy offer has no order identifier", async () => {
    const html = loader("tarif");
    const scripts = inlineScripts(html);
    const runtime = { location: { search: "?lang=tr&ref=partner" } };
    Function("window", scripts[0])(runtime);
    document.body.innerHTML = new DOMParser().parseFromString(html, "text/html").body.innerHTML;
    const single = vi.fn().mockResolvedValue({ data: {} });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    await Function("window", "document", "supabase", `return ${scripts[scripts.length - 1].trimStart()}`)(runtime, document, { createClient: () => ({ from }) });
    expect(from).not.toHaveBeenCalledWith("auftraege");
    expect(document.getElementById("tbFazit")?.textContent).toBe("Konnte Daten nicht laden.");
    expect(document.getElementById("tbAiText")?.textContent).toContain("uuid oder submission_id");
  });
});
