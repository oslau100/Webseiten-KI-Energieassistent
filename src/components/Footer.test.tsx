import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { I18nProvider } from "@/lib/i18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <WebsiteConfigProvider>
        <I18nProvider>
          <Footer />
        </I18nProvider>
      </WebsiteConfigProvider>
    </MemoryRouter>,
  );

describe("Öcher Strom V1 footer without agency attribution", () => {
  it("does not show or link any external agency branding", () => {
    renderFooter();
    expect(screen.queryByRole("link", { name: /Powered by Energieassistent\.io/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Powered by Energieassistent\.io/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Powered by$/i)).not.toBeInTheDocument();
  });

  it("retains the customer brand in the footer", () => {
    renderFooter();
    expect(screen.getByText((_, el) => el?.tagName === "P" && (el.textContent ?? "").includes("Öcher Strom"))).toBeInTheDocument();
  });

  it("retains contact and legal navigation", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /Datenschutz/i })).toHaveAttribute("href", expect.stringContaining("/datenschutz"));
    expect(screen.getByRole("link", { name: /Impressum/i })).toHaveAttribute("href", expect.stringContaining("/impressum"));
    expect(screen.getByRole("link", { name: /Rückruf/i })).toHaveAttribute("href", expect.stringContaining("/rueckruf-buchen"));
  });
});
