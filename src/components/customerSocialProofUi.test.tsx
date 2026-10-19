import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveCustomerArray, resolveLocalizedText, type JsonRecord } from "@/lib/websiteContentResolver";
import { Hero } from "./Hero";
import { Solution } from "./Solution";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import Annual from "@/pages/Jahresrechnung";

const state = vi.hoisted(() => ({ lang: "de", customer: true, enabled: false, content: {} as JsonRecord }));
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang: state.lang, withLang: (path: string) => path,
  t: (key: string) => resolveLocalizedText(state.content, `i18n.${key}`, "", state.lang, false) }) }));
vi.mock("@/lib/websiteConfig", () => ({ useWebsiteConfig: () => ({ content: state.content, customerRuntime: state.customer,
  design: { assets: {} }, layout: { features: { start_survey: state.enabled, rechnung_survey: state.enabled } },
  getText: (path: string, fallback: string, lang = state.lang) => resolveLocalizedText(state.content, path, state.customer ? "" : fallback, lang, false),
  getArray: (path: string) => resolveCustomerArray(state.content, path),
}) }));
vi.mock("./Header", () => ({ Header: () => null }));
vi.mock("./Footer", () => ({ Footer: () => null }));
vi.mock("./About", () => ({ About: () => null }));
vi.mock("./PageChrome", () => ({ PageChrome: () => null }));
vi.mock("./SectionLayout", () => ({ SectionLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
const locales = ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"];
const text = (value: string) => Object.fromEntries(locales.map(l => [l, `${value} ${l}`]));
function configure() {
  state.content = { availability: { unavailable: text("Unavailable"), contact: text("Contact") }, brand: { contact_email: "owner@example.test" },
    i18n: { cta_check_savings: text("Check"), annual_testimonials_h2: text("Annual {customer_count}"), annual_hero_h1: text("Annual hero") },
    sections: {
      hero: { badge: text("Badge {customer_count}"), headline: text("Hero"), subline: text("Subline"), cta_text: text("Start"), result_note: text("Result note") },
      solution: { cta_text: text("Solution"), result_note: text("Solution note") },
      stats: { customer_count: 4321, headline: text("Stats {customer_count}"), items: Object.fromEntries(locales.map(l => [l, [{ end: 10, label: "Tariffs" }, { end: 2000, label: "Customers" }]])) },
      testimonials: { headline: text("Home {customer_count}"), home_reviews: Object.fromEntries(locales.map(l => [l, [{ name: "Author", title: "Review", text: "Body", rating: 4 }]])) },
      jahresrechnung: { badge: text("Annual badge {customer_count}"), cta: text("Invoice"), free_note: text("Free note"), reviews: Object.fromEntries(locales.map(l => [l, [{ name: "Author", title: "Review", text: "Body", rating: 4 }]])) },
    },
  };
}
afterEach(() => { state.lang = "de"; state.customer = true; state.enabled = false; vi.restoreAllMocks(); });
const mount = (children: React.ReactNode) => render(<MemoryRouter>{children}</MemoryRouter>);

describe("customer CTA and shared proof integration", () => {
  it.each(["de", "en", "tr", "ar"])("groups Hero/Solution buttons and their existing notes in %s", locale => {
    configure(); state.lang = locale;
    const { container } = mount(<><Hero /><Solution /></>);
    const groups = container.querySelectorAll(".customer-cta-note-group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveClass("customer-hero-cta-group");
    for (const group of groups) {
      const action = group.querySelector('[role="button"]')!;
      expect(action.parentElement).toBe(group);
      expect(action.nextElementSibling).toHaveAttribute("data-cta-note");
      expect(action).toHaveAttribute("aria-disabled", "true");
      expect(action).not.toHaveAttribute("href");
      fireEvent.click(action);
      expect(group.querySelector("a")).toBeNull();
    }
    expect(container.textContent).not.toMatch(/Unavailable|Contact/);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector('[data-customer-hero-pill="true"] [data-pill-dot]')).toHaveAttribute("aria-hidden", "true");
  });
  it("keeps the same note group when the separately controlled survey gate is enabled", () => {
    configure(); state.enabled = true;
    const { container } = mount(<Hero />);
    const link = screen.getByRole("link", { name: "Start de" });
    expect(link).toHaveAttribute("href", "/start");
    expect(link.parentElement).toBe(container.querySelector(".customer-cta-note-group"));
    expect(link.nextElementSibling).toHaveAttribute("data-cta-note");
  });
  it.each(locales)("uses one count across Stats, Home, Annual and badges in %s", locale => {
    configure(); state.lang = locale;
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
    const { container } = mount(<><Hero /><Stats /><Testimonials /><Annual /></>);
    const number = new Intl.NumberFormat(locale).format(4321);
    expect(screen.getByRole("heading", { name: `Home ${number} ${locale}` })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: `Annual ${number} ${locale}` })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: `Stats ${number} ${locale}` })).toHaveLength(2);
    // Keep Intl's exact grouping spaces (RU U+00A0 / FR U+202F) in the DOM comparison.
    expect(screen.getByText(`Badge ${number} ${locale}`, { normalizer: value => value })).toBeInTheDocument();
    expect(screen.getByText(`Annual badge ${number} ${locale}`, { normalizer: value => value })).toBeInTheDocument();
    expect(container.textContent).not.toContain("2000");
    expect(container.querySelectorAll("[data-cta-note]")).toHaveLength(3);
  });
  it("retains the Ehiogie Hero structure and literal badge", () => {
    configure(); state.customer = false;
    const sections = state.content.sections as JsonRecord;
    (sections.hero as JsonRecord).badge = text("Original 2000");
    const { container } = mount(<Hero />);
    expect(screen.getByText("Original 2000 de")).toBeInTheDocument();
    expect(container.querySelector(".customer-cta-note-group")).toBeNull();
    expect(container.querySelector('[data-customer-hero-pill="true"]')).toBeNull();
    expect(screen.getByRole("link", { name: "Start de" })).toHaveAttribute("href", "/start");
  });
  it("preserves V3 headlines and badges before config migration using the one DE statistic", () => {
    configure();
    const sections = state.content.sections as JsonRecord;
    const stats = sections.stats as JsonRecord;
    delete stats.customer_count;
    stats.items = { de: [{ end: 10, label: "Tariffs" }, { end: 1500, label: "Customers" }] };
    stats.headline = { de: "Über 1.500 Haushalte nutzen bereits den digitalen Energieassistenten" };
    (sections.testimonials as JsonRecord).headline = { de: "Über 1500 Haushalte nutzen bereits den digitalen Energieassistenten" };
    (state.content.i18n as JsonRecord).annual_testimonials_h2 = { de: "Mehr als 2.000 Haushalte nutzen den Energieassistenten bereits" };
    (sections.hero as JsonRecord).badge = { de: "Bereits 1.500+ zufriedene Nutzer in ganz Deutschland" };
    (sections.jahresrechnung as JsonRecord).badge = { de: "Bereits 2.000+ zufriedene Nutzer in ganz Deutschland" };
    const { container } = mount(<><Hero /><Stats /><Testimonials /><Annual /></>);
    expect(screen.getAllByRole("heading", { name: "Über 1.500 Haushalte nutzen bereits den digitalen Energieassistenten" })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Mehr als 1.500 Haushalte nutzen den Energieassistenten bereits" })).toBeInTheDocument();
    expect(screen.getAllByText("Bereits 1.500+ zufriedene Nutzer in ganz Deutschland")).toHaveLength(2);
    expect(container.querySelector('[data-copy-readiness="INCOMPLETE"]')).toBeNull();
    expect(container.textContent).not.toContain("2.000");
  });
});
