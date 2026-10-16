import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { WebsiteConfigProvider, useWebsiteConfig } from "@/lib/websiteConfig";
import { customerRuntimeBindings } from "@/lib/customerRuntime";

function config(locationId: string) {
  return { location_id: locationId,
    webseite_content_config: { i18n: { footer_contact: { de: "Kontakt" }, footer_callback: { de: "Rückruf buchen" }, header_check_bill: { de: "Jahresabrechnung prüfen" }, header_check_savings: { de: "Tarifersparnis prüfen" } }, brand: { name: "Configured fixture" }, legal: { ready: true, variables: { firma: "Fixture company", email: "fixture@example.test" } } },
    webseite_design_config: { assets: { logo_header: "/fixture.svg", logo_footer: "/fixture.svg", hero_image: "/fixture.png" } },
    webseite_layout_config: { pages: { home: { sections: ["header", "hero", "footer"] }, annual: { sections: ["header", "hero", "footer"] } } },
  };
}
function mount(locationId: string, path: string, row = config(locationId)) {
  vi.stubEnv("VITE_LOCATION_ID", locationId);
  vi.stubEnv("DEV", true);
  window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
  history.replaceState({}, "", `${path}?lang=de`);
  const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([row])));
  const result = render(<App />);
  return { ...result, fetcher };
}
beforeEach(() => { document.cookie = "cookie-consent=; Path=/; Max-Age=0"; vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); delete window.TB_BOOTSTRAP; localStorage.clear(); document.cookie = "cookie-consent=; Path=/; Max-Age=0"; history.replaceState({}, "", "/"); });

const CopyProbe = () => {
  const { getText, getArray, loading } = useWebsiteConfig();
  const { t } = useI18n();
  if (loading) return null;
  return <output data-testid="copy-policy">{JSON.stringify({
    headline: getText("sections.hero.headline", t("hero_headline"), "de"),
    navigation: t("header_check_bill"),
    brand: getText("brand.name", "Foreign fixture brand"),
    contact: getText("brand.contact_email", "foreign@example.test"),
    legal: getText("legal.variables.telefon", "foreign-phone"),
    image: getText("sections.hero.image_alt", "Foreign fixture brand"),
    badge: getText("sections.hero.badge", t("hero_badge")),
    stats: getText("sections.stats.headline", "Foreign fixture statistics"),
    reviews: getArray("sections.testimonials.home_reviews", ["Foreign fixture review"]),
    unknown: getText("sections.hero.tariff_name", "Foreign fixture tariff"),
  })}</output>;
};

describe.each(customerRuntimeBindings)("central German copy for $locationId", ({ locationId }) => {
  it("keeps configured translations while missing customer fields stay empty", async () => {
    vi.stubEnv("VITE_LOCATION_ID", locationId);
    vi.stubEnv("DEV", true);
    window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
    const row = config(locationId);
    Object.assign(row.webseite_content_config, { brand: {}, i18n: { footer_contact: { de: "Kontakt" }, footer_callback: { de: "Rückruf buchen" }, header_check_bill: { de: "Configured German navigation" } } });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([row])));
    render(<BrowserRouter><WebsiteConfigProvider><I18nProvider><CopyProbe /></I18nProvider></WebsiteConfigProvider></BrowserRouter>);
    const copy = JSON.parse((await screen.findByTestId("copy-policy")).textContent || "{}");
    expect(copy).toEqual({ headline: "", navigation: "Configured German navigation", brand: "", contact: "", legal: "", image: "", badge: "", stats: "", reviews: [], unknown: "" });
  });
  it("renders home, navigation and cookie controls without customer fact fallbacks", async () => {
    const { container } = mount(locationId, "/");
    await waitFor(() => expect(container.querySelector("main")).toBeInTheDocument());
    expect(screen.queryByText("Zahlst du zu viel für Strom oder Gas?")).toBeNull();
    expect(screen.getByRole("link", { name: "Jahresabrechnung prüfen" })).toHaveAttribute("href", "/jahresrechnung?lang=de");
    expect(screen.getByRole("button", { name: /Sprache wechseln/ })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-transport=NOT_READY]").length).toBeGreaterThan(0);
    expect(container.querySelectorAll('a[href^="/start"]')).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Rückruf buchen" })).toHaveAttribute("href", "/rueckruf-buchen?lang=de");
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz?lang=de");
    expect(await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Einstellungen speichern" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
    expect(screen.queryByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Privatsphäre-Einstellungen" }));
    expect(await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alles akzeptieren" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));
    expect(container.textContent).not.toMatch(/2\.000|1\.500|900\.000|Marvin|ehiogie/);
    fireEvent.click(screen.getByRole("link", { name: "Jahresabrechnung prüfen" }));
    expect(await screen.findByRole("link", { name: "Tarifersparnis prüfen" })).toHaveAttribute("href", "/?lang=de");
    expect(container.querySelectorAll('a[href^="/rechnung"]')).toHaveLength(0);
  });
  it.each(["impressum", "datenschutz"])("keeps %s labels and customer legal values behind approval", async page => {
    mount(locationId, `/${page}`);
    expect(await screen.findByRole("heading", { name: page === "impressum" ? "Impressum" : "Datenschutzerklärung" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "fixture@example.test" })).toBeNull();
    expect(screen.getByText("Die rechtlichen Angaben werden für diesen Standort vorbereitet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz?lang=de");
  });
  it.each(["impressum", "datenschutz"])("cannot bypass legal approval via %s HTML", async page => {
    const row = config(locationId);
    row.webseite_content_config.legal.ready = false;
    Object.assign(row.webseite_content_config, { pages: { [page]: { html: "<h1>Unapproved fixture</h1>" } } });
    mount(locationId, `/${page}`, row);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByRole("status")).toHaveAttribute("data-reason", "LEGAL_NOT_READY");
    expect(screen.queryByRole("heading", { name: "Unapproved fixture" })).toBeNull();
  });
  it.each(["/start", "/tarif", "/auftrag", "/rechnung"])("keeps %s dormant despite restored system text", async path => {
    const { container, fetcher } = mount(locationId, path);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByRole("status")).toHaveAttribute("data-reason", "TRANSPORT_NOT_READY");
    expect(container.querySelector("iframe")).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
