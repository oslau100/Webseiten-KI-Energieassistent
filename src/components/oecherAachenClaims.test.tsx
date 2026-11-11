import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider, LANGUAGES, useI18n } from "@/lib/i18n";
import { customerDefaultWebsiteContentConfig, oecherWebsiteClaimTranslations } from "@/lib/websiteContentDefaults";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import Jahresrechnung from "@/pages/Jahresrechnung";

const mockWebsite = vi.hoisted(() => ({
  content: {} as Record<string, unknown>,
  tenant: { customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" },
}));

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    content: mockWebsite.content,
    tenant: mockWebsite.tenant,
    design: {},
    getText: (path: string, fallback: string, lang?: string) => {
      const value = path.split(".").reduce<unknown>((current, key) => {
        if (!current || typeof current !== "object") return undefined;
        return (current as Record<string, unknown>)[key];
      }, mockWebsite.content);
      if (typeof value === "string") return value;
      if (value && typeof value === "object") {
        const localized = (value as Record<string, unknown>)[lang || ""];
        if (typeof localized === "string") return localized;
        const de = (value as Record<string, unknown>).de;
        if (typeof de === "string") return de;
      }
      return fallback;
    },
    getArray: <T,>(path: string, fallback: T[]) => {
      const value = path.split(".").reduce<unknown>((current, key) => {
        if (!current || typeof current !== "object") return undefined;
        return (current as Record<string, unknown>)[key];
      }, mockWebsite.content);
      return Array.isArray(value) ? value as T[] : fallback;
    },
  }),
}));

const ClaimFallbacks = () => {
  const { lang, t } = useI18n();
  const { getText } = useWebsiteConfig();
  return (
    <>
      <p data-testid="hero">{getText("sections.hero.badge", t("hero_badge"), lang)}</p>
      <p data-testid="stats-label">{getText("sections.stats.households_label", t("stats_households_label"), lang)}</p>
      <p data-testid="home-headline">{getText("sections.stats.headline", t("home_testimonials_h2"), lang)}</p>
      <p data-testid="annual-headline">{getText("sections.stats.headline", t("annual_testimonials_h2"), lang)}</p>
    </>
  );
};

const renderComponentForLanguage = (component: ReactNode, lang: string) => render(
  <MemoryRouter initialEntries={[`/?lang=${lang}`]}>
    <I18nProvider>{component}</I18nProvider>
  </MemoryRouter>,
);

const renderForLanguage = (lang: string) => renderComponentForLanguage(<ClaimFallbacks />, lang);

describe("Öcher Aachen claim fallbacks", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it.each(LANGUAGES.map(({ code }) => code))("uses matching 5,000+ copy on homepage and annual page for %s", async (lang) => {
    mockWebsite.content = { i18n: {} };
    mockWebsite.tenant = { customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" };
    renderForLanguage(lang);

    await waitFor(() => expect(document.documentElement.lang).toBe(lang));
    expect(screen.getByTestId("hero")).toHaveTextContent(oecherWebsiteClaimTranslations.heroBadge[lang]);
    expect(screen.getByTestId("stats-label")).toHaveTextContent(oecherWebsiteClaimTranslations.statsHouseholdsLabel[lang]);
    expect(screen.getByTestId("home-headline")).toHaveTextContent(oecherWebsiteClaimTranslations.headline[lang]);
    expect(screen.getByTestId("annual-headline")).toHaveTextContent(oecherWebsiteClaimTranslations.headline[lang]);
  });

  it("uses localized website defaults instead of a German-only label", async () => {
    mockWebsite.content = customerDefaultWebsiteContentConfig;
    mockWebsite.tenant = { customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" };
    renderForLanguage("en");

    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    expect(screen.getByTestId("hero")).toHaveTextContent(oecherWebsiteClaimTranslations.heroBadge.en);
    expect(screen.getByTestId("stats-label")).toHaveTextContent(oecherWebsiteClaimTranslations.statsHouseholdsLabel.en);
    expect(screen.getByTestId("home-headline")).toHaveTextContent(oecherWebsiteClaimTranslations.headline.en);
    expect(screen.getByTestId("annual-headline")).toHaveTextContent(oecherWebsiteClaimTranslations.headline.en);
  });

  it("renders the claim and household stat on the annual page", async () => {
    mockWebsite.content = customerDefaultWebsiteContentConfig;
    mockWebsite.tenant = { customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" };
    renderComponentForLanguage(<Jahresrechnung />, "en");

    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    expect(screen.getByText(oecherWebsiteClaimTranslations.heroBadge.en)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: oecherWebsiteClaimTranslations.headline.en })).toHaveLength(2);
    expect(screen.getByText(oecherWebsiteClaimTranslations.statsHouseholdsLabel.en)).toBeInTheDocument();
    expect((customerDefaultWebsiteContentConfig.sections as Record<string, any>).stats.items[1].end).toBe(5000);
  });

  it("keeps the shared Ehiogie fallback generic", async () => {
    mockWebsite.content = { i18n: {} };
    mockWebsite.tenant = { customer: "ehiogie", locationId: "legacy" };
    renderForLanguage("de");

    await waitFor(() => expect(document.documentElement.lang).toBe("de"));
    expect(screen.getByTestId("hero")).toHaveTextContent("Über 2.000 zufriedene Nutzer in ganz Deutschland");
    expect(screen.getByTestId("home-headline")).toHaveTextContent("Über 2000 Haushalte nutzen bereits den digitalen Energieassistenten");
  });
});
