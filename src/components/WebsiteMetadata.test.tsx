import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const context = vi.hoisted(() => ({ customerRuntime: false, readiness: "READY", loading: false, tenant: { locationId: "NPhuVMAaBPQz6OhIPpkj" }, design: { assets: {} as Record<string, unknown> } }));
let values: Record<string, string> = {};
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang: "de" }) }));
vi.mock("@/lib/websiteConfig", () => ({ useWebsiteConfig: () => ({ ...context, getText: (path: string, fallback: string) => values[path] ?? fallback }) }));
import { WebsiteMetadata } from "./WebsiteMetadata";
const renderMetadata = () => render(<MemoryRouter initialEntries={["/tarif?uuid=private-token&lang=de"]}><WebsiteMetadata /></MemoryRouter>);
afterEach(() => { values = {}; context.customerRuntime = false; context.readiness = "READY"; context.loading = false; context.tenant.locationId = "NPhuVMAaBPQz6OhIPpkj"; context.design.assets = {}; document.head.querySelectorAll('meta, link[rel="canonical"], link[rel="icon"]').forEach((node) => node.remove()); });

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

describe("customer favicons from validated website context", () => {
  const origin = "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/";
  const icon = (id: string) => `${origin}${id}/t08/v1/logo.png`;
  it.each(["NPhuVMAaBPQz6OhIPpkj", "uGJsQ3CWvFTraTfrRgjC"])("uses only the ready tenant PNG for %s", id => {
    context.customerRuntime = true; context.tenant.locationId = id;
    context.design.assets = { logo_header: icon(id) };
    renderMetadata();
    expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute("href", icon(id));
    expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute("type", "image/png");
  });
  it.each(["https://evil.test/logo.png", "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/sign/private-pdfs/logo.png", icon("uGJsQ3CWvFTraTfrRgjC"), icon("NPhuVMAaBPQz6OhIPpkj") + "?spoof=1"])("rejects untrusted/cross-location resource %s", url => {
    context.customerRuntime = true; context.design.assets = { logo_header: url };
    renderMetadata(); expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });
  it.each(["NOT_READY", "loading"])("removes the generic icon before customer readiness: %s", state => {
    context.customerRuntime = true; context.design.assets = { logo_header: icon(context.tenant.locationId) };
    if (state === "loading") context.loading = true; else context.readiness = state;
    const link = document.createElement("link"); link.rel = "icon"; link.href = "/favicon.svg"; document.head.append(link);
    renderMetadata(); expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });
  it("preserves the non-customer favicon", () => {
    const link = document.createElement("link"); link.rel = "icon"; link.href = "/favicon.svg"; document.head.append(link);
    renderMetadata(); expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
  });
});
