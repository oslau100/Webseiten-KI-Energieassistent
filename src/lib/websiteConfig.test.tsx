import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebsiteConfigProvider, useWebsiteConfig } from "./websiteConfig";

const Consumer = () => {
  const { getText } = useWebsiteConfig();
  return <div>{getText("brand.name", "Fallback Brand")}</div>;
};

describe("WebsiteConfigProvider runtime config", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    delete (window as Window & { TB_BOOTSTRAP?: unknown }).TB_BOOTSTRAP;
  });

  it("keeps reading legacy query parameters before bootstrap values", async () => {
    window.history.replaceState(
      {},
      "",
      "/?location_id=query-location&supabase_url=https%3A%2F%2Fquery.supabase.co&supabase_key=query-key",
    );
    (window as Window & { TB_BOOTSTRAP?: unknown }).TB_BOOTSTRAP = {
      locationId: "bootstrap-location",
      supabaseUrl: "https://bootstrap.supabase.co",
      supabaseKey: "bootstrap-key",
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          webseite_content_config: {
            brand: {
              name: "Query Brand",
            },
          },
        },
      ],
    } as Response);

    render(
      <WebsiteConfigProvider>
        <Consumer />
      </WebsiteConfigProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(String(endpoint)).toContain("https://query.supabase.co/rest/v1/kunden_config");
    expect(String(endpoint)).toContain("location_id=eq.query-location");
    expect((options as RequestInit).headers).toMatchObject({
      apikey: "query-key",
      Authorization: "Bearer query-key",
    });
  });
});
