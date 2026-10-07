import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

let values: Record<string, string> = {};
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang: "de" }) }));
vi.mock("@/lib/websiteConfig", () => ({ useWebsiteConfig: () => ({ getText: (path: string, fallback: string) => values[path] ?? fallback }) }));
import { WebsiteMetadata } from "./WebsiteMetadata";
const renderMetadata = () => render(<MemoryRouter initialEntries={["/tarif?uuid=private-token&lang=de"]}><WebsiteMetadata /></MemoryRouter>);
afterEach(() => { values = {}; document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((node) => node.remove()); });

describe("neutral and configured metadata", () => {
  it("omits customer domains and social images until configured", async () => {
    renderMetadata();
    await waitFor(() => expect(document.title).toBe("Energieassistent"));
    expect(document.head.querySelector('link[rel="canonical"], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]')).toBeNull();
  });
  it("uses configured metadata and excludes query tokens from canonical URLs", async () => {
    values = { "seo.title": "Company title", "seo.description": "Company description", "seo.site_url": "https://company.test", "seo.image_url": "https://company.test/share.png" };
    renderMetadata();
    await waitFor(() => expect(document.title).toBe("Company title"));
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://company.test/tarif");
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute("content", "https://company.test/tarif");
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute("content", "https://company.test/share.png");
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute("content", "Company description");
  });
  it("omits an invalid canonical domain", () => {
    values = { "seo.site_url": "<CUSTOMER_DOMAIN>" };
    renderMetadata();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
