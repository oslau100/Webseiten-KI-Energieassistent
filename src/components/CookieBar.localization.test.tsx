import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CookieBar } from "./CookieBar";
import { I18nProvider, LANGUAGES } from "@/lib/i18n";
import catalog from "@/lib/oecherPublicTranslations";
vi.mock("@/lib/websiteConfig", () => ({
  useWebsiteConfig: () => ({ content: { i18n: {} }, tenant: { customer: "oecher" }, design: {},
    getText: (path: string, fallback: string) => path === "brand.name" ? "Öcher Strom" : fallback }),
}));
beforeEach(() => { localStorage.clear(); document.cookie = "cookie-consent=; Max-Age=0; Path=/"; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("Öcher cookie dialog on legal pages", () => {
  it.each(LANGUAGES)("localizes in $code without observing the legal page or loading a translator", async ({ code }) => {
    render(<MemoryRouter initialEntries={[`/datenschutz?lang=${code}`]}><I18nProvider>
      <main>Rechtlicher Originaltext bleibt unverändert.</main><CookieBar />
    </I18nProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("button", { name: catalog["Einstellungen speichern"][code] })).toBeInTheDocument());
    expect(screen.getByRole("dialog")).toHaveAccessibleName(catalog["Privatsphäre-Einstellungen"][code]);
    expect(screen.getByRole("button", { name: catalog["Alles akzeptieren"][code] })).toBeInTheDocument();
    expect(screen.getByText("Öcher Strom")).toBeInTheDocument();
    expect(screen.getByText("Rechtlicher Originaltext bleibt unverändert.")).toBeInTheDocument();
    expect(screen.getAllByRole("link").every(link => link.getAttribute("href")?.includes(`lang=${code}`))).toBe(true);
    expect(document.querySelector('script[src*="translate"]')).toBeNull();
  });
});
