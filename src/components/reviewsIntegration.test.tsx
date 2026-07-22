import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";

let config: Record<string, unknown> = {};
const widgetId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const embedPrefix = "https://www.jotform.com/website-widgets/embed/";

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    design: { assets: {} }, content: { i18n: {} },
    getText: (path: string, fallback: string) => typeof config[path] === "string" ? config[path] : fallback,
    getArray: <T,>(_path: string, fallback: T[]) => fallback,
  }),
}));

import { Hero } from "./Hero";
import { Testimonials } from "./Testimonials";
import Jahresrechnung from "@/pages/Jahresrechnung";

const renderWithI18n = (component: React.ReactNode) => render(<MemoryRouter><I18nProvider>{component}</I18nProvider></MemoryRouter>);

describe("Ehiogie config-driven review fallbacks", () => {
  it("keeps Ehiogie review carousels, headings, kickers, and CTAs without an ID", () => {
    config = { "integrations.google_reviews.jotform_widget_id": "   " };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.getByText("Sabine M.")).toBeInTheDocument();
    expect(screen.getByText("Das sagen unsere Nutzer")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Über 2000 Haushalte/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jetzt Ersparnis prüfen/i })).toBeInTheDocument();
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(`script[src^="${embedPrefix}"]`)).toBeNull();
    home.unmount();
    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.getByText("Lisa K.")).toBeInTheDocument();
    expect(screen.getByText("Das sagen unsere Nutzer")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Jahresabrechnung prüfen/i }).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(`script[src^="${embedPrefix}"]`)).toBeNull();
  });

  it("replaces each local carousel with one configured Jotform container", () => {
    config = { "integrations.google_reviews.jotform_widget_id": widgetId };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.queryByText("Sabine M.")).toBeNull();
    expect(screen.getByRole("heading", { name: /Über 2000 Haushalte/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jetzt Ersparnis prüfen/i })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid="jotform-review-widget"]')).toHaveLength(1);
    expect(document.querySelectorAll(`script[src="${embedPrefix}${widgetId}"]`)).toHaveLength(1);
    home.unmount();
    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.queryByText("Lisa K.")).toBeNull();
    expect(screen.getAllByRole("link", { name: /Jahresabrechnung prüfen/i }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-testid="jotform-review-widget"]')).toHaveLength(1);
    expect(document.querySelectorAll(`script[src="${embedPrefix}${widgetId}"]`)).toHaveLength(1);
  });

  it("leaves the hero without a review widget", () => {
    config = { "integrations.google_reviews.jotform_widget_id": widgetId };
    renderWithI18n(<Hero />);
    expect(screen.getByText(/Ergebnis in 60 Sekunden/i)).toBeInTheDocument();
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(`script[src^="${embedPrefix}"]`)).toBeNull();
  });
});
