import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebsiteConfigProvider, useWebsiteConfig } from "./websiteConfig";

const Consumer = () => {
  const { getText, tenant, loading, source } = useWebsiteConfig();
  return <div data-location={tenant.locationId} data-loading={loading} data-source={source}>{getText("brand.name", "Fallback Brand")}</div>;
};
const renderConfig = () => render(<WebsiteConfigProvider><Consumer /></WebsiteConfigProvider>);
const configure = (locationId?: string) => {
  window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://configured.supabase.co", supabaseKey: "sb_publishable_test" };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.history.replaceState({}, "", "/");
  delete window.TB_BOOTSTRAP;
});

describe("WebsiteConfigProvider runtime config", () => {
  it("does not fetch any tenant when no Location exists, even with a public key", async () => {
    configure();
    vi.stubEnv("VITE_LOCATION_ID", "");
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderConfig();
    await waitFor(() => expect(screen.getByText("Energieassistent")).toHaveAttribute("data-loading", "false"));
    expect(screen.getByText("Energieassistent")).toHaveAttribute("data-location", "");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the explicit Location with the existing three config buckets and merges neutral fallbacks", async () => {
    configure("configured-location");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{
      webseite_content_config: { brand: { name: "Configured Brand" } },
      webseite_design_config: { colors: { primary: "#123456" } },
      webseite_layout_config: { pages: { home: { sections: ["hero"] } } },
    }])));
    renderConfig();
    const brand = await screen.findByText("Configured Brand");
    expect(brand).toHaveAttribute("data-location", "configured-location");
    expect(brand).toHaveAttribute("data-source", "supabase");
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(String(endpoint)).toContain("select=webseite_design_config,webseite_content_config,webseite_layout_config");
    expect(String(endpoint)).toContain("location_id=eq.configured-location&limit=1");
    expect(options.headers).toEqual({ apikey: "sb_publishable_test" });
    expect(document.documentElement.style.getPropertyValue("--website-primary")).toBe("#123456");
  });

  it("ignores production query overrides for Location, endpoint, and key", async () => {
    vi.stubEnv("DEV", false);
    configure("bootstrap-location");
    history.replaceState({}, "", "/?location_id=other-location&supabase_url=https://other.test&supabase_key=sb_publishable_other");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("[]"));
    renderConfig();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(String(fetchMock.mock.calls[0][0])).toContain("https://configured.supabase.co/rest/v1/kunden_config");
    expect(String(fetchMock.mock.calls[0][0])).toContain("location_id=eq.bootstrap-location");
  });

  it("uses a neutral fallback when the Location has no override or a request fails", async () => {
    configure("configured-location");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    renderConfig();
    await waitFor(() => expect(screen.getByText("Energieassistent")).toHaveAttribute("data-loading", "false"));
    expect(screen.getByText("Energieassistent")).toHaveAttribute("data-source", "fallback");
  });
});
