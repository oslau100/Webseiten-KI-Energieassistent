import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const agencyLogo = "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/logo-schwarz-powered-by-400x100.png";

let assets: Record<string, string> = {};
let textConfig: Record<string, string> = {};

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => ({
      footer_callback: "Rückruf buchen",
      footer_contact: "Kontakt",
      footer_imprint: "Impressum",
      footer_legal: "Rechtliches",
      footer_privacy: "Datenschutz",
      footer_rights: "Alle Rechte vorbehalten.",
    })[key] || key,
    withLang: (path: string) => path,
  }),
}));

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    design: { assets },
    getText: (path: string, fallback: string) => textConfig[path] ?? fallback,
  }),
}));

import { Footer } from "./Footer";

const renderFooter = () => render(<MemoryRouter><Footer /></MemoryRouter>);

describe("Footer powered-by attribution", () => {
  beforeEach(() => {
    assets = {
      agency_logo: agencyLogo,
    };
    textConfig = {
      "brand.agency_url": "https://energieassistent.io",
      "brand.agency_alt": "Powered by Energieassistent.io",
      "brand.name": "Kromen Energieassistent",
    };
  });

  it("renders the configured Energieassistent.io attribution link and logo accessibly", () => {
    renderFooter();

    const link = screen.getByRole("link", { name: /powered by energieassistent\.io/i });
    expect(link).toHaveAccessibleName("Powered by Energieassistent.io");
    expect(link).toHaveAttribute("href", "https://energieassistent.io");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const logo = screen.getByRole("img", { name: "Powered by Energieassistent.io" });
    expect(logo).toHaveAttribute("src", agencyLogo);
    expect(logo).toHaveClass("h-auto", "w-[110px]", "md:w-[130px]", "object-contain");
  });

  it("does not render a broken attribution image when agency_logo is missing", () => {
    assets = {};

    renderFooter();

    expect(screen.queryByRole("link", { name: /powered by energieassistent\.io/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Powered by Energieassistent.io" })).not.toBeInTheDocument();
  });
});
