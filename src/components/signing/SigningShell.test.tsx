import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, LANGUAGES } from "@/lib/i18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";
import { customerRuntimeBindings } from "@/lib/customerRuntime";
import { resolveSigningBrand } from "@/lib/signing/brand";
import * as contract from "@/lib/signing/contract";
import { SigningShell, type SigningPresentation } from "./SigningShell";
import { signingBrandFixture, signingFixture } from "@/test/signingFixtures";
import { signingTranslations } from "@/lib/signing/i18n";
import Signing from "@/pages/Signing";
import { SignaturePad } from "./SignaturePad";
import { useState } from "react";

const originalWindowUrl = window.URL;
const originalGlobalUrl = globalThis.URL;

function Wrapper({ children, lang = "de" }: { children: React.ReactNode; lang?: string }) {
  return <MemoryRouter initialEntries={[`/signing?lang=${lang}`]}><WebsiteConfigProvider><I18nProvider>{children}</I18nProvider></WebsiteConfigProvider></MemoryRouter>;
}
function review(brand: contract.BrandKey = "demo"): Extract<SigningPresentation, { status: "review" }> {
  return { status: "review", manifest: signingFixture(brand), pdf: new Blob(["TEST_ONLY"], { type: "application/pdf" }),
    brand: resolveSigningBrand(brand, signingBrandFixture(brand), brand === "tarivia" ? customerRuntimeBindings[1].locationId : brand === "oecher" ? customerRuntimeBindings[0].locationId : undefined)! };
}
beforeEach(() => {
  vi.stubEnv("VITE_LOCATION_ID", ""); vi.stubEnv("VITE_SUPABASE_ANON_KEY", ""); vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
  delete window.TB_BOOTSTRAP;
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("No network in isolated UI tests"));
  // Byte verification is covered by the real offline contract test. These tests exercise React UI.
  vi.spyOn(contract, "verifyPrivatePdf").mockResolvedValue(true);
  const signingTestUrl = class extends originalGlobalUrl { static createObjectURL = vi.fn(() => "blob:synthetic-pdf"); static revokeObjectURL = vi.fn(); };
  Object.defineProperty(globalThis, "URL", { configurable: true, writable: true, value: signingTestUrl });
  Object.defineProperty(window, "URL", { configurable: true, writable: true, value: signingTestUrl });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  localStorage.clear();
});
afterAll(() => {
  Object.defineProperty(globalThis, "URL", { configurable: true, writable: true, value: originalGlobalUrl });
  Object.defineProperty(window, "URL", { configurable: true, writable: true, value: originalWindowUrl });
});

