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
        jotformWidgetId: config.getText("integrations.google_reviews.jotform_widget_id", ""),
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
    vi.unstubAllEnvs();
    delete (window as BootstrapWindow).TB_BOOTSTRAP;
    setLocation("/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
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
      },
    });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
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

  it("loads remote config from VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ webseite_content_config: { brand: { name: "Environment Remote" } } }],
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_value");

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.source).toBe("remote");
    expect(state.brandName).toBe("Environment Remote");
    expect(fetchMock.mock.calls[0][0]).toContain("https://environment.supabase.test/rest/v1/kunden_config");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { apikey: "sb_publishable_test_value" } });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("uses VITE_SUPABASE_ANON_KEY as the legacy environment fallback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ webseite_content_config: {} }] });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test-signature");

    renderRuntimeProbe();
    await readRuntimeProbe();

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: {
        apikey: "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test-signature",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test-signature",
      },
    });
  });

  it("prefers the publishable environment key over the legacy anon key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ webseite_content_config: {} }] });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_value");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test-signature");

    renderRuntimeProbe();
    await readRuntimeProbe();

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { apikey: "sb_publishable_test_value" } });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("keeps query overrides ahead of bootstrap and environment configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ webseite_content_config: {} }] });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "environment-key");
    (window as BootstrapWindow).TB_BOOTSTRAP = { supabaseUrl: "https://bootstrap.supabase.test", supabaseKey: "bootstrap-key" };
    setLocation("/?supabase_url=https%3A%2F%2Fquery.supabase.test&supabase_key=query-key");

    renderRuntimeProbe();
    await readRuntimeProbe();

    expect(fetchMock.mock.calls[0][0]).toContain("https://query.supabase.test/rest/v1/kunden_config");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { apikey: "query-key" } });
  });

  it("keeps TB_BOOTSTRAP ahead of environment configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ webseite_content_config: {} }] });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "environment-key");
    (window as BootstrapWindow).TB_BOOTSTRAP = { supabaseUrl: "https://bootstrap.supabase.test", supabaseKey: "bootstrap-key" };

    renderRuntimeProbe();
    await readRuntimeProbe();

    expect(fetchMock.mock.calls[0][0]).toContain("https://bootstrap.supabase.test/rest/v1/kunden_config");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { apikey: "bootstrap-key" } });
  });

  it.each(["", "   ", "<SECRET>"])("does not fetch when the only key is an invalid public runtime value: %j", async (key) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", key);

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(state.source).toBe("fallback");
    expect(state.brandName).toBe("Kromen Energieassistent");
  });

  it("exposes the configured Jotform review widget ID from remote kunden_config", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ webseite_content_config: { integrations: { google_reviews: {
        jotform_widget_id: "019f893d595870008c4dd1e6ec285a30e32a",
      } } } }],
    }));
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "publishable-key");

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.jotformWidgetId).toBe("019f893d595870008c4dd1e6ec285a30e32a");
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

  it("falls back cleanly when the remote config request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    vi.stubEnv("VITE_SUPABASE_URL", "https://environment.supabase.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "publishable-key");

    renderRuntimeProbe();
    const state = await readRuntimeProbe();

    expect(state.source).toBe("fallback");
    expect(state.brandName).toBe("Kromen Energieassistent");
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
        agency_url: "",
      },
      integrations: {
        google_reviews: {
          jotform_widget_id: "",
        },
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
