import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";

let config: Record<string, unknown> = {};
const jotformWidgetId = "019f893d595870008c4dd1e6ec285a30e32a";
const jotformScriptSelector = `script[src="https://www.jotform.com/website-widgets/embed/${jotformWidgetId}"]`;
const anyJotformScriptSelector = 'script[src^="https://www.jotform.com/website-widgets/embed/"]';

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    design: { assets: {} },
    content: { i18n: {} },
    getText: (path: string, fallback: string) => typeof config[path] === "string" ? config[path] : fallback,
    getArray: <T,>(_path: string, fallback: T[]) => fallback,
  }),
}));

import { Hero } from "./Hero";
import { Testimonials } from "./Testimonials";
import Jahresrechnung from "@/pages/Jahresrechnung";

const renderWithI18n = (component: React.ReactNode) => render(<MemoryRouter><I18nProvider>{component}</I18nProvider></MemoryRouter>);

describe("config-driven Google review fallbacks", () => {
  it("keeps homepage and annual mock reviews when jotform_widget_id is missing or blank", () => {
    config = { "integrations.google_reviews.jotform_widget_id": "   " };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.getByText("Sabine M.")).toBeInTheDocument();
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(anyJotformScriptSelector)).toBeNull();
    home.unmount();

    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.getByText("Lisa K.")).toBeInTheDocument();
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(anyJotformScriptSelector)).toBeNull();
  });

  it("replaces both mock carousels while preserving headings and CTAs for a configured Jotform widget", () => {
    config = { "integrations.google_reviews.jotform_widget_id": jotformWidgetId };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.queryByText("Sabine M.")).toBeNull();
    expect(screen.getByRole("heading", { name: /Über 2000 Haushalte nutzen den Energieassistenten/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jetzt Ersparnis prüfen/i })).toBeInTheDocument();
    const homeWidget = document.querySelector(`div[data-testid="jotform-review-widget"]`) as HTMLIFrameElement;
    expect(homeWidget).toBeTruthy();
    expect(document.querySelectorAll(jotformScriptSelector)).toHaveLength(1);
    expect(homeWidget.parentElement?.className).toContain("max-w-7xl");
    expect(homeWidget.parentElement?.className).not.toContain("max-w-5xl");
    expect(homeWidget.parentElement?.className).not.toContain("md:px-12");
    home.unmount();

    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.queryByText("Lisa K.")).toBeNull();
    expect(screen.getByRole("heading", { name: /Mehr als 2.000 Haushalte/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Jahresabrechnung prüfen/i }).length).toBeGreaterThan(0);
    const annualWidget = document.querySelector(`div[data-testid="jotform-review-widget"]`) as HTMLIFrameElement;
    expect(annualWidget).toBeTruthy();
    expect(document.querySelectorAll(jotformScriptSelector)).toHaveLength(1);
    expect(annualWidget.parentElement?.className).not.toContain("max-w-5xl");
    expect(annualWidget.parentElement?.className).not.toContain("md:px-12");
  });

  it("does not render a review widget in the hero", () => {
    config = { "integrations.google_reviews.jotform_widget_id": "" };
    renderWithI18n(<Hero />);
    const note = screen.getByText(/Ergebnis in 60 Sekunden/i);
    expect(note).toBeInTheDocument();
    expect(screen.queryByTestId("jotform-review-widget")).toBeNull();
    expect(document.querySelector(anyJotformScriptSelector)).toBeNull();
  });
});
