import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebsiteConfigProvider, useWebsiteConfig } from "./websiteConfig";
import { I18nProvider, useI18n, LANGUAGES } from "./i18n";
import { About } from "@/components/About";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { SectionLayout } from "@/components/SectionLayout";
import { CookieBar } from "@/components/CookieBar";
import { LegalPage } from "@/components/LegalPage";
import { resolveCustomerArray, resolveLocalizedText } from "./websiteContentResolver";

const locationId = "NPhuVMAaBPQz6OhIPpkj";
const localized = (label: string) => Object.fromEntries(LANGUAGES.map(({ code }) => [code, `${label} ${code}`]));
function fixture() {
  return { location_id: locationId, webseite_content_config: {
    brand: { name: "Tenant" }, legal: { ready: true, variables: { firma: "Tenant", email: "tenant@example.test" } },
    pages: { datenschutz: { html: { de: "<h1>Deutsches Rechtsdokument</h1>", en: "<h1>Wrong language document</h1>" } } },
    cookie: Object.fromEntries(["title", "browser_settings", "more_info", "privacy_link", "imprint_link", "essential", "save"].map(k => [k, localized(k)])),
    sections: {
      about: { name: "Tenant", headline: localized("About"), paragraphs: Object.fromEntries(LANGUAGES.map(({ code }) => [code, [`About paragraph ${code}`]])) },
      stats: { headline: localized("Stats"), items: Object.fromEntries(LANGUAGES.map(({ code }) => [code, [{ end: 1234, label: `Metric ${code}` }]])) },
      testimonials: { headline: localized("Reviews"), home_reviews: Object.fromEntries(LANGUAGES.map(({ code }) => [code, [{ name: "Source author", title: `Review ${code}`, text: `Review body ${code}`, rating: 4 }]])) },
    },
  }, webseite_design_config: { assets: { logo_header: "/logo.svg", logo_footer: "/logo.svg", hero_image: "/hero.png" } }, webseite_layout_config: { pages: {} } };
}
function Ready({ children }: { children: React.ReactNode }) {
  const { loading } = useWebsiteConfig(); const { lang } = useI18n();
  return loading ? null : <div data-testid="ready" data-lang={lang}>{children}</div>;
}
function mount(lang: string, children: React.ReactNode, row = fixture()) {
  vi.stubEnv("VITE_LOCATION_ID", locationId); vi.stubEnv("DEV", true);
  window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([row])));
  return render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}><WebsiteConfigProvider><I18nProvider><Ready>{children}</Ready></I18nProvider></WebsiteConfigProvider></MemoryRouter>);
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); delete window.TB_BOOTSTRAP; localStorage.clear(); document.cookie = "cookie-consent=; Path=/; Max-Age=0"; });
describe("customer copy across all supported locales", () => {
  it.each(LANGUAGES.map(l => l.code))("renders configured About, statistics, reviews and consent in %s", async lang => {
    mount(lang, <><About /><Stats /><Testimonials /><CookieBar /></>);
    await waitFor(() => expect(screen.getByTestId("ready")).toHaveAttribute("data-lang", lang));
    expect(screen.getByText(`About paragraph ${lang}`)).toBeInTheDocument();
    expect(screen.getByText(`Metric ${lang}`)).toBeInTheDocument();
    expect(screen.getByText(`Review body ${lang}`)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4/5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `save ${lang}` })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe(lang === "ar" ? "rtl" : "ltr");
    if (lang !== "de") expect(screen.queryByText("About paragraph de")).toBeNull();
  });
  it("marks missing customer consent copy incomplete without showing global German controls", async () => {
    const row = fixture(); row.webseite_content_config.cookie = {};
    const { container } = mount("en", <CookieBar />, row);
    await screen.findByTestId("ready");
    expect(container.querySelector('[data-copy-readiness="INCOMPLETE"]')).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it.each(["en", "ar"])("keeps legal HTML German and LTR for %s UI", async lang => {
    mount(lang, <LegalPage page="datenschutz" title="Privacy" />);
    const heading = await screen.findByRole("heading", { name: "Deutsches Rechtsdokument" });
    expect(heading.closest("main")).toHaveAttribute("lang", "de");
    expect(heading.closest("main")).toHaveAttribute("dir", "ltr");
    expect(screen.queryByText("Wrong language document")).toBeNull();
  });
  it("does not substitute foreign-only legal HTML when German is missing", async () => {
    const row = fixture();
    Reflect.deleteProperty(row.webseite_content_config.pages.datenschutz.html, "de");
    mount("en", <LegalPage page="datenschutz" title="Privacy" />, row);
    await screen.findByTestId("ready");
    expect(screen.queryByText("Wrong language document")).toBeNull();
    expect(screen.getByText("Die rechtlichen Angaben werden für diesen Standort vorbereitet.")).toBeInTheDocument();
  });
  it("marks missing localized proof arrays incomplete without reference copy", async () => {
    const row = fixture();
    row.webseite_content_config.sections.stats.items = { de: [{ end: 1234, label: "German only metric" }] };
    row.webseite_layout_config.pages = { home: { sections: ["stats"] } };
    const { container } = mount("tr", <SectionLayout page="home" ids={["stats"]}><Stats /></SectionLayout>, row);
    await waitFor(() => expect(screen.getByTestId("ready")).toHaveAttribute("data-lang", "tr"));
    expect(container.querySelector('[data-copy-readiness="INCOMPLETE"]')).toHaveAttribute("hidden");
    expect(screen.queryByText("German only metric")).toBeNull();
  });
  it("never uses flat German arrays, another locale or a foreign fallback for missing translations", () => {
    const c = { sections: { items: ["German only"], text: { de: "Deutsch" }, localized: { tr: ["Türkçe"] } } };
    expect(resolveCustomerArray(c, "sections.items.en")).toEqual([]);
    expect(resolveCustomerArray(c, "sections.items.de")).toEqual(["German only"]);
    expect(resolveCustomerArray(c, "sections.localized.en")).toEqual([]);
    expect(resolveCustomerArray(c, "sections.localized.tr")).toEqual(["Türkçe"]);
    expect(resolveLocalizedText(c, "sections.text", "", "en", false)).toBe("");
  });
});