describe("isolated signing UI; never a live contract", () => {
  for (const brand of ["tarivia", "oecher", "demo", "ehiogie"] as const) for (const { code } of LANGUAGES) {
    it(`${brand}/${code} keeps locale, RTL, original declarations and submit lock`, async () => {
      const state = review(brand);
      const { container } = render(<Wrapper lang={code}><SigningShell state={state} /></Wrapper>);
      await screen.findByTitle(signingTranslations[code].signing_document);
      expect(container.querySelector("[data-signing-shell]")).toHaveAttribute("dir", code === "ar" ? "rtl" : "ltr");
      expect(screen.getByRole("combobox")).toHaveValue(code);
      expect(screen.getByText(state.manifest.requirements[0].text)).toHaveAttribute("translate", "no");
      expect(screen.getByRole("button", { name: signingTranslations[code].signing_title })).toBeDisabled();
      expect(screen.getByText("DEMO / TEST_ONLY")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: signingTranslations[code].signing_privacy })).toHaveAttribute("href", `/datenschutz?lang=${code}`);
      expect(fetch).not.toHaveBeenCalled();
    });
  }
  it.each(["unauthorized", "expired", "superseded", "invalidated", "pdf_missing", "failed", "already_finalized", "not_wired"] as const)("%s never mounts capture or a PDF", reason => {
    const { container } = render(<Wrapper><SigningShell state={{ status: "unavailable", reason }} /></Wrapper>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("keeps the public route unavailable despite browser state", async () => {
    localStorage.setItem("signing_authorized", "true");
    window.dispatchEvent(new MessageEvent("message", { data: { authorized: true, status: "SIGNED" } }));
    render(<Wrapper><Signing /></Wrapper>);
    expect(await screen.findByText(signingTranslations.de.signing_unavailable)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("invalid PDF bytes disable all capture", async () => {
    vi.mocked(contract.verifyPrivatePdf).mockResolvedValue(false);
    render(<Wrapper><SigningShell state={review()} /></Wrapper>);
    expect(await screen.findByText(signingTranslations.de.signing_failed)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("separates declarations and switches person only after explicit handover", async () => {
    const state = review();
    render(<Wrapper><SigningShell state={state} /></Wrapper>);
    await screen.findByTitle(signingTranslations.de.signing_document);
    const checks = screen.getAllByRole("checkbox");
    fireEvent.click(checks[1]);
    expect(checks[1]).toBeChecked(); expect(checks[2]).not.toBeChecked();
    expect(screen.getByRole("button", { name: signingTranslations.de.signing_continue })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /TEST PERSON B/ }));
    expect(screen.queryByRole("checkbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Gerät übernehmen/ }));
    expect(screen.getByText(state.manifest.requirements[2].text)).toBeInTheDocument();
    expect(screen.queryByText(state.manifest.requirements[0].text)).toBeNull();
    expect(screen.getAllByRole("checkbox").every(input => !(input as HTMLInputElement).checked)).toBe(true);
  });
  it("zooms only the viewer, preserves document bytes and changes language through existing i18n", async () => {
    const state = review();
    render(<Wrapper><SigningShell state={state} /></Wrapper>);
    const viewer = await screen.findByTitle(signingTranslations.de.signing_document);
    fireEvent.click(screen.getByRole("button", { name: signingTranslations.de.signing_zoomIn }));
    expect(viewer).toHaveAttribute("src", "blob:synthetic-pdf#zoom=125");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ar" } });
    await waitFor(() => expect(document.documentElement.dir).toBe("rtl"));
    expect(localStorage.getItem("site_lang")).toBe("ar");
    expect(screen.getByText(state.manifest.requirements[0].text)).toHaveAttribute("lang", "de");
  });
  it("resets confirmations when any manifest binding changes and revokes URLs on exit", async () => {
    const state = review();
    const { rerender, unmount } = render(<Wrapper><SigningShell state={state} /></Wrapper>);
    await screen.findByTitle(signingTranslations.de.signing_document);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    const changed = { ...state, manifest: { ...state.manifest, snapshotHash: "b".repeat(64) } };
    rerender(<Wrapper><SigningShell state={changed} /></Wrapper>);
    await screen.findByTitle(signingTranslations.de.signing_document);
    expect(screen.getAllByRole("checkbox")[1]).not.toBeChecked();
    unmount(); expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:synthetic-pdf");
  });
  it("expires while open and removes PDF and controls", async () => {
    const state = review();
    state.manifest.expiresAt = new Date(Date.now() + 10000).toISOString();
    const { container } = render(<Wrapper><SigningShell state={state} /></Wrapper>);
    await screen.findByTitle(signingTranslations.de.signing_document);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 20000);
    act(() => { window.dispatchEvent(new Event("focus")); });
    expect(screen.getByText(signingTranslations.de.signing_expired)).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    vi.useRealTimers();
  });
  it("clear button removes the personal drawing", () => {
    function Pad() {
      const [strokes, setStrokes] = useState<contract.SignatureStroke[]>([[[0,0],[100,50]]]);
      return <SignaturePad label="TEST_ONLY" strokes={strokes} onChange={setStrokes} />;
    }
    const { container } = render(<Wrapper><Pad /></Wrapper>);
    expect(container.querySelectorAll("polyline")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: signingTranslations.de.signing_clear }));
    expect(container.querySelectorAll("polyline")).toHaveLength(0);
  });
});
