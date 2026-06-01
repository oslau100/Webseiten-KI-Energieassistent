import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customerDefaultWebsiteContentConfig } from "./customerDefaults";
import {
  defaultWebsiteContentConfig,
  defaultWebsiteDesignConfig,
  defaultWebsiteLayoutConfig,
  WebsiteConfigProvider,
  useWebsiteConfig,
} from "./websiteConfig";

type BootstrapWindow = Window & {
  TB_BOOTSTRAP?: Record<string, string>;
};

const originalLocation = window.location.href;

const RuntimeProbe = () => {
  const config = useWebsiteConfig();

  return (
    <output data-testid="runtime-contract">
      {JSON.stringify({
        loading: config.loading,
        source: config.source,
        brandName: config.getText("brand.name", "missing"),
        primary: (config.design.colors as Record<string, string>).primary,
        homeSections: config.getArray<string>("sections.faq.home_items", []).length,
        layoutHomeSections: ((config.layout.pages as Record<string, { sections?: string[] }>).home.sections || []).join(","),
      })}
    </output>
  );
};

const renderRuntimeProbe = () =>
  render(
    <WebsiteConfigProvider>
      <RuntimeProbe />
    </WebsiteConfigProvider>,
  );

const readRuntimeProbe = async () => {
  await waitFor(() => expect(JSON.parse(screen.getByTestId("runtime-contract").textContent || "{}").loading).toBe(false));
  return JSON.parse(screen.getByTestId("runtime-contract").textContent || "{}") as Record<string, unknown>;
};

const setLocation = (url: string) => {
  window.history.pushState({}, "", url);
};

describe("Kromen runtime/config contracts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as BootstrapWindow).TB_BOOTSTRAP;
    setLocation("/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as BootstrapWindow).TB_BOOTSTRAP;
    setLocation(originalLocation);
  });

  it("keeps query parameters ahead of TB_BOOTSTRAP ahead of built-in defaults", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          webseite_content_config: { brand: { name: "Query Remote" } },
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    (window as BootstrapWindow).TB_BOOTSTRAP = {
      locationId: "bootstrap-location",
      supabaseUrl: "https://bootstrap.supabase.test",
      supabaseKey: "bootstrap-key",
    };
    setLocation("/?location_id=query-location&supabase_url=https%3A%2F%2Fquery.supabase.test&supabase_key=query-key");

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.source).toBe("remote");
    expect(state.brandName).toBe("Query Remote");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://query.supabase.test/rest/v1/kunden_config?select=webseite_design_config,webseite_content_config,webseite_layout_config&location_id=eq.query-location&limit=1",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: {
        apikey: "query-key",
        Authorization: "Bearer query-key",
      },
    });
  });

  it("uses TB_BOOTSTRAP for remote loading when query parameters are absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          webseite_design_config: { colors: { primary: "#123456" } },
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    (window as BootstrapWindow).TB_BOOTSTRAP = {
      locationId: "bootstrap-location",
      supabaseUrl: "https://bootstrap.supabase.test",
      supabaseKey: "bootstrap-key",
    };

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.source).toBe("remote");
    expect(state.primary).toBe("#123456");
    expect(fetchMock.mock.calls[0][0]).toContain("https://bootstrap.supabase.test/rest/v1/kunden_config");
    expect(fetchMock.mock.calls[0][0]).toContain("location_id=eq.bootstrap-location");
  });

  it("falls back cleanly to Kromen defaults when no remote config row exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );

    (window as BootstrapWindow).TB_BOOTSTRAP = {
      locationId: "missing-remote-config",
      supabaseUrl: "https://bootstrap.supabase.test",
      supabaseKey: "bootstrap-key",
    };

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.source).toBe("fallback");
    expect(state.brandName).toBe("Kromen Energieassistent");
    expect(state.primary).toBe("#16a34a");
  });

  it("does not fetch and remains on fallback defaults when query and TB_BOOTSTRAP are absent", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(state.source).toBe("fallback");
    expect(state.brandName).toBe("Kromen Energieassistent");
  });

  it("keeps Kromen default exports aligned with customerDefaults without mutating values", () => {
    expect(defaultWebsiteContentConfig).toEqual(customerDefaultWebsiteContentConfig);
    expect(defaultWebsiteContentConfig).toMatchObject({
      brand: {
        name: "Kromen Energieassistent",
        contact_email: "info@kromen-energieassistent.de",
        agency_url: "https://www.laurent-digital.de",
      },
      legal: {
        variables: {
          firma: "Kromen Energieassistent",
          inhaber: "Marcel Kromen",
          strasse: "Kavenstr. 10",
          plz: "52072",
          ort: "Aachen",
          land: "Deutschland",
          email: "info@kromen-energieassistent.de",
          telefon: "015214008825",
          stand: "April 2026",
        },
      },
    });
    expect(defaultWebsiteDesignConfig).toMatchObject({
      colors: {
        primary: "#16a34a",
        text: "#0f172a",
        mutedText: "#64748b",
        background: "#ffffff",
      },
    });
    expect(defaultWebsiteLayoutConfig).toMatchObject({
      pages: {
        home: {
          sections: ["header", "hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "about", "stats", "faq", "footer"],
        },
        annual: {
          sections: ["header", "hero", "process", "why", "value", "comparison", "testimonials", "about", "stats", "faq", "final_cta", "footer"],
        },
      },
    });
  });
});
