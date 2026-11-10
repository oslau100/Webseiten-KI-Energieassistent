import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CookieBar } from "./CookieBar";
import { Footer } from "./Footer";
import { I18nProvider } from "@/lib/i18n";

const mockTenant = vi.hoisted(() => ({ customer: "oecher", locationId: "uuDEvEGcyd3mMiKWKH4Z" }));

vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({
    content: { i18n: {} },
    tenant: mockTenant,
    design: { colors: { primary: "#FFBD59" } },
    getText: (_path: string, fallback: string) => fallback,
  }),
}));

const renderCookieSettings = () => render(
  <MemoryRouter>
    <I18nProvider>
      <CookieBar />
      <Footer />
    </I18nProvider>
  </MemoryRouter>,
);

describe("Öcher marketing consent", () => {
  beforeEach(() => {
    mockTenant.customer = "oecher";
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "cookie-consent=; Max-Age=0; Path=/";
    delete (window as Window & { fbq?: unknown }).fbq;
    delete (window as Window & { _fbq?: unknown })._fbq;
    delete (window as Window & { gtag?: unknown }).gtag;
    document.getElementById("oecher-meta-pixel")?.remove();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not install Meta before consent and saves Essential as denied", async () => {
    const gtag = vi.fn();
    (window as Window & { gtag?: typeof gtag }).gtag = gtag;
    renderCookieSettings();

    expect(await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeVisible();
    expect(document.getElementById("oecher-meta-pixel")).toBeNull();
    expect((window as Window & { fbq?: unknown }).fbq).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));

    expect(localStorage.getItem("cookie-consent")).toBe("essential");
    expect(document.getElementById("oecher-meta-pixel")).toBeNull();
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    }));
  });

  it("allows All after explicit choice and lets a visitor revoke it later", async () => {
    const gtag = vi.fn();
    (window as Window & { gtag?: typeof gtag }).gtag = gtag;
    renderCookieSettings();

    await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" });
    fireEvent.click(screen.getByRole("button", { name: "Alles akzeptieren" }));

    const fbq = (window as unknown as Window & { fbq: { queue: unknown[][] } }).fbq;
    expect(localStorage.getItem("cookie-consent")).toBe("all");
    expect(document.getElementById("oecher-meta-pixel")).toBeInTheDocument();
    expect(fbq.queue).toContainEqual(["init", "29052911387700886"]);
    expect(fbq.queue).toContainEqual(["track", "PageView"]);
    expect(gtag).toHaveBeenLastCalledWith("consent", "update", expect.objectContaining({ ad_storage: "granted" }));

    fireEvent.click(screen.getByRole("button", { name: "Cookie-Einstellungen" }));
    expect(await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeVisible();
    const marketingSwitch = screen.getAllByRole("switch")[0];
    expect(marketingSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(marketingSwitch);
    fireEvent.click(screen.getByRole("button", { name: "Einstellungen speichern" }));

    expect(localStorage.getItem("cookie-consent")).toBe("essential");
    expect(fbq.queue).toContainEqual(["consent", "revoke"]);
    expect(gtag).toHaveBeenLastCalledWith("consent", "update", expect.objectContaining({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    }));
  });

  it("does not load the Öcher Pixel for another tenant", async () => {
    mockTenant.customer = "ehiogie";
    const gtag = vi.fn();
    (window as Window & { gtag?: typeof gtag }).gtag = gtag;
    renderCookieSettings();

    await screen.findByRole("heading", { name: "Privatsphäre-Einstellungen" });
    fireEvent.click(screen.getByRole("button", { name: "Alles akzeptieren" }));

    expect(localStorage.getItem("cookie-consent")).toBe("all");
    expect(document.getElementById("oecher-meta-pixel")).toBeNull();
    expect((window as Window & { fbq?: unknown }).fbq).toBeUndefined();
    expect(gtag).not.toHaveBeenCalled();
  });

  it.each(["all", "essential"])("leaves Ehiogie marketing untouched when replaying stored %s consent", consentValue => {
    mockTenant.customer = "ehiogie";
    const gtag = vi.fn(), fbq = vi.fn();
    Object.assign(window, { gtag, fbq }); localStorage.setItem("cookie-consent", consentValue);
    renderCookieSettings();
    expect(gtag).not.toHaveBeenCalled(); expect(fbq).not.toHaveBeenCalled();
    expect(document.getElementById("oecher-meta-pixel")).toBeNull();
  });
});
