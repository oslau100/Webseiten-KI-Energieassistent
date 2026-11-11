import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import Tarif from "./Tarif";

const mockTenant = vi.hoisted(() => ({ customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" }));

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    content: { i18n: {} },
    tenant: mockTenant,
    design: {},
    getText: (_path: string, fallback: string) => fallback,
    getArray: (_path: string, fallback: unknown[]) => fallback,
  }),
}));

vi.mock("@/components/TarifCallbackSection", () => ({ TarifCallbackSection: () => <section data-testid="callback-section" /> }));
vi.mock("@/components/SimpleFooter", () => ({
  SimpleFooter: ({ preview = false }: { preview?: boolean }) => <footer data-preview={preview} />,
}));

const offerUuid = "550e8400-e29b-41d4-a716-446655440000";
const submissionId = "survey-submission-7";

const renderTarif = (query: string) => render(
  <MemoryRouter initialEntries={[`/tarif${query}`]}>
    <I18nProvider><Tarif /></I18nProvider>
  </MemoryRouter>,
);

const postOfferRendered = (
  iframe: HTMLIFrameElement,
  { origin = window.location.origin, source = iframe.contentWindow, uuid = offerUuid, submission = submissionId } = {},
) => {
  window.dispatchEvent(new MessageEvent("message", {
    origin,
    source,
    data: { type: "oecher:offer-rendered", uuid, submissionId: submission },
  }));
};

describe("Öcher offer bridge", () => {
  beforeEach(() => {
    mockTenant.customer = "oecher";
    localStorage.clear();
    sessionStorage.clear();
    delete (window as Window & { fbq?: unknown }).fbq;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("preserves the /tarif query, requires All consent, validates the iframe, and deduplicates reloads", async () => {
    const fbq = vi.fn();
    (window as Window & { fbq?: typeof fbq }).fbq = fbq;
    localStorage.setItem("cookie-consent", "essential");
    sessionStorage.setItem("oecher-survey-started-at", String(Date.now()));

    const first = renderTarif(`?uuid=${offerUuid}&lang=en&utm_source=synthetic&fbclid=synthetic-click`);
    const iframe = document.querySelector("iframe")!;
    const iframeUrl = new URL(iframe.src);
    expect(iframeUrl.pathname).toBe("/loaders/tarif.html");
    expect(iframeUrl.searchParams.get("uuid")).toBe(offerUuid);
    expect(iframeUrl.searchParams.get("lang")).toBe("en");
    expect(iframeUrl.searchParams.get("utm_source")).toBe("synthetic");
    expect(iframeUrl.searchParams.get("fbclid")).toBe("synthetic-click");

    postOfferRendered(iframe, { origin: "https://foreign.example" });
    postOfferRendered(iframe, { source: window });
    postOfferRendered(iframe, { uuid: "550e8400-e29b-41d4-a716-446655440001" });
    postOfferRendered(iframe);
    expect(fbq).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());

    localStorage.setItem("cookie-consent", "all");
    window.dispatchEvent(new Event("oecher:marketing-consent-updated"));
    await waitFor(() => expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      {},
      { eventID: `oecher-${offerUuid}` },
    ));
    expect(localStorage.getItem(`oecher-meta-lead-v1:${offerUuid}`)).toBe("sent");
    first.unmount();

    const second = renderTarif(`?uuid=${offerUuid}&lang=en`);
    postOfferRendered(document.querySelector("iframe")!);
    await waitFor(() => expect(document.querySelector("iframe")).toBeInTheDocument());
    expect(fbq.mock.calls.filter(([command, event]) => command === "track" && event === "Lead")).toHaveLength(1);
    second.unmount();
  });

  it("accepts a matching submission_id when the route has no uuid", async () => {
    const fbq = vi.fn();
    (window as Window & { fbq?: typeof fbq }).fbq = fbq;
    localStorage.setItem("cookie-consent", "all");
    sessionStorage.setItem("oecher-survey-started-at", String(Date.now()));

    renderTarif(`?submission_id=${submissionId}&lang=de`);
    const iframe = document.querySelector("iframe")!;
    const iframeUrl = new URL(iframe.src);
    expect(iframeUrl.searchParams.get("submission_id")).toBe(submissionId);
    postOfferRendered(iframe, { submission: "different-submission" });
    expect(fbq).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());
    postOfferRendered(iframe);

    await waitFor(() => expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      {},
      { eventID: `oecher-${offerUuid}` },
    ));
  });

  it("does not bind an Öcher Lead event on another tenant", () => {
    mockTenant.customer = "ehiogie";
    const fbq = vi.fn();
    (window as Window & { fbq?: typeof fbq }).fbq = fbq;
    localStorage.setItem("cookie-consent", "all");
    sessionStorage.setItem("oecher-survey-started-at", String(Date.now()));

    renderTarif(`?uuid=${offerUuid}&lang=de`);
    const iframe = document.querySelector("iframe")!;
    postOfferRendered(iframe);
    act(() => {
      window.dispatchEvent(new MessageEvent("message", {
        origin: window.location.origin,
        source: iframe.contentWindow,
        data: { type: "oecher:offer-view-state", stage: "preview" },
      }));
    });

    expect(fbq).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());
    expect(screen.getByTestId("callback-section")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-preview", "false");
  });

  it("does not flash the offer callback below the preview and accepts only same-frame view events", async () => {
    renderTarif(`?uuid=${offerUuid}`);
    const iframe = document.querySelector("iframe")!;
    const notify = (stage: string, source: Window | null, origin = window.location.origin) => act(() => {
      window.dispatchEvent(new MessageEvent("message", { source, origin, data: { type: "oecher:offer-view-state", stage } }));
    });
    expect(screen.queryByTestId("callback-section")).toBeNull();
    notify("offer", window);
    notify("offer", iframe.contentWindow, "https://foreign.example");
    expect(screen.queryByTestId("callback-section")).toBeNull();
    notify("preview", window);
    notify("preview", iframe.contentWindow, "https://foreign.example");
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-preview", "false");
    notify("preview", iframe.contentWindow);
    expect(screen.queryByTestId("callback-section")).toBeNull();
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-preview", "true");
    notify("offer", iframe.contentWindow);
    expect(await screen.findByTestId("callback-section")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-preview", "false");
    notify("preview", iframe.contentWindow);
    await waitFor(() => expect(screen.queryByTestId("callback-section")).toBeNull());
  });
});
