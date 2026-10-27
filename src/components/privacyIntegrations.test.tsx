import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customerRuntimeBindings } from "@/lib/customerRuntime";
import { openConsentSettingsEvent, readConsent, setConsentStorage } from "@/lib/cookieConsent";
import { AutoPageTranslator } from "./AutoPageTranslator";
import { CookieBar } from "./CookieBar";
import { Footer } from "./Footer";
import { JotformReviewWidget } from "./JotformReviewWidget";

vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang: "en", t: (key: string) => key, withLang: (path: string) => path }) }));
vi.mock("@/lib/websiteConfig", () => ({ useWebsiteConfig: () => ({
  design: {}, getText: (_path: string, fallback: string) => fallback,
}) }));
const id = "a".repeat(36);
const embed = () => document.querySelector('script[src^="https://www.jotform.com/"]');
const mount = () => render(<MemoryRouter><main><p>Unbekannter Beispieltext</p></main><AutoPageTranslator /><JotformReviewWidget widgetId={id} /><Footer /><CookieBar /></MemoryRouter>);

beforeEach(() => { vi.stubEnv("VITE_LOCATION_ID", ""); vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([[["Translated text"]]]))); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); localStorage.clear(); document.cookie = "cookie-consent=; Path=/; Max-Age=0"; });

describe("optional third-party consent", () => {
  it.each(["/signing", "/signing/", "/SIGNING"])("never machine-translates signing at %s even with consent", path => {
    setConsentStorage("all");
    render(<MemoryRouter initialEntries={[path]}><main><p>TEST_ONLY Erklärung</p></main><AutoPageTranslator /><CookieBar /></MemoryRouter>);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("has no global Google Translate or Jotform resource hints in the entry document", () => {
    expect(readFileSync("index.html", "utf8")).not.toMatch(/translate\.google|google_translate|jotform/i);
  });
  it("defaults to essential and does not load either service before an explicit choice", () => {
    mount();
    expect(screen.getAllByRole("switch")[0]).toHaveAttribute("aria-checked", "false");
    expect(embed()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
    expect(readConsent()).toBe("essential");
    expect(embed()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows unrelated sites only after consent and withdraws via the footer", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { protocol: location.protocol, hostname: location.hostname, search: location.search, href: location.href, reload });
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Alles akzeptieren" }));
    await waitFor(() => expect(embed()).not.toBeNull());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("translate.googleapis.com"), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    fireEvent.click(screen.getByRole("button", { name: "Privatsphäre-Einstellungen" }));
    expect(screen.getAllByRole("switch")[0]).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getAllByRole("switch")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
    await waitFor(() => expect(embed()).toBeNull());
    expect(readConsent()).toBe("essential");
    expect(reload).toHaveBeenCalledOnce();
  });

  it.each(customerRuntimeBindings)("never loads Google or Jotform for $hostname even with explicit consent and a configured widget", ({ locationId }) => {
    vi.stubEnv("VITE_LOCATION_ID", locationId);
    vi.stubEnv("DEV", true);
    setConsentStorage("all");
    mount();
    expect(embed()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });


  describe.each(customerRuntimeBindings)("customer consent UI for $hostname", ({ locationId }) => {
    beforeEach(() => {
      vi.stubEnv("VITE_LOCATION_ID", locationId);
      vi.stubEnv("DEV", true);
      window.TB_BOOTSTRAP = {
        locationId,
        metaPixelId: "123456789",
        tiktokPixelId: "fixture-pixel",
        crm: { trackingEnabled: true },
      };
    });
    afterEach(() => { delete window.TB_BOOTSTRAP; });

    it("shows only browser settings and saves essential without optional requests", () => {
      mount();
      expect(screen.getByText(/speichert Ihre Spracheinstellung und Ihre Privatsphäre-Einstellungen/)).toBeInTheDocument();
      expect(screen.queryByText(/Marketing|Google Translate|Jotform/)).toBeNull();
      expect(screen.queryByRole("button", { name: "Alles akzeptieren" })).toBeNull();
      expect(screen.getAllByRole("switch")).toHaveLength(1);
      expect(screen.getByRole("switch")).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
      expect(readConsent()).toBe("essential");
      expect(embed()).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Privatsphäre-Einstellungen" }));
      expect(screen.getByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Alles akzeptieren" })).toBeNull();
    });

    it("withdraws an existing all choice without offering marketing or loading services", () => {
      const reload = vi.fn();
      vi.stubGlobal("location", { protocol: location.protocol, hostname: location.hostname, search: location.search, href: location.href, reload });
      setConsentStorage("all");
      mount();
      fireEvent.click(screen.getByRole("button", { name: "Privatsphäre-Einstellungen" }));
      expect(screen.getAllByRole("switch")).toHaveLength(1);
      expect(screen.queryByText(/Marketing|Google Translate|Jotform/)).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
      expect(readConsent()).toBe("essential");
      expect(reload).not.toHaveBeenCalled();
      expect(embed()).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
      fireEvent(window, new Event(openConsentSettingsEvent));
      expect(screen.getByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
    });
  });

  it.each(["legacy", "local-only", "expired", "malformed"])("does not treat %s storage as effective consent", kind => {
    const value = kind === "legacy" ? "all" : kind === "expired" ? `v2:all:${Date.now() - 1}` : kind === "malformed" ? "%broken" : `v2:all:${Date.now() + 10000}`;
    localStorage.setItem("cookie-consent", value);
    if (kind !== "local-only") document.cookie = `cookie-consent=${encodeURIComponent(value)}; Path=/`;
    mount();
    expect(readConsent()).toBeNull();
    expect(embed()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
  });
});
