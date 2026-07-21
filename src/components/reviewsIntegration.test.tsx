import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";

let config: Record<string, unknown> = {};
const mainWidgetId = "8179db6b-2332-4da8-84cc-e2e1eb8cdb6c";
const heroWidgetId = "05c58679-3beb-4511-abfa-73b965d8d7e9";

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
  it("keeps homepage and annual mock reviews when main_widget_id is missing or blank", () => {
    config = { "integrations.google_reviews.main_widget_id": "   " };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.getByText("Sabine M.")).toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
    home.unmount();

    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.getByText("Lisa K.")).toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("replaces both mock carousels while preserving headings and CTAs for a configured main widget", () => {
    config = { "integrations.google_reviews.main_widget_id": mainWidgetId };
    const home = renderWithI18n(<Testimonials />);
    expect(screen.queryByText("Sabine M.")).toBeNull();
    expect(screen.getByRole("heading", { name: /Über 2000 Haushalte/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jetzt Ersparnis prüfen/i })).toBeInTheDocument();
    expect(document.querySelector(`iframe[data-widget-id="${mainWidgetId}"]`)).toBeTruthy();
    home.unmount();

    const annual = renderWithI18n(<Jahresrechnung />);
    expect(screen.queryByText("Lisa K.")).toBeNull();
    expect(screen.getByRole("heading", { name: /Mehr als 2.000 Haushalte/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Jahresabrechnung prüfen/i }).length).toBeGreaterThan(0);
    expect(document.querySelector(`iframe[data-widget-id="${mainWidgetId}"]`)).toBeTruthy();
  });

  it("does not add an empty hero wrapper without an ID and places the configured hero widget after the result note", () => {
    config = {};
    const fallback = renderWithI18n(<Hero />);
    expect(screen.queryByTestId("get-review-widget")).toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
    fallback.unmount();

    config = { "integrations.google_reviews.hero_widget_id": heroWidgetId };
    renderWithI18n(<Hero />);
    const note = screen.getByText(/Ergebnis in 60 Sekunden/i);
    const widget = screen.getByTestId("get-review-widget");
    expect(note.compareDocumentPosition(widget) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelector(`iframe[data-widget-id="${heroWidgetId}"]`)).toBeTruthy();
  });
});
