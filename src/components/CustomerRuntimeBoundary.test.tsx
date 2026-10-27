import App from "@/App";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebsiteConfigProvider, useWebsiteConfig } from "@/lib/websiteConfig";
import { customerRuntimeBindings } from "@/lib/customerRuntime";
import { CustomerRuntimeBoundary } from "./CustomerRuntimeBoundary";

const supplied = (locationId: string) => ({ location_id: locationId,
  webseite_content_config: { brand: { name: "Fixture only" }, legal: { ready: true, variables: { firma: "Fixture", email: "fixture@example.test" } } },
  webseite_design_config: { assets: { logo_header: "/fixture.svg", logo_footer: "/fixture.svg", hero_image: "/fixture.png" } },
  webseite_layout_config: { pages: {}, features: { start_survey: false, rechnung_survey: false } },
});
const Consumer = () => {
  const { getText, getArray, source } = useWebsiteConfig();
  return <output>{source}:{getText("brand.name", "Invented brand")}:{getText("missing", "Invented fact")}:{getArray("missing", ["Fake review"]).join()}</output>;
};
const Probe = () => {
  const { loading, readiness, notReadyReason } = useWebsiteConfig();
  return <output data-testid="state">{String(loading)}:{readiness}:{notReadyReason}</output>;
};
function mount(locationId: string, rows: unknown, path = "/", development = true) {
  vi.stubEnv("VITE_LOCATION_ID", locationId);
  vi.stubEnv("DEV", development);
  window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
  history.replaceState({}, "", path);
  const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(rows instanceof Response ? rows : new Response(JSON.stringify(rows)));
  render(<BrowserRouter><WebsiteConfigProvider><Probe /><CustomerRuntimeBoundary><Consumer /></CustomerRuntimeBoundary></WebsiteConfigProvider></BrowserRouter>);
  return fetcher;
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); delete window.TB_BOOTSTRAP; history.replaceState({}, "", "/"); });
describe("customer page and funnel boundaries", () => {
  for (const { locationId } of customerRuntimeBindings) {
    it(`consumes only the matching ${locationId} config without repository fallback`, async () => {
      const fetcher = mount(locationId, [supplied(locationId)]);
      expect(screen.getByText("NOT_READY")).toBeInTheDocument();
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(screen.getByText("supabase:Fixture only::")).toBeInTheDocument();
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher.mock.calls[0][0]).toContain(`location_id=eq.${locationId}`);
    });
    it.each(["/start", "/rechnung", "/rechnung-fehler", "/rueckruf", "/rueckruf-buchen"])(`opens configured survey and callback route %s for ${locationId}`, async path => {
      const row = supplied(locationId);
      row.webseite_layout_config.features = { start_survey: true, rechnung_survey: true };
      mount(locationId, [row], path);
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(screen.getByText("supabase:Fixture only::")).toBeInTheDocument();
      expect(screen.queryByText("NOT_READY")).toBeNull();
    });
    it.each(["/start", "/rechnung"])(`blocks missing feature config for ${locationId}: %s`, async path => {
      const row = { ...supplied(locationId), webseite_layout_config: { pages: {} } };
      mount(locationId, [row], path);
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(document.querySelector("main[role=status]")).toHaveAttribute("data-reason", "TRANSPORT_NOT_READY");
      expect(screen.queryByText(/Fixture only/)).toBeNull();
    });
    it(`keeps order flag ineffective for ${locationId}`, async () => {
      const row = { ...supplied(locationId), webseite_layout_config: { pages: {}, features: { order_funnel: true } } };
      mount(locationId, [row], "/auftrag");
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(document.querySelector("main[role=status]")).toHaveAttribute("data-reason", "TRANSPORT_NOT_READY");
    });
    it.each(["/rechnung-eingegangen", "/rechnung-eingegangen?receipt=fake&uuid=123"])(`requires a server receipt for ${locationId}: %s`, async path => {
      const row = supplied(locationId);
      row.webseite_layout_config.features.rechnung_survey = true;
      mount(locationId, [row], path);
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(document.querySelector("main[role=status]")).toHaveAttribute("data-reason", "RECEIPT_NOT_READY");
      expect(screen.queryByText(/Fixture only/)).toBeNull();
    });
    it.each([[], [{}], [supplied("wrong-tenant")]])(`keeps absent or cross-tenant rows NOT_READY for ${locationId}`, async rows => {
      mount(locationId, rows);
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:NOT_READY"));
      expect(screen.getByText("NOT_READY")).toBeInTheDocument();
      expect(screen.queryByText(/Invented/)).not.toBeInTheDocument();
    });
    it.each(["/start?uuid=123", "/tarif?uuid=123", "/auftrag?uuid=123", "/rechnung", "/uebermittelt"])(`keeps dormant funnel entry %s blocked for ${locationId}`, async path => {
      mount(locationId, [supplied(locationId)], path);
      await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:READY"));
      expect(screen.getByText("NOT_READY")).toBeInTheDocument();
      expect(screen.queryByText(/Fixture only/)).not.toBeInTheDocument();
    });
  }
  it.each([new Response("unavailable", { status: 503 }), new Response("not-json"), new Response("{}")])("withholds customer content on failed or malformed config responses", async response => {
    mount(customerRuntimeBindings[0].locationId, response);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:NOT_READY"));
    expect(screen.getByText("NOT_READY")).toBeInTheDocument();
  });
  it.each(["legal", "assets", "content"])("keeps missing %s prerequisites out of customer pages", async missing => {
    const locationId = customerRuntimeBindings[0].locationId;
    const row = supplied(locationId);
    if (missing === "legal") row.webseite_content_config.legal.ready = false;
    if (missing === "assets") row.webseite_design_config.assets.hero_image = "";
    if (missing === "content") Object.assign(row, { webseite_content_config: {} });
    mount(locationId, [row]);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:NOT_READY"));
    expect(screen.getByText("NOT_READY")).toBeInTheDocument();
    expect(document.title).toBe("NOT_READY");
    expect(screen.queryByText(/Fixture only/)).not.toBeInTheDocument();
  });
  it.each(["/start", "/tarif", "/auftrag", "/signing", "/signing/"])("guards the actual App funnel route %s after valid config", async path => {
    const locationId = customerRuntimeBindings[0].locationId;
    vi.stubEnv("VITE_LOCATION_ID", locationId);
    vi.stubEnv("DEV", true);
    window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
    history.replaceState({}, "", `${path}?uuid=123`);
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([supplied(locationId)])));
    const { container } = render(<App />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false"));
    expect(document.querySelector("main[role=status]")).toHaveAttribute("data-reason", "TRANSPORT_NOT_READY");
    expect(container.querySelector("iframe")).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not consume config when runtime hostname identity fails", async () => {
    const fetcher = mount(customerRuntimeBindings[0].locationId, [], "/", false);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false:NOT_READY:IDENTITY_NOT_READY"));
    expect(fetcher).not.toHaveBeenCalled();
  });
});
