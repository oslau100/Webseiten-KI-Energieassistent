import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, LANGUAGES, useI18n } from "./i18n";

vi.mock("./websiteConfig", () => ({ useWebsiteConfig: () => ({ content: {} }) }));
const Probe = () => <output>{useI18n().lang}</output>;
const mount = (path = "/") => render(<MemoryRouter initialEntries={[path]}><I18nProvider><Probe /></I18nProvider></MemoryRouter>);
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("language preferences", () => {
  it("does not persist an unrequested default", () => {
    mount();
    expect(screen.getByText("de")).toBeInTheDocument();
    expect(localStorage.getItem("site_lang")).toBeNull();
  });
  it("persists a selected language without adding an expiry", async () => {
    mount("/?lang=en");
    await waitFor(() => expect(screen.getByText("en")).toBeInTheDocument());
    expect(localStorage.getItem("site_lang")).toBe("en");
  });
  it("retains the stored preference", async () => {
    localStorage.setItem("site_lang", "tr");
    mount();
    await waitFor(() => expect(screen.getByText("tr")).toBeInTheDocument());
  });
  it("works with blocked browser storage", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    mount("/?lang=en");
    await waitFor(() => expect(screen.getByText("en")).toBeInTheDocument());
  });
  it("uses self-contained language icons without optional network requests", () => {
    expect(LANGUAGES.every(language => language.flagUrl.startsWith("data:image/svg+xml,"))).toBe(true);
  });
});
