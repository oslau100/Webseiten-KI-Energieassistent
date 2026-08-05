import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { I18nProvider } from "@/lib/i18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";
import { customerDefaultWebsiteContentConfig } from "@/lib/websiteContentDefaults";
import { customerDefaultWebsiteDesignConfig } from "@/lib/customerDefaults";

const agencyUrl = "https://energieassistent.io";
const agencyAlt = "Powered by Energieassistent.io";
const agencyLogo =
  "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/logo-schwarz-100x100.png";

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

describe("Footer powered-by attribution", () => {
  it("keeps Energieassistent.io agency fallbacks configurable", () => {
    expect(customerDefaultWebsiteContentConfig.brand).toMatchObject({
      agency_url: agencyUrl,
      agency_alt: agencyAlt,
    });
    expect(
      (customerDefaultWebsiteDesignConfig.assets as Record<string, string>)
        .agency_logo,
    ).toBe(agencyLogo);
  });

  it("renders the configured external agency link and accessible logo", () => {
    renderFooter();

    const link = screen.getByRole("link", { name: agencyAlt });
    expect(link).toHaveAttribute("href", agencyUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const logo = screen.getByRole("img", { name: agencyAlt });
    expect(logo).toHaveAttribute("src", agencyLogo);
  });
});
